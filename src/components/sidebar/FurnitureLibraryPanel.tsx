import { useState } from 'react';
import { FURNITURE_LIBRARY, CATEGORIES } from '../../data/furnitureLibrary';
import { FurnitureCard } from './FurnitureCard';

export function FurnitureLibraryPanel() {
  const [openCategory, setOpenCategory] = useState<string | null>('Seating');
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col gap-0.5">
      {/* Search */}
      <div className="relative mb-2">
        <svg
          width="13" height="13" viewBox="0 0 13 13" fill="none"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        >
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search furniture…"
          className="w-full h-8 bg-surface-card border border-border-warm rounded-lg
                     pl-7 pr-3 text-xs text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {CATEGORIES.map((cat) => {
        const items = FURNITURE_LIBRARY.filter((t) =>
          t.category === cat &&
          (search === '' || t.name.toLowerCase().includes(search.toLowerCase()))
        );
        if (items.length === 0) return null;
        const isOpen = openCategory === cat;
        return (
          <div key={cat} className="rounded-lg overflow-hidden">
            <button
              className={`w-full flex items-center justify-between px-2.5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                isOpen
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'
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
