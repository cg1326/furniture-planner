import type { FurnitureTemplate } from '../../types/models';
import { PIXELS_PER_FOOT } from '../../constants/scale';
import { useFloorplanStore } from '../../store/useFloorplanStore';

interface FurnitureCardProps {
  template: FurnitureTemplate;
}

export function FurnitureCard({ template }: FurnitureCardProps) {
  const addFurnitureFromTemplate = useFloorplanStore((s) => s.addFurnitureFromTemplate);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('templateId', template.templateId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDoubleClick = () => {
    addFurnitureFromTemplate(template, 200, 200);
  };

  const aspectRatio = template.defaultHeightFt / template.defaultWidthFt;
  const swatchW = Math.min(32, Math.max(16, template.defaultWidthFt * 4));
  const swatchH = Math.min(32, Math.max(12, swatchW * aspectRatio));

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-zinc-50 cursor-grab active:cursor-grabbing transition-colors select-none group"
      title={`${template.defaultWidthFt}' × ${template.defaultHeightFt}' — drag to canvas or double-click`}
    >
      {/* Proportional color swatch */}
      <div
        className="flex-shrink-0 rounded"
        style={{
          width: swatchW,
          height: swatchH,
          backgroundColor: template.color,
          border: `1.5px solid ${template.strokeColor}`,
          minWidth: 16,
          minHeight: 12,
          opacity: 0.9,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-zinc-700 truncate leading-tight">{template.name}</div>
        <div className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
          {template.defaultWidthFt}′ × {template.defaultHeightFt}′
        </div>
      </div>
      {/* Drag hint */}
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none"
        className="flex-shrink-0 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <circle cx="4" cy="3" r="1" fill="currentColor"/>
        <circle cx="8" cy="3" r="1" fill="currentColor"/>
        <circle cx="4" cy="6" r="1" fill="currentColor"/>
        <circle cx="8" cy="6" r="1" fill="currentColor"/>
        <circle cx="4" cy="9" r="1" fill="currentColor"/>
        <circle cx="8" cy="9" r="1" fill="currentColor"/>
      </svg>
    </div>
  );
}
