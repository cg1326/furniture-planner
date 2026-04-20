import { useState, useRef, useEffect } from 'react';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import type { SavedFloorplan } from '../../types/models';

interface ProjectsModalProps {
  onClose: () => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function FloorplanCard({
  fp,
  isActive,
  onOpen,
  onDelete,
  onRename,
}: {
  fp: SavedFloorplan;
  isActive: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fp.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== fp.name) onRename(trimmed);
    else setDraft(fp.name);
    setEditing(false);
  };

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all cursor-pointer ${
        isActive
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'
      }`}
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="bg-stone-100 aspect-[4/3] flex items-center justify-center overflow-hidden flex-shrink-0">
        {fp.floorplanDataUrl ? (
          <img
            src={fp.floorplanDataUrl}
            alt={fp.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-300">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 12h24" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="17" width="6" height="5" rx="0.5" fill="currentColor" opacity="0.3"/>
              <rect x="17" y="17" width="6" height="5" rx="0.5" fill="currentColor" opacity="0.3"/>
            </svg>
            <span className="text-[11px]">No image</span>
          </div>
        )}

        {/* Open overlay */}
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white bg-zinc-900/80 px-3 py-1.5 rounded-full shadow">
            Open
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white px-3 py-2.5 flex items-start justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              className="text-xs font-semibold text-zinc-800 w-full border-b border-blue-400 focus:outline-none bg-transparent pb-0.5"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') { setDraft(fp.name); setEditing(false); }
              }}
            />
          ) : (
            <div
              className="text-xs font-semibold text-zinc-800 truncate cursor-text"
              onDoubleClick={() => { setEditing(true); setDraft(fp.name); }}
              title="Double-click to rename"
            >
              {fp.name}
            </div>
          )}
          <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <span>{fp.furniture.length} item{fp.furniture.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{formatDate(fp.updatedAt)}</span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex-shrink-0 p-1 rounded text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
          title="Delete"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 3h9M4.5 3V2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V3M3 3l.5 7.25c.03.4.367.75.75.75h3.5c.383 0 .72-.35.75-.75L9 3H3z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          Current
        </div>
      )}
    </div>
  );
}

export function ProjectsModal({ onClose }: ProjectsModalProps) {
  const savedFloorplans = useFloorplanStore((s) => s.savedFloorplans);
  const activeFloorplanId = useFloorplanStore((s) => s.activeFloorplanId);
  const saveError = useFloorplanStore((s) => s.saveError);
  const loadFloorplan = useFloorplanStore((s) => s.loadFloorplan);
  const deleteFloorplan = useFloorplanStore((s) => s.deleteFloorplan);
  const renameFloorplan = useFloorplanStore((s) => s.renameFloorplan);
  const newFloorplan = useFloorplanStore((s) => s.newFloorplan);
  const clearSaveError = useFloorplanStore((s) => s.clearSaveError);

  const furniture = useFloorplanStore((s) => s.furniture);
  const floorplanDataUrl = useFloorplanStore((s) => s.floorplanDataUrl);
  const hasUnsaved = furniture.length > 0 || floorplanDataUrl !== null;

  const handleNew = () => {
    if (hasUnsaved && !confirm('Start a new floorplan? Any unsaved work on the current canvas will be lost.')) return;
    newFloorplan();
    onClose();
  };

  const handleOpen = (id: string) => {
    if (id === activeFloorplanId) { onClose(); return; }
    if (hasUnsaved && activeFloorplanId === null && !confirm('Open this floorplan? Any unsaved work on the current canvas will be lost.')) return;
    loadFloorplan(id);
    onClose();
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteFloorplan(id);
  };

  // Sort: most recently updated first
  const sorted = [...savedFloorplans].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-zinc-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Floorplans</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {sorted.length === 0 ? 'No saved floorplans yet' : `${sorted.length} saved`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New floorplan
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Error */}
        {saveError && (
          <div className="mx-4 mt-4 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6.5 3.5v3.5M6.5 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="flex-1">{saveError}</span>
            <button onClick={clearSaveError} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="4" width="18" height="15" rx="2" stroke="#a1a1aa" strokeWidth="1.5"/>
                  <path d="M2 9h18" stroke="#a1a1aa" strokeWidth="1.5"/>
                  <path d="M7 4V2M15 4V2" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600 mb-1">No saved floorplans</div>
                <div className="text-xs text-zinc-400">Use the Save button in the toolbar to save your current work.</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sorted.map((fp) => (
                <FloorplanCard
                  key={fp.id}
                  fp={fp}
                  isActive={fp.id === activeFloorplanId}
                  onOpen={() => handleOpen(fp.id)}
                  onDelete={() => handleDelete(fp.id, fp.name)}
                  onRename={(name) => renameFloorplan(fp.id, name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
