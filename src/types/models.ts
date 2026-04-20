export type ScaleUnit = 'ft' | 'm' | 'in';

export interface SavedFloorplan {
  id: string;
  name: string;
  updatedAt: number;
  floorplanDataUrl: string | null;
  floorplanNaturalWidth: number;
  floorplanNaturalHeight: number;
  floorplanRealWidthFt: number;
  furniture: FurnitureItem[];
}
export type EditorMode = 'select';

export interface FurnitureTemplate {
  templateId: string;
  category: string;
  name: string;
  defaultWidthFt: number;
  defaultHeightFt: number;
  color: string;
  strokeColor: string;
}

export interface CustomFurnitureTemplate {
  id: string;
  name: string;
  widthFt: number;
  heightFt: number;
  color: string;
  strokeColor: string;
}

export interface FurnitureItem {
  id: string;
  templateId: string;
  name: string;
  x: number;
  y: number;
  widthPx: number;
  heightPx: number;
  rotation: number;
  color: string;
  strokeColor: string;
  isOverlapping: boolean;
}
