import { Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { PIXELS_PER_FOOT } from '../../constants/scale';

export function FloorplanImageLayer() {
  const dataUrl = useFloorplanStore((s) => s.floorplanDataUrl);
  const naturalWidth = useFloorplanStore((s) => s.floorplanNaturalWidth);
  const naturalHeight = useFloorplanStore((s) => s.floorplanNaturalHeight);
  const realWidthFt = useFloorplanStore((s) => s.floorplanRealWidthFt);

  const [image, status] = useImage(dataUrl ?? '', 'anonymous');

  if (!dataUrl || status !== 'loaded' || !image) return <Layer listening={false} />;

  const canvasWidth = realWidthFt * PIXELS_PER_FOOT;
  const aspectRatio = naturalHeight / naturalWidth;
  const canvasHeight = canvasWidth * aspectRatio;

  return (
    <Layer listening={false}>
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        perfectDrawEnabled={false}
      />
    </Layer>
  );
}
