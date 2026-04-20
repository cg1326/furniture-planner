import { useRef, useState, useEffect } from 'react';
import { useFloorplanStore } from '../../store/useFloorplanStore';
import { detectFloorplanDimensions } from '../../utils/detectFloorplanDimensions';
import { transformImage } from '../../utils/transformImage';

const FT_TO_M = 0.3048;
const FT_TO_IN = 12;

type DetectionState = 'idle' | 'detecting' | 'found' | 'not-found' | 'no-key';

const inputCls = 'w-full text-xs border border-zinc-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-100 text-zinc-700 bg-white transition-colors';

export function FloorplanPanel() {
  const dataUrl = useFloorplanStore((s) => s.floorplanDataUrl);
  const naturalWidth = useFloorplanStore((s) => s.floorplanNaturalWidth);
  const naturalHeight = useFloorplanStore((s) => s.floorplanNaturalHeight);
  const realWidthFt = useFloorplanStore((s) => s.floorplanRealWidthFt);
  const scaleUnit = useFloorplanStore((s) => s.scaleUnit);
  const calibrationMode = useFloorplanStore((s) => s.calibrationMode);
  const calibrationPoints = useFloorplanStore((s) => s.calibrationPoints);

  const setFloorplanImage = useFloorplanStore((s) => s.setFloorplanImage);
  const clearFloorplanImage = useFloorplanStore((s) => s.clearFloorplanImage);
  const setFloorplanRealWidthFt = useFloorplanStore((s) => s.setFloorplanRealWidthFt);
  const setFloorplanRealHeightFt = useFloorplanStore((s) => s.setFloorplanRealHeightFt);
  const startCalibration = useFloorplanStore((s) => s.startCalibration);
  const cancelCalibration = useFloorplanStore((s) => s.cancelCalibration);
  const applyCalibration = useFloorplanStore((s) => s.applyCalibration);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [calibrationInput, setCalibrationInput] = useState('');
  const [detection, setDetection] = useState<DetectionState>('idle');
  const [detectedDims, setDetectedDims] = useState<{ widthFt: number; heightFt: number } | null>(null);
  const [transforming, setTransforming] = useState(false);

  const aspectRatio = naturalWidth && naturalHeight ? naturalHeight / naturalWidth : 1;
  const realHeightFt = realWidthFt * aspectRatio;

  const toDisplay = (ft: number) =>
    scaleUnit === 'ft' ? +ft.toFixed(2) :
    scaleUnit === 'm'  ? +(ft * FT_TO_M).toFixed(2) :
    +(ft * FT_TO_IN).toFixed(1);
  const fromDisplay = (val: number) =>
    scaleUnit === 'ft' ? val :
    scaleUnit === 'm'  ? val / FT_TO_M :
    val / FT_TO_IN;
  const unit = scaleUnit === 'ft' ? 'ft' : scaleUnit === 'm' ? 'm' : 'in';

  const calibrationLineLen = calibrationPoints.length === 2
    ? Math.sqrt(
        (calibrationPoints[1].x - calibrationPoints[0].x) ** 2 +
        (calibrationPoints[1].y - calibrationPoints[0].y) ** 2
      )
    : null;

  useEffect(() => {
    if (calibrationMode && calibrationPoints.length === 0) setCalibrationInput('');
  }, [calibrationMode, calibrationPoints.length]);

  const runDetection = async (url: string) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey || apiKey === 'your_api_key_here') {
      setDetection('no-key');
      return;
    }
    setDetection('detecting');
    try {
      const result = await detectFloorplanDimensions(url, apiKey);
      if (result) {
        setDetectedDims(result);
        setDetection('found');
        setFloorplanRealWidthFt(result.widthFt);
      } else {
        setDetection('not-found');
      }
    } catch {
      setDetection('not-found');
    }
  };

  const loadFile = (file: File) => {
    if (!file.type.match(/image\/(svg\+xml|png|jpeg|webp|gif)/)) {
      alert('Please upload an SVG, PNG, JPG, or WebP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setFloorplanImage(url, img.naturalWidth || img.width, img.naturalHeight || img.height);
        setDetection('idle');
        setDetectedDims(null);
        runDetection(url);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleTransform = async (t: Parameters<typeof transformImage>[1]) => {
    if (!dataUrl || transforming) return;
    setTransforming(true);
    try {
      const result = await transformImage(dataUrl, t);
      if (t === 'rotate-cw' || t === 'rotate-ccw') {
        // Width and height swap — recalculate realWidthFt to preserve scale
        const currentHeightFt = realWidthFt * (naturalHeight / naturalWidth);
        setFloorplanImage(result.dataUrl, result.naturalWidth, result.naturalHeight);
        setFloorplanRealWidthFt(currentHeightFt);
      } else {
        setFloorplanImage(result.dataUrl, result.naturalWidth, result.naturalHeight);
      }
    } finally {
      setTransforming(false);
    }
  };

  const handleApplyCalibration = () => {
    const val = parseFloat(calibrationInput);
    if (!val || val <= 0 || !calibrationLineLen) return;
    applyCalibration(calibrationLineLen, fromDisplay(val));
    setCalibrationInput('');
  };

  return (
    <div className="flex flex-col gap-4">

      {!dataUrl ? (
        /* Upload zone */
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50/60'
              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="3" width="15" height="12" rx="1.5" stroke="#a1a1aa" strokeWidth="1.4"/>
              <path d="M1.5 7h15" stroke="#a1a1aa" strokeWidth="1.4"/>
              <path d="M6 3V1.5M12 3V1.5" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M6 11l2 2 4-4" stroke="#a1a1aa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-xs font-medium text-zinc-600 mb-1">Upload floorplan</div>
          <div className="text-[11px] text-zinc-400">SVG, PNG, JPG · drag or click</div>
        </div>
      ) : (
        <>
          {/* Thumbnail */}
          <div
            className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 cursor-pointer group"
            onClick={() => inputRef.current?.click()}
            title="Click to replace"
          >
            <img
              src={dataUrl}
              alt="Floorplan"
              className="w-full object-contain max-h-36 group-hover:opacity-75 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-medium text-zinc-700 bg-white/90 px-2.5 py-1 rounded-full shadow-sm border border-zinc-200">
                Replace image
              </span>
            </div>
            {/* Dimension arrows */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="5" y1="93" x2="95" y2="93" stroke="#3b82f6" strokeWidth="0.8" markerStart="url(#aL)" markerEnd="url(#aR)" />
              <line x1="3.5" y1="5" x2="3.5" y2="95" stroke="#10b981" strokeWidth="0.8" markerStart="url(#aU)" markerEnd="url(#aD)" />
              <defs>
                <marker id="aL" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M4,0 L0,2 L4,4" fill="none" stroke="#3b82f6" strokeWidth="0.8"/></marker>
                <marker id="aR" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4" fill="none" stroke="#3b82f6" strokeWidth="0.8"/></marker>
                <marker id="aU" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0,4 L2,0 L4,4" fill="none" stroke="#10b981" strokeWidth="0.8"/></marker>
                <marker id="aD" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0,0 L2,4 L4,0" fill="none" stroke="#10b981" strokeWidth="0.8"/></marker>
              </defs>
            </svg>
          </div>

          {/* Rotate / flip controls */}
          <div className="flex gap-1.5">
            {([
              { t: 'rotate-ccw', label: 'Rotate CCW', icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M10 5H5C3.343 5 2 6.343 2 8S3.343 11 5 11H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M8 2.5L10 5L8 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { t: 'rotate-cw', label: 'Rotate CW', icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M3 5H8C9.657 5 11 6.343 11 8S9.657 11 8 11H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M5 2.5L3 5L5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { t: 'flip-h', label: 'Flip horizontal', icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 2v9M2 4.5L6.5 2M11 4.5L6.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 10h3M8 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )},
              { t: 'flip-v', label: 'Flip vertical', icon: (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5h9M8.5 2L11 6.5M8.5 11L11 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 2v3M2 8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )},
            ] as const).map(({ t, label, icon }) => (
              <button
                key={t}
                onClick={() => handleTransform(t)}
                disabled={transforming}
                title={label}
                className="flex-1 flex items-center justify-center py-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Detection banner */}
          {detection === 'detecting' && (
            <div className="flex items-center gap-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <svg className="animate-spin w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="6" strokeLinecap="round"/>
              </svg>
              Detecting dimensions…
            </div>
          )}
          {detection === 'found' && detectedDims && (
            <div className="flex items-start gap-2 text-[11px] bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 mt-0.5 text-emerald-600">
                <path d="M2 6.5L4.5 9L10 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-emerald-800">
                <span className="font-medium">Detected</span>
                {' '}
                {toDisplay(detectedDims.widthFt)}{unit} × {toDisplay(detectedDims.heightFt)}{unit}
                <div className="text-emerald-600/80 mt-0.5">Applied. Adjust below if needed.</div>
              </div>
            </div>
          )}
          {detection === 'not-found' && (
            <div className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5">
              No annotations detected — set scale manually below.
            </div>
          )}
          {detection === 'no-key' && (
            <div className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 leading-relaxed">
              Add your Anthropic key to <code className="font-mono bg-zinc-100 px-1 rounded text-zinc-600">.env</code> for auto-detection:
              <div className="mt-1.5 font-mono bg-white border border-zinc-200 rounded px-2 py-1 text-zinc-600 select-all text-[10px]">
                VITE_ANTHROPIC_API_KEY=sk-ant-…
              </div>
              <div className="mt-1 text-zinc-400">Restart the dev server after saving.</div>
            </div>
          )}

          {/* Scale controls */}
          <div className="flex flex-col gap-3 border border-zinc-200 rounded-xl p-3.5 bg-zinc-50/60">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Set Scale</div>

            {/* Option A */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium text-zinc-600">A — Measure a known distance</div>
              <div className="text-[11px] text-zinc-400 leading-relaxed">
                Click two points on the canvas, then enter the real distance.
              </div>
              {!calibrationMode ? (
                <button
                  className="w-full py-2 text-xs font-medium rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                  onClick={startCalibration}
                >
                  Start measuring
                </button>
              ) : calibrationPoints.length < 2 ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 font-medium">
                    {calibrationPoints.length === 0 ? 'Click first point on canvas' : 'Click second point on canvas'}
                  </div>
                  <button className="text-[11px] text-zinc-400 hover:text-zinc-600 underline text-left transition-colors" onClick={cancelCalibration}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] text-zinc-600">How long is that line in real life?</div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number" autoFocus
                      className={inputCls}
                      placeholder="e.g. 12"
                      value={calibrationInput}
                      min={0.1} step={0.5}
                      onChange={(e) => setCalibrationInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCalibration()}
                    />
                    <span className="text-xs text-zinc-500 font-medium w-6 flex-shrink-0">{unit}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
                      disabled={!calibrationInput || parseFloat(calibrationInput) <= 0}
                      onClick={handleApplyCalibration}
                    >
                      Apply
                    </button>
                    <button
                      className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg transition-colors"
                      onClick={cancelCalibration}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-3 flex flex-col gap-2.5">
              <div className="text-xs font-medium text-zinc-600">B — Enter total dimensions</div>

              <label className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />
                  <svg width="6" height="5" viewBox="0 0 6 5"><path d="M0,0 L6,2.5 L0,5 Z" fill="#3b82f6"/></svg>
                  <span className="text-[11px] text-zinc-500">Width · left to right ({unit})</span>
                </div>
                <input
                  type="number" className={inputCls}
                  value={toDisplay(realWidthFt)} min={1}
                  step={scaleUnit === 'ft' ? 1 : scaleUnit === 'm' ? 0.5 : 6}
                  onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setFloorplanRealWidthFt(fromDisplay(v)); }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-0.5 h-3 bg-emerald-500 rounded" />
                  <svg width="5" height="6" viewBox="0 0 5 6"><path d="M0,0 L5,0 L2.5,6 Z" fill="#10b981"/></svg>
                  <span className="text-[11px] text-zinc-500">Height · top to bottom ({unit})</span>
                </div>
                <input
                  type="number" className={inputCls}
                  value={toDisplay(realHeightFt)} min={1}
                  step={scaleUnit === 'ft' ? 1 : scaleUnit === 'm' ? 0.5 : 6}
                  onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setFloorplanRealHeightFt(fromDisplay(v)); }}
                />
              </label>

              <div className="text-[11px] text-zinc-400 leading-relaxed">
                Changing one value scales the other to preserve aspect ratio.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Remove floorplan? All placed furniture will also be deleted.')) {
                clearFloorplanImage();
                setDetection('idle');
                setDetectedDims(null);
              }
            }}
            className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors text-left"
          >
            Remove floorplan
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
