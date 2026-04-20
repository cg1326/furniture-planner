import { Layer, Circle, Line, Text } from 'react-konva';
import { useFloorplanStore } from '../../store/useFloorplanStore';

interface CalibrationLayerProps {
  stageScale: number;
}

export function CalibrationLayer({ stageScale }: CalibrationLayerProps) {
  const addCalibrationPoint = useFloorplanStore((s) => s.addCalibrationPoint);
  const calibrationPoints = useFloorplanStore((s) => s.calibrationPoints);

  const [p1, p2] = calibrationPoints;

  const lineLen = p1 && p2
    ? Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
    : 0;

  return (
    <Layer>
      {/* Invisible hit area for capturing clicks */}
      {calibrationPoints.length < 2 && (
        <Line
          points={[-50000, -50000, 50000, -50000, 50000, 50000, -50000, 50000]}
          closed
          fill="transparent"
          onClick={(e) => {
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = stage.getRelativePointerPosition();
            if (pos) addCalibrationPoint({ x: pos.x, y: pos.y });
          }}
        />
      )}

      {/* Drawn line between two points */}
      {p1 && p2 && (
        <Line
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke="#f59e0b"
          strokeWidth={2 / stageScale}
          dash={[6 / stageScale, 3 / stageScale]}
          listening={false}
        />
      )}

      {/* Point dots */}
      {calibrationPoints.map((p, i) => (
        <Circle
          key={i}
          x={p.x}
          y={p.y}
          radius={5 / stageScale}
          fill="#f59e0b"
          stroke="white"
          strokeWidth={1.5 / stageScale}
          listening={false}
        />
      ))}

      {/* Instruction label above point 1 */}
      {p1 && !p2 && (
        <Text
          x={p1.x + 8 / stageScale}
          y={p1.y - 18 / stageScale}
          text="Click second point"
          fontSize={11 / stageScale}
          fill="#92400e"
          fontStyle="bold"
          listening={false}
        />
      )}

      {/* Length label along the line */}
      {p1 && p2 && lineLen > 0 && (
        <Text
          x={(p1.x + p2.x) / 2 + 6 / stageScale}
          y={(p1.y + p2.y) / 2 - 14 / stageScale}
          text={`${(lineLen / 20).toFixed(1)} ft (current)`}
          fontSize={10 / stageScale}
          fill="#92400e"
          fontStyle="bold"
          listening={false}
        />
      )}
    </Layer>
  );
}
