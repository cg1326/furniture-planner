import type { FurnitureTemplate } from '../types/models';

export const FURNITURE_LIBRARY: FurnitureTemplate[] = [
  // Seating
  { templateId: 'sofa-3seat', category: 'Seating', name: 'Sofa (3-seat)', defaultWidthFt: 7.5, defaultHeightFt: 3.0, color: '#fde68a', strokeColor: '#92400e' },
  { templateId: 'loveseat', category: 'Seating', name: 'Loveseat', defaultWidthFt: 5.0, defaultHeightFt: 3.0, color: '#fde68a', strokeColor: '#92400e' },
  { templateId: 'armchair', category: 'Seating', name: 'Armchair', defaultWidthFt: 3.0, defaultHeightFt: 3.0, color: '#fde68a', strokeColor: '#92400e' },

  // Sleeping
  { templateId: 'king-bed', category: 'Sleeping', name: 'King Bed', defaultWidthFt: 6.3, defaultHeightFt: 6.7, color: '#a5f3fc', strokeColor: '#0e7490' },
  { templateId: 'queen-bed', category: 'Sleeping', name: 'Queen Bed', defaultWidthFt: 5.0, defaultHeightFt: 6.7, color: '#a5f3fc', strokeColor: '#0e7490' },
  { templateId: 'twin-bed', category: 'Sleeping', name: 'Twin Bed', defaultWidthFt: 3.2, defaultHeightFt: 6.3, color: '#a5f3fc', strokeColor: '#0e7490' },
  { templateId: 'nightstand', category: 'Sleeping', name: 'Nightstand', defaultWidthFt: 1.7, defaultHeightFt: 1.5, color: '#c7d2fe', strokeColor: '#4338ca' },

  // Dining
  { templateId: 'dining-table-4', category: 'Dining', name: 'Dining Table (4p)', defaultWidthFt: 3.0, defaultHeightFt: 5.0, color: '#bbf7d0', strokeColor: '#166534' },
  { templateId: 'dining-table-6', category: 'Dining', name: 'Dining Table (6p)', defaultWidthFt: 3.0, defaultHeightFt: 7.0, color: '#bbf7d0', strokeColor: '#166534' },
  { templateId: 'dining-chair', category: 'Dining', name: 'Dining Chair', defaultWidthFt: 1.7, defaultHeightFt: 1.7, color: '#d1fae5', strokeColor: '#166534' },
  { templateId: 'coffee-table', category: 'Dining', name: 'Coffee Table', defaultWidthFt: 4.0, defaultHeightFt: 2.0, color: '#bbf7d0', strokeColor: '#166534' },

  // Office
  { templateId: 'desk', category: 'Office', name: 'Desk', defaultWidthFt: 4.0, defaultHeightFt: 2.0, color: '#fed7aa', strokeColor: '#9a3412' },
  { templateId: 'office-chair', category: 'Office', name: 'Office Chair', defaultWidthFt: 2.0, defaultHeightFt: 2.0, color: '#fdba74', strokeColor: '#9a3412' },

  // Storage
  { templateId: 'wardrobe', category: 'Storage', name: 'Wardrobe', defaultWidthFt: 6.0, defaultHeightFt: 2.0, color: '#e9d5ff', strokeColor: '#6b21a8' },
  { templateId: 'dresser', category: 'Storage', name: 'Dresser', defaultWidthFt: 3.5, defaultHeightFt: 1.5, color: '#e9d5ff', strokeColor: '#6b21a8' },
  { templateId: 'bookshelf', category: 'Storage', name: 'Bookshelf', defaultWidthFt: 3.0, defaultHeightFt: 1.0, color: '#f3e8ff', strokeColor: '#6b21a8' },
  { templateId: 'tv-stand', category: 'Storage', name: 'TV Stand', defaultWidthFt: 5.0, defaultHeightFt: 1.5, color: '#e9d5ff', strokeColor: '#6b21a8' },

  // Bath
  { templateId: 'bathtub', category: 'Bath', name: 'Bathtub', defaultWidthFt: 5.0, defaultHeightFt: 2.5, color: '#bfdbfe', strokeColor: '#1d4ed8' },
  { templateId: 'toilet', category: 'Bath', name: 'Toilet', defaultWidthFt: 1.5, defaultHeightFt: 2.5, color: '#e0f2fe', strokeColor: '#0369a1' },
  { templateId: 'sink', category: 'Bath', name: 'Sink', defaultWidthFt: 2.0, defaultHeightFt: 1.7, color: '#e0f2fe', strokeColor: '#0369a1' },
];

export const CATEGORIES = ['Seating', 'Sleeping', 'Dining', 'Office', 'Storage', 'Bath'];
