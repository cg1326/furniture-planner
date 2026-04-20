import { useEffect, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import type { FurnitureItem } from '../../types/models';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { snapToGrid } from '../../utils/geometry';
import { GRID_SIZE_PX, OVERLAP_COLOR, OVERLAP_STROKE, PIXELS_PER_FOOT } from '../../constants/scale';

interface FurnitureShapeProps {
  item: FurnitureItem;
  isSelected: boolean;
  stageScale: number;
}

export function FurnitureShape({ item, isSelected, stageScale }: FurnitureShapeProps) {
  const shapeGroupRef = useRef<Konva.Group>(null);
  const labelGroupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const updateFurniture = useFloorplanStore((s) => s.updateFurniture);
  const recomputeOverlaps = useFloorplanStore((s) => s.recomputeOverlaps);
  const setSelected = useFloorplanStore((s) => s.setSelected);
  const calibrationMode = useFloorplanStore((s) => s.calibrationMode);
  const showDimensionLabels = useFloorplanStore((s) => s.showDimensionLabels);
  const scaleUnit = useFloorplanStore((s) => s.scaleUnit);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeGroupRef.current) {
      transformerRef.current.nodes([shapeGroupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, item.widthPx, item.heightPx, item.rotation]);

  if (calibrationMode) return null;

  const syncLabel = () => {
    const sg = shapeGroupRef.current;
    const lg = labelGroupRef.current;
    if (!sg || !lg) return;
    lg.x(sg.x());
    lg.y(sg.y());
    lg.rotation(sg.rotation());
    const textNode = lg.findOne<Konva.Text>('#name');
    if (textNode) {
      textNode.width(item.widthPx * sg.scaleX());
      textNode.height(item.heightPx * sg.scaleY());
    }
    const dimNode = lg.findOne<Konva.Text>('#dim');
    if (dimNode) {
      dimNode.width(item.widthPx * sg.scaleX());
      dimNode.y(item.heightPx * sg.scaleY() + 3 / stageScale);
    }
  };

  const handleTransformEnd = () => {
    const sg = shapeGroupRef.current!;
    const sx = sg.scaleX();
    const sy = sg.scaleY();
    const newWidth  = snapToGrid(Math.max(GRID_SIZE_PX, item.widthPx  * sx));
    const newHeight = snapToGrid(Math.max(GRID_SIZE_PX, item.heightPx * sy));
    sg.scaleX(1);
    sg.scaleY(1);
    updateFurniture(item.id, {
      x:        snapToGrid(sg.x()),
      y:        snapToGrid(sg.y()),
      widthPx:  newWidth,
      heightPx: newHeight,
      rotation: sg.rotation(),
    });
    recomputeOverlaps();
  };

  // Dimension label text
  const widthFt  = item.widthPx  / PIXELS_PER_FOOT;
  const heightFt = item.heightPx / PIXELS_PER_FOOT;
  const dimText = scaleUnit === 'ft'
    ? `${widthFt.toFixed(1)}′ × ${heightFt.toFixed(1)}′`
    : scaleUnit === 'm'
    ? `${(widthFt * 0.3048).toFixed(2)}m × ${(heightFt * 0.3048).toFixed(2)}m`
    : `${Math.round(widthFt * 12)}" × ${Math.round(heightFt * 12)}"`;

  const fill   = item.isOverlapping ? OVERLAP_COLOR : item.color;
  const stroke = item.isOverlapping ? OVERLAP_STROKE : item.strokeColor;
  const nameFontSize = Math.max(9, Math.min(12, Math.min(item.widthPx, item.heightPx) / 5)) / stageScale;
  const dimFontSize  = Math.max(7, 9) / stageScale;

  return (
    <>
      {/* Shape group — Transformer attaches here */}
      <Group
        ref={shapeGroupRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        draggable
        onClick={() => setSelected(item.id)}
        onTap={() => setSelected(item.id)}
        onDragMove={syncLabel}
        onDragEnd={(e) => {
          const node = e.target as Konva.Group;
          const snappedX = snapToGrid(node.x());
          const snappedY = snapToGrid(node.y());
          node.x(snappedX);
          node.y(snappedY);
          syncLabel();
          updateFurniture(item.id, { x: snappedX, y: snappedY });
          recomputeOverlaps();
        }}
        onTransform={syncLabel}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={item.widthPx}
          height={item.heightPx}
          fill={fill}
          stroke={stroke}
          strokeWidth={(isSelected ? 2 : 1.5) / stageScale}
          cornerRadius={2 / stageScale}
          shadowColor={isSelected ? '#1d4ed8' : undefined}
          shadowBlur={isSelected ? 6 / stageScale : 0}
          shadowOpacity={0.4}
          perfectDrawEnabled={false}
        />
      </Group>

      {/* Label group — never scaled, mirrors shape group position */}
      <Group
        ref={labelGroupRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        listening={false}
      >
        {/* Name label — centered inside the rect */}
        <Text
          id="name"
          x={0}
          y={0}
          width={item.widthPx}
          height={item.heightPx}
          text={item.name}
          align="center"
          verticalAlign="middle"
          fontSize={nameFontSize}
          fill="#1e293b"
          fontStyle="bold"
          listening={false}
          perfectDrawEnabled={false}
          wrap="word"
        />

        {/* Dimension label — below the rect */}
        {showDimensionLabels && (
          <Text
            id="dim"
            x={0}
            y={item.heightPx + 3 / stageScale}
            width={item.widthPx}
            text={dimText}
            align="center"
            fontSize={dimFontSize}
            fill="#52525b"
            listening={false}
            perfectDrawEnabled={false}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          keepRatio={false}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={8}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < GRID_SIZE_PX || newBox.height < GRID_SIZE_PX) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
