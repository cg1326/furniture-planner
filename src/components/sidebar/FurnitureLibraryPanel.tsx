import { useState } from 'react';
import { FURNITURE_LIBRARY, CATEGORIES } from '../../data/furnitureLibrary';
import { FurnitureCard } from './FurnitureCard';

export function FurnitureLibraryPanel() {
  const [openCategory, setOpenCategory] = useState<string | null>('Seating');

  return (
    <div className="flex flex-col gap-0.5">
      {CATEGORIES.map((cat) => {
        const items = FURNITURE_LIBRARY.filter((t) => t.category === cat);
        const isOpen = openCategory === cat;
        return (
          <div key={cat} className="rounded-lg overflow-hidden">
            <button
              className={`w-full flex items-center justify-between px-2.5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                isOpen
                  ? 'text-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
              onClick={() => setOpenCategory(isOpen ? null : cat)}
            >
              <span>{cat}</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
              >
                <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isOpen && (
              <div className="pb-1">
                {items.map((t) => (
                  <FurnitureCard key={t.templateId} template={t} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
