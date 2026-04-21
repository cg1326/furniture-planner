import { useState, useRef, useEffect } from 'react';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { ProjectsModal } from '../modals/ProjectsModal';

export function Toolbar() {
  const scaleUnit = useFloorplanStore((s) => s.scaleUnit);
  const stageScale = useFloorplanStore((s) => s.stageScale);
  const past = useFloorplanStore((s) => s.past);
  const future = useFloorplanStore((s) => s.future);
  const activeFloorplanName = useFloorplanStore((s) => s.activeFloorplanName);
  const activeFloorplanId = useFloorplanStore((s) => s.activeFloorplanId);
  const saveError = useFloorplanStore((s) => s.saveError);
  const showDimensionLabels = useFloorplanStore((s) => s.showDimensionLabels);
  const toggleDimensionLabels = useFloorplanStore((s) => s.toggleDimensionLabels);

  const toggleScaleUnit = useFloorplanStore((s) => s.toggleScaleUnit);
  const setStageTransform = useFloorplanStore((s) => s.setStageTransform);
  const undo = useFloorplanStore((s) => s.undo);
  const redo = useFloorplanStore((s) => s.redo);
  const saveFloorplan = useFloorplanStore((s) => s.saveFloorplan);
  const clearSaveError = useFloorplanStore((s) => s.clearSaveError);

  const [showProjects, setShowProjects] = useState(false);
  const [saving, setSaving] = useState(false); // inline save-as name input open
  const [saveDraft, setSaveDraft] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saving) saveInputRef.current?.focus();
  }, [saving]);

  // Dismiss save error automatically
  useEffect(() => {
    if (saveError) {
      const t = setTimeout(clearSaveError, 6000);
      return () => clearTimeout(t);
    }
  }, [saveError, clearSaveError]);

  const handleSaveClick = () => {
    if (activeFloorplanId && activeFloorplanName) {
      // Overwrite existing
      saveFloorplan(activeFloorplanName);
      flashSaved();
    } else {
      // Need a name
      setSaveDraft(activeFloorplanName ?? 'My Floorplan');
      setSaving(true);
    }
  };

  const commitSave = () => {
    const name = saveDraft.trim();
    if (!name) return;
    saveFloorplan(name);
    setSaving(false);
    flashSaved();
  };

  const flashSaved = () => {
    setSavedFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1800);
  };

  const clearAll = () => {
    if (!confirm('Clear all furniture?')) return;
    useFloorplanStore.setState({ furniture: [], selectedId: null, past: [], future: [] });
  };

  return (
    <>
      <div className="h-11 bg-surface-toolbar flex items-center gap-1 px-3 flex-shrink-0 relative border-b border-white/[0.04]">

        {/* Logo */}
        <div className="flex items-center gap-2 pr-3 mr-1 border-r border-zinc-700/60">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.9"/>
              <rect x="6" y="1" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.5"/>
              <rect x="1" y="6" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.5"/>
              <rect x="6" y="6" width="4" height="4" rx="0.5" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">Floor Planner</span>
        </div>

        {/* Undo / Redo */}
        <button onClick={undo} disabled={past.length === 0} title="Undo (⌘Z)"
          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 4.5H8.5C10.157 4.5 11.5 5.843 11.5 7.5S10.157 10.5 8.5 10.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M5.5 2L3 4.5L5.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={redo} disabled={future.length === 0} title="Redo (⌘⇧Z)"
          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 4.5H5.5C3.843 4.5 2.5 5.843 2.5 7.5S3.843 10.5 5.5 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M8.5 2L11 4.5L8.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="w-px h-4 bg-white/[0.07] mx-1" />

        <button onClick={toggleScaleUnit} title="Toggle units"
          className="px-2.5 py-1 rounded text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors">
          {scaleUnit}
        </button>
        <button onClick={() => setStageTransform(1, 40, 40)}
          className="px-2.5 py-1 rounded text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors">
          Reset view
        </button>
        {/* Dimension labels toggle */}
        <button
          onClick={toggleDimensionLabels}
          title={showDimensionLabels ? 'Hide dimension labels' : 'Show dimension labels'}
          className={`p-1.5 rounded transition-colors ${
            showDimensionLabels
              ? 'bg-white/[0.13] text-white'
              : 'text-white/40 hover:text-white hover:bg-white/[0.07]'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="4" width="11" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 7h6M4 7l1.5-1.5M4 7l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1.5 2.5h11M1.5 11.5h11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 1.5"/>
          </svg>
        </button>

        <div className="w-px h-4 bg-white/[0.07] mx-1" />

        {/* Projects: open button */}
        <button
          onClick={() => setShowProjects(true)}
          title="Open a saved floorplan"
          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 4.5C1.5 3.948 1.948 3.5 2.5 3.5H5.086a1 1 0 0 1 .707.293L6.5 4.5H11.5C12.052 4.5 12.5 4.948 12.5 5.5V10.5C12.5 11.052 12.052 11.5 11.5 11.5H2.5C1.948 11.5 1.5 11.052 1.5 10.5V4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Current floorplan name */}
        {saving ? (
          <div className="flex items-center gap-1.5 ml-1">
            <input
              ref={saveInputRef}
              type="text"
              value={saveDraft}
              onChange={(e) => setSaveDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSave();
                if (e.key === 'Escape') setSaving(false);
              }}
              onBlur={() => setSaving(false)}
              className="h-7 w-40 bg-white/[0.07] border border-white/20 rounded-md px-2 text-xs text-white focus:outline-none focus:border-accent"
              placeholder="Name this floorplan…"
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); commitSave(); }}
              className="h-7 px-2.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium transition-colors"
            >
              Save
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); setSaving(false); }}
              className="h-7 px-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700/60 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span
            className="ml-1 text-xs text-white/55 truncate max-w-[140px] cursor-default"
            title={activeFloorplanName ?? undefined}
          >
            {activeFloorplanName ?? <span className="italic text-zinc-600">Unsaved</span>}
          </span>
        )}

        {/* Save button */}
        {!saving && (
          <button
            onClick={handleSaveClick}
            className={`ml-1 h-7 px-3 rounded-md text-xs font-medium transition-colors ${
              savedFlash
                ? 'bg-emerald-700/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/[0.08] hover:bg-white/[0.13] text-white/70 hover:text-white border border-white/[0.09]'
            }`}
          >
            {savedFlash ? '✓ Saved' : activeFloorplanId ? 'Save' : 'Save as…'}
          </button>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/30 tabular-nums">{Math.round(stageScale * 100)}%</span>
          <div className="w-px h-4 bg-white/[0.07]" />
          <button onClick={clearAll}
            className="px-2.5 py-1 rounded text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            Clear all
          </button>
        </div>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="bg-red-600 text-white text-xs px-4 py-2 flex items-center justify-between gap-3">
          <span>{saveError}</span>
          <button onClick={clearSaveError} className="text-red-200 hover:text-white flex-shrink-0">✕</button>
        </div>
      )}

      {/* Projects modal */}
      {showProjects && <ProjectsModal onClose={() => setShowProjects(false)} />}
    </>
  );
}
