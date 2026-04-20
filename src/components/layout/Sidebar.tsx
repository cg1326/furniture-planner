import { useState, useEffect } from 'react';
import { FurnitureLibraryPanel } from '../sidebar/FurnitureLibraryPanel';
import { MyCollectionPanel } from '../sidebar/MyCollectionPanel';
import { PropertiesPanel } from '../sidebar/PropertiesPanel';
import { FloorplanPanel } from '../sidebar/FloorplanPanel';
import { useFloorplanStore } from '../../store/useFloorplanStore';

type Tab = 'floorplan' | 'library' | 'collection' | 'properties';

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('floorplan');
  const selectedId = useFloorplanStore((s) => s.selectedId);
  const collectionCount = useFloorplanStore((s) => s.customCollection.length);

  useEffect(() => {
    if (selectedId) setTab('properties');
  }, [selectedId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'floorplan',  label: 'Plan' },
    { id: 'library',    label: 'Library' },
    { id: 'collection', label: 'Saved' },
    { id: 'properties', label: 'Properties' },
  ];

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 bg-zinc-50/60">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {t.label}
            {t.id === 'collection' && collectionCount > 0 && (
              <span className="absolute top-1.5 right-1 text-[8px] font-bold bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                {collectionCount > 9 ? '9+' : collectionCount}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-zinc-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {tab === 'floorplan'  && <FloorplanPanel />}
        {tab === 'library'    && <FurnitureLibraryPanel />}
        {tab === 'collection' && <MyCollectionPanel />}
        {tab === 'properties' && <PropertiesPanel />}
      </div>

      {/* Footer hint */}
      <div className="px-3.5 py-2.5 border-t border-zinc-100">
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Click to select · drag to move · <kbd className="bg-zinc-100 text-zinc-500 px-1 py-0.5 rounded text-[10px]">Del</kbd> to remove
        </p>
      </div>
    </div>
  );
}
