import { useState } from 'react';
import type { CustomFurnitureTemplate } from '../../types/models';
import { useFloorplanStore } from '../../store/useFloorplanStore';

const FT_TO_M = 0.3048;
const FT_TO_IN = 12;

interface CollectionCardProps {
  item: CustomFurnitureTemplate;
}

export function CollectionCard({ item }: CollectionCardProps) {
  const removeFromCollection = useFloorplanStore((s) => s.removeFromCollection);
  const renameCollectionItem = useFloorplanStore((s) => s.renameCollectionItem);
  const updateCollectionItem = useFloorplanStore((s) => s.updateCollectionItem);
  const addFurnitureFromTemplate = useFloorplanStore((s) => s.addFurnitureFromTemplate);
  const floorplanDataUrl = useFloorplanStore((s) => s.floorplanDataUrl);
  const scaleUnit = useFloorplanStore((s) => s.scaleUnit);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);

  const unitLabel = scaleUnit === 'ft' ? 'ft' : scaleUnit === 'm' ? 'm' : 'in';

  const toDisplay = (ft: number) =>
    scaleUnit === 'ft' ? +ft.toFixed(2) :
    scaleUnit === 'm'  ? +(ft * FT_TO_M).toFixed(2) :
    +(ft * FT_TO_IN).toFixed(1);

  const fromDisplay = (val: number): number =>
    scaleUnit === 'ft' ? val :
    scaleUnit === 'm'  ? val / FT_TO_M :
    val / FT_TO_IN;

  const step = scaleUnit === 'ft' ? 0.5 : scaleUnit === 'm' ? 0.1 : 1;

  const asTemplate = {
    templateId: item.id,
    category: 'My Collection',
    name: item.name,
    defaultWidthFt: item.widthFt,
    defaultHeightFt: item.heightFt,
    color: item.color,
    strokeColor: item.strokeColor,
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('templateId', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = () => {
    if (floorplanDataUrl) addFurnitureFromTemplate(asTemplate, 200, 200);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed) renameCollectionItem(item.id, trimmed);
    else setDraftName(item.name);
    setEditing(false);
  };

  const aspectRatio = item.heightFt / item.widthFt;
  const swatchW = Math.min(32, Math.max(16, item.widthFt * 4));
  const swatchH = Math.min(32, Math.max(12, swatchW * aspectRatio));

  return (
    <div
      draggable={!!floorplanDataUrl}
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors group ${
        floorplanDataUrl
          ? 'hover:bg-zinc-50 cursor-grab active:cursor-grabbing'
          : 'opacity-50 cursor-default'
      }`}
    >
      {/* Swatch */}
      <div
        className="flex-shrink-0 rounded mt-0.5"
        style={{
          width: swatchW,
          height: swatchH,
          backgroundColor: item.color,
          border: `1.5px solid ${item.strokeColor}`,
          minWidth: 16,
          minHeight: 12,
          opacity: 0.9,
        }}
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            className="text-xs font-medium w-full border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none text-zinc-800 mb-1"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setDraftName(item.name); setEditing(false); }
            }}
          />
        ) : (
          <div
            className="text-xs font-medium text-zinc-700 truncate cursor-text mb-1 leading-tight"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setDraftName(item.name); }}
            title="Double-click to rename"
          >
            {item.name}
          </div>
        )}

        {/* Editable dimension inputs */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-medium">W</span>
            <input
              type="number"
              className="w-12 text-[11px] border border-zinc-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-400 text-zinc-600 bg-white"
              value={toDisplay(item.widthFt)}
              min={step}
              step={step}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) updateCollectionItem(item.id, { widthFt: fromDisplay(v) });
              }}
            />
          </label>
          <span className="text-[10px] text-zinc-300">×</span>
          <label className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-medium">D</span>
            <input
              type="number"
              className="w-12 text-[11px] border border-zinc-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-400 text-zinc-600 bg-white"
              value={toDisplay(item.heightFt)}
              min={step}
              step={step}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) updateCollectionItem(item.id, { heightFt: fromDisplay(v) });
              }}
            />
          </label>
          <span className="text-[10px] text-zinc-400">{unitLabel}</span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); removeFromCollection(item.id); }}
        className="flex-shrink-0 p-1 rounded text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
        title="Remove"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 2L9 9M9 2L2 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
