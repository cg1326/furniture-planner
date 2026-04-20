import { useFloorplanStore } from '../../store/useFloorplanStore';
import { CollectionCard } from './CollectionCard';

export function MyCollectionPanel() {
  const customCollection = useFloorplanStore((s) => s.customCollection);

  if (customCollection.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xl">
          📦
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-600 mb-1">No saved items yet</div>
          <div className="text-[11px] text-zinc-400 leading-relaxed max-w-[180px]">
            Select a piece on the canvas and click <span className="font-medium text-zinc-500">Save to Collection</span>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[11px] text-zinc-400">{customCollection.length} item{customCollection.length !== 1 ? 's' : ''}</span>
        <span className="text-[11px] text-zinc-400">Double-click name to rename</span>
      </div>
      {customCollection.map((item) => (
        <CollectionCard key={item.id} item={item} />
      ))}
    </div>
  );
}
