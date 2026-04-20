import { useState, useRef } from 'react';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { PIXELS_PER_FOOT, PIXELS_PER_INCH, PIXELS_PER_METER } from '../../constants/scale';

const inputCls = 'w-full text-xs border border-zinc-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-100 text-zinc-700 bg-white transition-colors';
const labelCls = 'text-[11px] font-medium text-zinc-500 mb-1 block';

export function PropertiesPanel() {
  const selectedId = useFloorplanStore((s) => s.selectedId);
  const scaleUnit = useFloorplanStore((s) => s.scaleUnit);
  const furniture = useFloorplanStore((s) => s.furniture);
  const updateFurniture = useFloorplanStore((s) => s.updateFurniture);
  const recomputeOverlaps = useFloorplanStore((s) => s.recomputeOverlaps);
  const deleteFurniture = useFloorplanStore((s) => s.deleteFurniture);
  const saveToCollection = useFloorplanStore((s) => s.saveToCollection);

  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = (item: NonNullable<ReturnType<typeof furniture.find>>) => {
    saveToCollection(item);
    setSavedFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  };

  const pxPerUnit = scaleUnit === 'ft' ? PIXELS_PER_FOOT : scaleUnit === 'm' ? PIXELS_PER_METER : PIXELS_PER_INCH;
  const unitLabel = scaleUnit === 'ft' ? 'ft' : scaleUnit === 'm' ? 'm' : 'in';

  if (!selectedId) {
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" stroke="#a1a1aa" strokeWidth="1.4"/>
              <rect x="10" y="2" width="6" height="6" rx="1" stroke="#a1a1aa" strokeWidth="1.4"/>
              <rect x="2" y="10" width="6" height="6" rx="1" stroke="#a1a1aa" strokeWidth="1.4"/>
              <rect x="10" y="10" width="6" height="6" rx="1" stroke="#d4d4d8" strokeWidth="1.4" strokeDasharray="2 1.5"/>
            </svg>
          </div>
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            Click a furniture item on the canvas to view and edit its properties.
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">Controls</div>
          <div className="flex flex-col gap-2">
            {[
              ['Move', 'Drag the item'],
              ['Resize', 'Drag a corner or edge handle'],
              ['Rotate', 'Drag the round handle above'],
              ['Delete', 'Select then press Del'],
            ].map(([action, desc]) => (
              <div key={action} className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-medium text-zinc-600 w-14 flex-shrink-0">{action}</span>
                <span className="text-[11px] text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const item = furniture.find((f) => f.id === selectedId);
  if (!item) return null;

  const rotation = ((item.rotation % 360) + 360) % 360;

  const rotate = (delta: number) => {
    const next = (rotation + delta + 360) % 360;
    updateFurniture(item.id, { rotation: next });
    recomputeOverlaps();
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Name + delete */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 text-sm font-semibold border border-zinc-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zinc-400 text-zinc-800 min-w-0 bg-white"
          value={item.name}
          onChange={(e) => updateFurniture(item.id, { name: e.target.value })}
        />
        <button
          onClick={() => deleteFurniture(item.id)}
          className="flex-shrink-0 p-1.5 rounded-md border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 3H11.5M4.5 3V2.25C4.5 1.836 4.836 1.5 5.25 1.5H7.75C8.164 1.5 8.5 1.836 8.5 2.25V3M3 3L3.583 10.25C3.614 10.666 3.958 11 4.375 11H8.625C9.042 11 9.386 10.666 9.417 10.25L10 3H3Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {item.isOverlapping && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M6 3.5V6.5M6 8.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Overlapping with another item
        </div>
      )}

      {/* Dimensions */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Size</div>
        <div className="flex gap-2">
          <label className="flex-1">
            <span className={labelCls}>Width ({unitLabel})</span>
            <input
              type="number"
              className={inputCls}
              value={+(item.widthPx / pxPerUnit).toFixed(scaleUnit === 'in' ? 1 : 2)}
              min={scaleUnit === 'in' ? 1 : 0.5}
              step={scaleUnit === 'in' ? 1 : 0.5}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) { updateFurniture(item.id, { widthPx: v * pxPerUnit }); recomputeOverlaps(); }
              }}
            />
          </label>
          <label className="flex-1">
            <span className={labelCls}>Depth ({unitLabel})</span>
            <input
              type="number"
              className={inputCls}
              value={+(item.heightPx / pxPerUnit).toFixed(scaleUnit === 'in' ? 1 : 2)}
              min={scaleUnit === 'in' ? 1 : 0.5}
              step={scaleUnit === 'in' ? 1 : 0.5}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) { updateFurniture(item.id, { heightPx: v * pxPerUnit }); recomputeOverlaps(); }
              }}
            />
          </label>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Rotation</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => rotate(-90)}
            className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-500 transition-colors"
            title="Rotate 90° counter-clockwise"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5A4.5 4.5 0 1 0 6.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M2 3.5V6.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="flex-1 flex items-center gap-1.5">
            <input
              type="number"
              className={`${inputCls} text-center`}
              value={Math.round(rotation)}
              min={0} max={359} step={1}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) { updateFurniture(item.id, { rotation: ((v % 360) + 360) % 360 }); recomputeOverlaps(); }
              }}
            />
            <span className="text-xs text-zinc-400">°</span>
          </div>

          <button
            onClick={() => rotate(90)}
            className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-zinc-500 transition-colors"
            title="Rotate 90° clockwise"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M11 3.5V6.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <button
          onClick={() => { updateFurniture(item.id, { rotation: 0 }); recomputeOverlaps(); }}
          className="mt-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Reset to 0°
        </button>
      </div>

      {/* Save to collection */}
      <div className="border-t border-zinc-100 pt-3.5">
        <button
          onClick={() => handleSave(item)}
          className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors ${
            savedFlash
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
          }`}
        >
          {savedFlash ? '✓ Saved to Collection' : 'Save to Collection'}
        </button>
        <div className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
          Saves name &amp; dimensions for reuse across floorplans.
        </div>
      </div>
    </div>
  );
}
