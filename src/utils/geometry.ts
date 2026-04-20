import type { FurnitureItem } from '../types/models';
import { SNAP_PX } from '../constants/scale';

export function snapToGrid(value: number): number {
  return Math.round(value / SNAP_PX) * SNAP_PX;
}

// Get 4 corners of a rotated rectangle (OBB).
// Konva rotates Groups around their (x, y) origin (top-left), not the center,
// so we rotate each corner around (item.x, item.y).
function getCorners(item: FurnitureItem): { x: number; y: number }[] {
  const px = item.x;
  const py = item.y;
  const rad = (item.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const w = item.widthPx;
  const h = item.heightPx;

  const local = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];

  return local.map(({ x, y }) => ({
    x: px + cos * x - sin * y,
    y: py + sin * x + cos * y,
  }));
}

function projectOntoAxis(corners: { x: number; y: number }[], axis: { x: number; y: number }): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const c of corners) {
    const proj = c.x * axis.x + c.y * axis.y;
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return [min, max];
}

function getAxes(corners: { x: number; y: number }[]): { x: number; y: number }[] {
  const axes: { x: number; y: number }[] = [];
  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % corners.length];
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const len = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
    axes.push({ x: -edge.y / len, y: edge.x / len });
  }
  return axes;
}

// Allow up to 1px of apparent overlap before flagging — handles floating-point
// imprecision from rotated items and the snap-grid rounding mismatch where
// a furniture edge (e.g. 126px) doesn't land on a SNAP_PX (5px) boundary.
const OVERLAP_EPSILON = 1;

export function doItemsOverlap(a: FurnitureItem, b: FurnitureItem): boolean {
  const cornersA = getCorners(a);
  const cornersB = getCorners(b);
  const axes = [...getAxes(cornersA), ...getAxes(cornersB)];

  for (const axis of axes) {
    const [minA, maxA] = projectOntoAxis(cornersA, axis);
    const [minB, maxB] = projectOntoAxis(cornersB, axis);
    if (maxA <= minB + OVERLAP_EPSILON || maxB <= minA + OVERLAP_EPSILON) return false;
  }
  return true;
}

export function computeOverlaps(items: FurnitureItem[]): Set<string> {
  const overlapping = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (doItemsOverlap(items[i], items[j])) {
        overlapping.add(items[i].id);
        overlapping.add(items[j].id);
      }
    }
  }
  return overlapping;
}
