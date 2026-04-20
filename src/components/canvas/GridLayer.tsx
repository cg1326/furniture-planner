import { Layer, Line } from 'react-konva';
import { GRID_SIZE_PX } from '../../constants/scale';

interface GridLayerProps {
  width: number;
  height: number;
  stageScale: number;
  stageX: number;
  stageY: number;
}

export function GridLayer({ width, height, stageScale, stageX, stageY }: GridLayerProps) {
  const lines: React.ReactElement[] = [];

  // Compute visible area in canvas coords
  const startX = Math.floor(-stageX / stageScale / GRID_SIZE_PX) * GRID_SIZE_PX;
  const startY = Math.floor(-stageY / stageScale / GRID_SIZE_PX) * GRID_SIZE_PX;
  const endX = startX + Math.ceil(width / stageScale / GRID_SIZE_PX + 2) * GRID_SIZE_PX;
  const endY = startY + Math.ceil(height / stageScale / GRID_SIZE_PX + 2) * GRID_SIZE_PX;

  for (let x = startX; x <= endX; x += GRID_SIZE_PX) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#e7e5e4"
        strokeWidth={1 / stageScale}
        listening={false}
        perfectDrawEnabled={false}
      />
    );
  }

  for (let y = startY; y <= endY; y += GRID_SIZE_PX) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#e7e5e4"
        strokeWidth={1 / stageScale}
        listening={false}
        perfectDrawEnabled={false}
      />
    );
  }

  return <Layer listening={false}>{lines}</Layer>;
}
