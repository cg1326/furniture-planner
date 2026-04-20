import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';

// IndexedDB storage adapter — avoids the ~5 MB localStorage quota limit
const idbStorage = {
  async getItem(name: string): Promise<StorageValue<unknown> | null> {
    return new Promise((resolve) => {
      const req = indexedDB.open('furniture-planner-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('store');
      req.onsuccess = () => {
        const tx = req.result.transaction('store', 'readonly');
        const get = tx.objectStore('store').get(name);
        get.onsuccess = () => resolve(get.result ?? null);
        get.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  },
  async setItem(name: string, value: StorageValue<unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('furniture-planner-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('store');
      req.onsuccess = () => {
        const tx = req.result.transaction('store', 'readwrite');
        tx.objectStore('store').put(value, name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  },
  async removeItem(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('furniture-planner-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('store');
      req.onsuccess = () => {
        const tx = req.result.transaction('store', 'readwrite');
        tx.objectStore('store').delete(name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  },
};
import { v4 as uuidv4 } from 'uuid';
import type { FurnitureItem, FurnitureTemplate, CustomFurnitureTemplate, ScaleUnit, SavedFloorplan } from '../types/models';
import { PIXELS_PER_FOOT } from '../constants/scale';
import { computeOverlaps } from '../utils/geometry';

interface CalibrationPoint { x: number; y: number; }

interface FloorplanStore {
  // Active floorplan image
  floorplanDataUrl: string | null;
  floorplanNaturalWidth: number;
  floorplanNaturalHeight: number;
  floorplanRealWidthFt: number;

  // Calibration ruler state (session-only)
  calibrationMode: boolean;
  calibrationPoints: CalibrationPoint[];

  // Furniture
  furniture: FurnitureItem[];
  selectedId: string | null;
  scaleUnit: ScaleUnit;
  stageScale: number;
  stageX: number;
  stageY: number;

  // Undo/redo history (session-only)
  past: FurnitureItem[][];
  future: FurnitureItem[][];

  // Saved floorplans
  savedFloorplans: SavedFloorplan[];
  activeFloorplanId: string | null;
  activeFloorplanName: string | null;
  saveError: string | null;

  // Floorplan image actions
  setFloorplanImage: (dataUrl: string, naturalWidth: number, naturalHeight: number) => void;
  clearFloorplanImage: () => void;

  // Scale actions
  setFloorplanRealWidthFt: (ft: number) => void;
  setFloorplanRealHeightFt: (ft: number) => void;
  applyCalibration: (canvasLen: number, realFt: number) => void;

  // Calibration mode
  startCalibration: () => void;
  addCalibrationPoint: (p: CalibrationPoint) => void;
  cancelCalibration: () => void;

  // Personal collection
  customCollection: CustomFurnitureTemplate[];
  saveToCollection: (item: FurnitureItem) => void;
  removeFromCollection: (id: string) => void;
  renameCollectionItem: (id: string, name: string) => void;
  updateCollectionItem: (id: string, patch: Partial<Pick<CustomFurnitureTemplate, 'widthFt' | 'heightFt'>>) => void;

  // Furniture actions
  addFurnitureFromTemplate: (template: FurnitureTemplate, x: number, y: number) => void;
  updateFurniture: (id: string, patch: Partial<FurnitureItem>) => void;
  deleteFurniture: (id: string) => void;
  recomputeOverlaps: () => void;

  // Selection
  setSelected: (id: string | null) => void;

  // Unit / view
  showDimensionLabels: boolean;
  toggleDimensionLabels: () => void;
  toggleScaleUnit: () => void;
  setStageTransform: (scale: number, x: number, y: number) => void;
  deleteSelected: () => void;

  // Undo / redo
  undo: () => void;
  redo: () => void;

  // Project save/load
  saveFloorplan: (name: string) => void;
  loadFloorplan: (id: string) => void;
  deleteFloorplan: (id: string) => void;
  renameFloorplan: (id: string, name: string) => void;
  newFloorplan: () => void;
  clearSaveError: () => void;
}

const MAX_HISTORY = 50;

export const useFloorplanStore = create<FloorplanStore>()(
  persist(
    (set, get) => {
      const pushHistory = () => {
        const { furniture, past } = get();
        set({ past: [...past.slice(-(MAX_HISTORY - 1)), furniture], future: [] });
      };

      return {
        floorplanDataUrl: null,
        floorplanNaturalWidth: 0,
        floorplanNaturalHeight: 0,
        floorplanRealWidthFt: 40,

        calibrationMode: false,
        calibrationPoints: [],

        customCollection: [],

        furniture: [],
        selectedId: null,
        scaleUnit: 'ft',
        showDimensionLabels: false,
        stageScale: 1,
        stageX: 40,
        stageY: 40,

        past: [],
        future: [],

        savedFloorplans: [],
        activeFloorplanId: null,
        activeFloorplanName: null,
        saveError: null,

        setFloorplanImage: (dataUrl, naturalWidth, naturalHeight) => {
          set({
            floorplanDataUrl: dataUrl,
            floorplanNaturalWidth: naturalWidth,
            floorplanNaturalHeight: naturalHeight,
            calibrationMode: false,
            calibrationPoints: [],
          });
        },

        clearFloorplanImage: () => {
          set({
            floorplanDataUrl: null,
            floorplanNaturalWidth: 0,
            floorplanNaturalHeight: 0,
            calibrationMode: false,
            calibrationPoints: [],
            furniture: [],
            selectedId: null,
            past: [],
            future: [],
          });
        },

        setFloorplanRealWidthFt: (ft) => set({ floorplanRealWidthFt: Math.max(1, ft) }),

        setFloorplanRealHeightFt: (ft) => {
          const { floorplanNaturalWidth, floorplanNaturalHeight } = get();
          if (!floorplanNaturalWidth || !floorplanNaturalHeight) return;
          const aspectRatio = floorplanNaturalWidth / floorplanNaturalHeight;
          set({ floorplanRealWidthFt: Math.max(1, ft * aspectRatio) });
        },

        applyCalibration: (canvasLen, realFt) => {
          const { floorplanRealWidthFt } = get();
          const newWidth = floorplanRealWidthFt * (realFt * PIXELS_PER_FOOT) / canvasLen;
          set({ floorplanRealWidthFt: Math.max(1, newWidth), calibrationMode: false, calibrationPoints: [] });
        },

        startCalibration: () => set({ calibrationMode: true, calibrationPoints: [], selectedId: null }),
        addCalibrationPoint: (p) => set((s) => ({ calibrationPoints: [...s.calibrationPoints, p].slice(0, 2) })),
        cancelCalibration: () => set({ calibrationMode: false, calibrationPoints: [] }),

        saveToCollection: (item) => {
          const entry: CustomFurnitureTemplate = {
            id: uuidv4(),
            name: item.name,
            widthFt: item.widthPx / PIXELS_PER_FOOT,
            heightFt: item.heightPx / PIXELS_PER_FOOT,
            color: item.color,
            strokeColor: item.strokeColor,
          };
          set((s) => ({ customCollection: [...s.customCollection, entry] }));
        },

        removeFromCollection: (id) => set((s) => ({ customCollection: s.customCollection.filter((c) => c.id !== id) })),

        renameCollectionItem: (id, name) => set((s) => ({
          customCollection: s.customCollection.map((c) => c.id === id ? { ...c, name } : c),
        })),

        updateCollectionItem: (id, patch) => set((s) => ({
          customCollection: s.customCollection.map((c) => c.id === id ? { ...c, ...patch } : c),
        })),

        addFurnitureFromTemplate: (template, x, y) => {
          pushHistory();
          const item: FurnitureItem = {
            id: uuidv4(),
            templateId: template.templateId,
            name: template.name,
            x, y,
            widthPx: Math.round(template.defaultWidthFt * PIXELS_PER_FOOT / 5) * 5,
            heightPx: Math.round(template.defaultHeightFt * PIXELS_PER_FOOT / 5) * 5,
            rotation: 0,
            color: template.color,
            strokeColor: template.strokeColor,
            isOverlapping: false,
          };
          set((s) => ({ furniture: [...s.furniture, item] }));
          get().recomputeOverlaps();
        },

        updateFurniture: (id, patch) => {
          pushHistory();
          set((s) => ({ furniture: s.furniture.map((f) => f.id === id ? { ...f, ...patch } : f) }));
        },

        deleteFurniture: (id) => {
          pushHistory();
          set((s) => ({
            furniture: s.furniture.filter((f) => f.id !== id),
            selectedId: s.selectedId === id ? null : s.selectedId,
          }));
          get().recomputeOverlaps();
        },

        recomputeOverlaps: () => {
          const { furniture } = get();
          const overlapping = computeOverlaps(furniture);
          set({ furniture: furniture.map((f) => ({ ...f, isOverlapping: overlapping.has(f.id) })) });
        },

        setSelected: (id) => set({ selectedId: id }),

        toggleDimensionLabels: () => set((s) => ({ showDimensionLabels: !s.showDimensionLabels })),

        toggleScaleUnit: () => set((s) => ({
          scaleUnit: s.scaleUnit === 'ft' ? 'm' : s.scaleUnit === 'm' ? 'in' : 'ft',
        })),

        setStageTransform: (scale, x, y) => set({ stageScale: scale, stageX: x, stageY: y }),

        deleteSelected: () => {
          const { selectedId } = get();
          if (selectedId) get().deleteFurniture(selectedId);
        },

        undo: () => {
          const { past, furniture, future } = get();
          if (past.length === 0) return;
          const previous = past[past.length - 1];
          set({ past: past.slice(0, -1), furniture: previous, future: [furniture, ...future.slice(0, MAX_HISTORY - 1)], selectedId: null });
          get().recomputeOverlaps();
        },

        redo: () => {
          const { past, furniture, future } = get();
          if (future.length === 0) return;
          const next = future[0];
          set({ past: [...past.slice(-(MAX_HISTORY - 1)), furniture], furniture: next, future: future.slice(1), selectedId: null });
          get().recomputeOverlaps();
        },

        // ── Project save / load ────────────────────────────────────────────

        saveFloorplan: (name: string) => {
          const s = get();
          const now = Date.now();
          // Strip derived isOverlapping before storing
          const furnitureClean = s.furniture.map((f) => ({ ...f, isOverlapping: false }));

          const snapshot: SavedFloorplan = {
            id: s.activeFloorplanId ?? uuidv4(),
            name,
            updatedAt: now,
            floorplanDataUrl: s.floorplanDataUrl,
            floorplanNaturalWidth: s.floorplanNaturalWidth,
            floorplanNaturalHeight: s.floorplanNaturalHeight,
            floorplanRealWidthFt: s.floorplanRealWidthFt,
            furniture: furnitureClean,
          };

          try {
            if (s.activeFloorplanId) {
              set({
                activeFloorplanName: name,
                savedFloorplans: s.savedFloorplans.map((fp) =>
                  fp.id === s.activeFloorplanId ? snapshot : fp
                ),
              });
            } else {
              set({
                activeFloorplanId: snapshot.id,
                activeFloorplanName: name,
                savedFloorplans: [...s.savedFloorplans, snapshot],
              });
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            set({ saveError: `Save failed: ${msg}. Try removing large floorplan images from older saves.` });
          }
        },

        loadFloorplan: (id: string) => {
          const { savedFloorplans } = get();
          const fp = savedFloorplans.find((f) => f.id === id);
          if (!fp) return;
          set({
            floorplanDataUrl: fp.floorplanDataUrl,
            floorplanNaturalWidth: fp.floorplanNaturalWidth,
            floorplanNaturalHeight: fp.floorplanNaturalHeight,
            floorplanRealWidthFt: fp.floorplanRealWidthFt,
            furniture: fp.furniture.map((f) => ({ ...f, isOverlapping: false })),
            activeFloorplanId: fp.id,
            activeFloorplanName: fp.name,
            selectedId: null,
            past: [],
            future: [],
            calibrationMode: false,
            calibrationPoints: [],
          });
          get().recomputeOverlaps();
        },

        deleteFloorplan: (id: string) => {
          set((s) => ({
            savedFloorplans: s.savedFloorplans.filter((fp) => fp.id !== id),
            activeFloorplanId: s.activeFloorplanId === id ? null : s.activeFloorplanId,
            activeFloorplanName: s.activeFloorplanId === id ? null : s.activeFloorplanName,
          }));
        },

        renameFloorplan: (id: string, name: string) => {
          set((s) => ({
            savedFloorplans: s.savedFloorplans.map((fp) =>
              fp.id === id ? { ...fp, name, updatedAt: Date.now() } : fp
            ),
            activeFloorplanName: s.activeFloorplanId === id ? name : s.activeFloorplanName,
          }));
        },

        newFloorplan: () => {
          set({
            floorplanDataUrl: null,
            floorplanNaturalWidth: 0,
            floorplanNaturalHeight: 0,
            floorplanRealWidthFt: 40,
            furniture: [],
            selectedId: null,
            past: [],
            future: [],
            calibrationMode: false,
            calibrationPoints: [],
            activeFloorplanId: null,
            activeFloorplanName: null,
          });
        },

        clearSaveError: () => set({ saveError: null }),
      };
    },
    {
      name: 'furniture-planner-state',
      storage: idbStorage,
      partialize: (s) => ({
        furniture: s.furniture,
        scaleUnit: s.scaleUnit,
        floorplanRealWidthFt: s.floorplanRealWidthFt,
        customCollection: s.customCollection,
        floorplanDataUrl: s.floorplanDataUrl,
        floorplanNaturalWidth: s.floorplanNaturalWidth,
        floorplanNaturalHeight: s.floorplanNaturalHeight,
        savedFloorplans: s.savedFloorplans,
        activeFloorplanId: s.activeFloorplanId,
        activeFloorplanName: s.activeFloorplanName,
        showDimensionLabels: s.showDimensionLabels,
      }),
    }
  )
);
