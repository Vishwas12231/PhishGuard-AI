import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Loader2, Sparkles, AlertCircle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { ScanReport } from '../types';

interface ScreenshotScannerProps {
  onScanComplete: (report: ScanReport) => void;
  token: string | null;
}

export default function ScreenshotScanner({ onScanComplete, token }: ScreenshotScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanReport | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid file format. Please upload a standard image screenshot (PNG, JPEG, WEBP).');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop an image file to trigger multi-modal Gemini evaluation.');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/scan/image', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The Gemini Vision engine was unable to formulate a response.');
      }

      setScanResult(data);
      onScanComplete(data);
    } catch (err: any) {
      setError(err.message || 'Connecting with safety vision components failed. Please confirm file rules.');
    } finally {
      setScanning(false);
    }
  };

  // Safe base64 loaders for samples so users can immediately play
  const loadDemoScreenshot = async () => {
    // We create a tiny generated placeholder image so the app is always functional without network dependency!
    const width = 450;
    const height = 150;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw fake email UI lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Warning text
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SECURITY BREACH WARNING: WALLET COMPROMISE', 20, 35);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Sender: security-alerts@coinbase-helpdesk-resolve.net', 20, 60);
      ctx.fillText('Subject: Urgent Cryptographic Key Audit Requisite', 20, 75);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText('Our nodes recorded a malware ingress attempt on your seed phrase.', 20, 100);
      ctx.fillText('To prevent total balance liquidation, upload keys now:', 20, 115);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('👉 CLICK HERE: https://coinbase-auth-verify.xyz/login', 20, 135);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'coinbase_phish_screenshot.png', { type: 'image/png' });
          processFile(file);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Hub header card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-cyan-400" /> Multi-modal Screenshot AI Analyzer
        </h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Upload an image representing a suspicious SMS text, banking alert, crypto login page, or email screenshot. PhishGuard AI extracts character vectors, identifies brand imitation markers, and flags malicious text vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input variables panel */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold font-mono text-slate-400">UPLOAD SCREENSHOT</h3>
            <button
              type="button"
              onClick={loadDemoScreenshot}
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer font-mono"
            >
              <Sparkles className="h-3 w-3" /> Load Sample Threat Image
            </button>
          </div>

          <form onSubmit={handleUploadScan} className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                dragActive 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : previewUrl 
                    ? 'border-white/10 bg-black/30' 
                    : 'border-white/10 bg-black/10 hover:border-cyan-500/50 hover:bg-black/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3 w-full">
                  <img
                    src={previewUrl}
                    alt="Preview crop selection"
                    referrerPolicy="no-referrer"
                    className="max-h-48 mx-auto rounded-xl border border-white/10 object-contain bg-black"
                  />
                  <span className="text-xs font-mono text-slate-400 block truncate">Selected: {selectedFile?.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono underline">Click to update file selection</span>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-300 font-semibold">Drag and Drop Screenshot here</p>
                  <p className="text-xs text-slate-500 mt-1 font-sans">or click to open local file explorer</p>
                  <span className="text-[10px] text-slate-500 block mt-3 font-mono">SUPPORTED FORMATS: PNG, JPEG, WEBP UP TO 5MB</span>
                </>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-start gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={scanning || !selectedFile}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  AI Vision Engine Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" /> Deploy Safety Vision Scan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results output panel */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md flex flex-col justify-center">
          {scanResult ? (
            <div className="space-y-5 animate-fade-in w-full">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold font-mono text-slate-400">VISION ANALYSIS SUMMARY</h3>
                <span className="text-xs font-mono text-slate-500">SYSTEM ARCHIVE ID: {scanResult.id}</span>
              </div>

              {/* Dynamic threat indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-center">
                  <div className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">THREAT SCALE</div>
                  <div className={`text-xl font-mono font-bold uppercase mt-1 ${
                    scanResult.result.threatLevel === 'Dangerous' 
                      ? 'text-red-400' 
                      : scanResult.result.threatLevel === 'Suspicious'
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                  }`}>
                    {scanResult.result.threatLevel}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-center col-span-2">
                  <div className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">THREAT SCORE ACCELERATION</div>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono">
                    <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        scanResult.result.threatScore > 75 
                          ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                          : scanResult.result.threatScore > 35 
                            ? 'bg-yellow-500' 
                            : 'bg-emerald-500'
                      }`} style={{ width: `${scanResult.result.threatScore}%` }}></div>
                    </div>
                    <span className="text-sm font-mono font-bold text-white whitespace-nowrap">{scanResult.result.threatScore} / 100</span>
                  </div>
                </div>
              </div>

              {/* AI Explanation bubble */}
              <div className="p-4 rounded-xl bg-black/35 border border-white/5 text-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1.5 font-mono">
                  <Info className="h-4 w-4" /> BRAND & TEXT INTELLIGENCE AUDIT
                </div>
                <p className="text-xs leading-relaxed font-sans">{scanResult.result.explanation}</p>
              </div>

              {/* Visualized attack indicators */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-2">IDENTIFIED THREAT VECTORS</label>
                <div className="flex flex-wrap gap-2">
                  {scanResult.result.indicators && scanResult.result.indicators.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono font-semibold bg-red-500/15 border border-red-500/30 text-rose-300 px-2 py-1 rounded"
                    >
                      👁️ {tag}
                    </span>
                  ))}
                  {scanResult.result.indicators.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No brand or logo anomalies detected.</span>
                  )}
                </div>
              </div>

              {/* Actionable mitigation checklist */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-2">MITIGATION PLANS</label>
                <ul className="space-y-1.5 font-sans">
                  {scanResult.result.mitigationAdvice && scanResult.result.mitigationAdvice.map((step, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 font-mono mt-0.5">[{i + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center font-sans w-full">
              {scanning ? (
                <>
                  <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mb-3" />
                  <p className="text-sm font-mono text-cyan-400 font-bold">ACTIVATING MULTIMODAL MODEL...</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-sans">Extracting graphic textures, recognizing brand patterns, segmenting text variables and parsing harvest elements...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Security diagnostic report pending.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">Upload a screenshot clipping above and register scan to load character evaluation metrics.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
