import type { FurnitureTemplate } from '../types/models';

export const FURNITURE_LIBRARY: FurnitureTemplate[] = [
  // Seating
  { templateId: 'sofa-3seat', category: 'Seating', name: 'Sofa (3-seat)', defaultWidthFt: 7.5, defaultHeightFt: 3.0, color: '#e2cfaa', strokeColor: '#a8895a' },
  { templateId: 'loveseat', category: 'Seating', name: 'Loveseat', defaultWidthFt: 5.0, defaultHeightFt: 3.0, color: '#e2cfaa', strokeColor: '#a8895a' },
  { templateId: 'armchair', category: 'Seating', name: 'Armchair', defaultWidthFt: 3.0, defaultHeightFt: 3.0, color: '#e2cfaa', strokeColor: '#a8895a' },

  // Sleeping
  { templateId: 'king-bed', category: 'Sleeping', name: 'King Bed', defaultWidthFt: 6.3, defaultHeightFt: 6.7, color: '#b5c8d4', strokeColor: '#6898b0' },
  { templateId: 'queen-bed', category: 'Sleeping', name: 'Queen Bed', defaultWidthFt: 5.0, defaultHeightFt: 6.7, color: '#b5c8d4', strokeColor: '#6898b0' },
  { templateId: 'twin-bed', category: 'Sleeping', name: 'Twin Bed', defaultWidthFt: 3.2, defaultHeightFt: 6.3, color: '#b5c8d4', strokeColor: '#6898b0' },
  { templateId: 'nightstand', category: 'Sleeping', name: 'Nightstand', defaultWidthFt: 1.7, defaultHeightFt: 1.5, color: '#c2b8d4', strokeColor: '#8068a8' },

  // Dining
  { templateId: 'dining-table-4', category: 'Dining', name: 'Dining Table (4p)', defaultWidthFt: 3.0, defaultHeightFt: 5.0, color: '#b5c8b0', strokeColor: '#6a9068' },
  { templateId: 'dining-table-6', category: 'Dining', name: 'Dining Table (6p)', defaultWidthFt: 3.0, defaultHeightFt: 7.0, color: '#b5c8b0', strokeColor: '#6a9068' },
  { templateId: 'dining-chair', category: 'Dining', name: 'Dining Chair', defaultWidthFt: 1.7, defaultHeightFt: 1.7, color: '#c8d8c2', strokeColor: '#6a9068' },
  { templateId: 'coffee-table', category: 'Dining', name: 'Coffee Table', defaultWidthFt: 4.0, defaultHeightFt: 2.0, color: '#b5c8b0', strokeColor: '#6a9068' },

  // Office
  { templateId: 'desk', category: 'Office', name: 'Desk', defaultWidthFt: 4.0, defaultHeightFt: 2.0, color: '#d0c0a0', strokeColor: '#9a7850' },
  { templateId: 'office-chair', category: 'Office', name: 'Office Chair', defaultWidthFt: 2.0, defaultHeightFt: 2.0, color: '#d4c8a8', strokeColor: '#9a7850' },

  // Storage
  { templateId: 'wardrobe', category: 'Storage', name: 'Wardrobe', defaultWidthFt: 6.0, defaultHeightFt: 2.0, color: '#c8b8d0', strokeColor: '#8868a8' },
  { templateId: 'dresser', category: 'Storage', name: 'Dresser', defaultWidthFt: 3.5, defaultHeightFt: 1.5, color: '#c8b8d0', strokeColor: '#8868a8' },
  { templateId: 'bookshelf', category: 'Storage', name: 'Bookshelf', defaultWidthFt: 3.0, defaultHeightFt: 1.0, color: '#d0c0d8', strokeColor: '#8868a8' },
  { templateId: 'tv-stand', category: 'Storage', name: 'TV Stand', defaultWidthFt: 5.0, defaultHeightFt: 1.5, color: '#c8b8d0', strokeColor: '#8868a8' },

  // Bath
  { templateId: 'bathtub', category: 'Bath', name: 'Bathtub', defaultWidthFt: 5.0, defaultHeightFt: 2.5, color: '#b0c8d8', strokeColor: '#5088a8' },
  { templateId: 'toilet', category: 'Bath', name: 'Toilet', defaultWidthFt: 1.5, defaultHeightFt: 2.5, color: '#c0d8e8', strokeColor: '#5088a8' },
  { templateId: 'sink', category: 'Bath', name: 'Sink', defaultWidthFt: 2.0, defaultHeightFt: 1.7, color: '#c0d8e8', strokeColor: '#5088a8' },
];

export const CATEGORIES = ['Seating', 'Sleeping', 'Dining', 'Office', 'Storage', 'Bath'];
