import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { FURNITURE_LIBRARY } from '../../data/furnitureLibrary';
import { GridLayer } from './GridLayer';
import { FurnitureShape } from './FurnitureShape';
import { FloorplanImageLayer } from './FloorplanImage';
import { CalibrationLayer } from './CalibrationLayer';
import { snapToGrid } from '../../utils/geometry';
import { PIXELS_PER_FOOT } from '../../constants/scale';

export function FloorplanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);

  // Pan tracking — using a ref so mousemove doesn't re-render
  const panOriginRef = useRef<{ clientX: number; clientY: number; stageX: number; stageY: number } | null>(null);

  const furniture = useFloorplanStore((s) => s.furniture);
  const selectedId = useFloorplanStore((s) => s.selectedId);
  const stageScale = useFloorplanStore((s) => s.stageScale);
  const stageX = useFloorplanStore((s) => s.stageX);
  const stageY = useFloorplanStore((s) => s.stageY);
  const calibrationMode = useFloorplanStore((s) => s.calibrationMode);
  const setStageTransform = useFloorplanStore((s) => s.setStageTransform);
  const setSelected = useFloorplanStore((s) => s.setSelected);
  const addFurnitureFromTemplate = useFloorplanStore((s) => s.addFurnitureFromTemplate);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        useFloorplanStore.getState().cancelCalibration();
        useFloorplanStore.getState().setSelected(null);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
        useFloorplanStore.getState().deleteSelected();
      }
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey && !inInput) {
        e.preventDefault();
        useFloorplanStore.getState().undo();
      }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !inInput) {
        e.preventDefault();
        useFloorplanStore.getState().redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Zoom with scroll wheel (zoom toward pointer)
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.06;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.max(0.15, Math.min(5, stageScale * (direction > 0 ? scaleBy : 1 / scaleBy)));
    const mousePointTo = { x: (pointer.x - stageX) / stageScale, y: (pointer.y - stageY) / stageScale };
    setStageTransform(newScale, pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
  }, [stageScale, stageX, stageY, setStageTransform]);

  // Panning — start only when pressing down on the stage background (not on furniture)
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (calibrationMode) return;
    // e.target is the Konva node that was actually clicked
    // If it's the Stage itself, the user clicked on empty canvas
    if (e.target !== stageRef.current) return;
    panOriginRef.current = { clientX: e.evt.clientX, clientY: e.evt.clientY, stageX, stageY };
    setIsPanning(true);
  }, [calibrationMode, stageX, stageY]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!panOriginRef.current) return;
    const dx = e.evt.clientX - panOriginRef.current.clientX;
    const dy = e.evt.clientY - panOriginRef.current.clientY;
    setStageTransform(stageScale, panOriginRef.current.stageX + dx, panOriginRef.current.stageY + dy);
  }, [stageScale, setStageTransform]);

  const handleMouseUp = useCallback(() => {
    panOriginRef.current = null;
    setIsPanning(false);
  }, []);

  // HTML5 drop from sidebar furniture cards
  const handleDragOver = (e: React.DragEvent) => {
    if (!calibrationMode) e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (calibrationMode) return;
    e.preventDefault();
    const templateId = e.dataTransfer.getData('templateId');
    if (!templateId) return;

    // Resolve from library first, then from personal collection
    const { customCollection } = useFloorplanStore.getState();
    const libraryMatch = FURNITURE_LIBRARY.find((t) => t.templateId === templateId);
    const collectionMatch = customCollection.find((c) => c.id === templateId);

    const template = libraryMatch ?? (collectionMatch ? {
      templateId: collectionMatch.id,
      category: 'My Collection',
      name: collectionMatch.name,
      defaultWidthFt: collectionMatch.widthFt,
      defaultHeightFt: collectionMatch.heightFt,
      color: collectionMatch.color,
      strokeColor: collectionMatch.strokeColor,
    } : null);

    if (!template) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.container().getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - stageX) / stageScale;
    const canvasY = (e.clientY - rect.top - stageY) / stageScale;
    addFurnitureFromTemplate(
      template,
      snapToGrid(canvasX - (template.defaultWidthFt * PIXELS_PER_FOOT) / 2),
      snapToGrid(canvasY - (template.defaultHeightFt * PIXELS_PER_FOOT) / 2)
    );
  };

  const cursor = calibrationMode ? 'crosshair' : isPanning ? 'grabbing' : 'grab';
  const hint = calibrationMode
    ? 'Click two points on the floorplan to measure a known distance'
    : 'Drag to pan · scroll to zoom · drag furniture to move';

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-stone-100 relative overflow-hidden"
      style={{ cursor }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stageX}
        y={stageY}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        // Also stop panning if pointer leaves the stage
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (calibrationMode) return;
          if (e.target === stageRef.current) setSelected(null);
        }}
      >
        <GridLayer
          width={size.width}
          height={size.height}
          stageScale={stageScale}
          stageX={stageX}
          stageY={stageY}
        />

        <FloorplanImageLayer />

        {!calibrationMode && (
          <Layer>
            {furniture.map((item) => (
              <FurnitureShape
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                stageScale={stageScale}
              />
            ))}
          </Layer>
        )}

        {calibrationMode && <CalibrationLayer stageScale={stageScale} />}
      </Stage>

      <div className={`absolute bottom-4 left-4 backdrop-blur-sm border rounded-full px-3.5 py-1.5 text-[11px] shadow-sm pointer-events-none transition-colors ${
        calibrationMode
          ? 'bg-amber-50/95 border-amber-200 text-amber-800 font-medium'
          : 'bg-white/80 border-zinc-200/80 text-zinc-400'
      }`}>
        {hint}
      </div>

      {calibrationMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-sm text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow pointer-events-none border border-white/10">
          Calibration mode · Esc to cancel
        </div>
      )}
    </div>
  );
}
