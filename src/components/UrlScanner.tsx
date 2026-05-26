import React, { useState } from 'react';
import { Globe, Link2, ShieldCheck, ShieldAlert, AlertCircle, Info, Key, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { ScanReport } from '../types';

interface UrlScannerProps {
  onScanComplete: (report: ScanReport) => void;
  token: string | null;
}

export default function UrlScanner({ onScanComplete, token }: UrlScannerProps) {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanReport | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a suspicious URL address to evaluate.');
      return;
    }

    // Rough client validation for safety
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URLs must begin with http:// or https:// context protocols.');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The URL scanner API returned an error status.');
      }

      setScanResult(data);
      onScanComplete(data);
    } catch (err: any) {
      setError(err.message || 'Connecting with safety engines failed. Please review system settings.');
    } finally {
      setScanning(false);
    }
  };

  const loadSampleData = () => {
    setUrl('http://verification-paypal-portal-access.login-update-support-invoice.xyz/webapps/security-check');
  };

  return (
    <div className="space-y-6">
      {/* Visual Hub header card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-400" /> Real-time Link reputation & URL Analyzer
        </h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Paste the questionable hyperlink or address below. Gemini inspects the Top-Level Domain (TLD) score, subdomain layers, homograph lookalikes, presence of harvested query segments, and secure SSL indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input parameters panel */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold font-mono text-slate-400">URL CRITERIA</h3>
            <button
              type="button"
              onClick={loadSampleData}
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer font-mono"
            >
              <Sparkles className="h-3 w-3" /> Load Phishing Sample
            </button>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-1.5">Suspicious URL Address (Starts with HTTP/HTTPS)</label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://paypa1-verify-resolve.com/auth/login"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition font-sans"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-start gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer font-sans"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Deconstructing domain components...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" /> Evaluate Link Security Scope
                </>
              )}
            </button>
          </form>

          {/* Quick Security Checklist Tips */}
          <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
            <span className="text-xs font-mono text-slate-400 block">PRO-SECTOR COGNITIVE TRIGGERS:</span>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 leading-relaxed font-sans">
              <div className="rounded-xl border border-white/5 p-3 bg-black/20">
                <span className="font-bold text-slate-300 block mb-1">TLD Check</span>
                Domain extensions like <span className="text-yellow-400 font-mono">.xyz</span>, <span className="text-yellow-400 font-mono">.cc</span>, or <span className="text-yellow-400 font-mono">.ru</span> carry elevated spam indices.
              </div>
              <div className="rounded-xl border border-white/5 p-3 bg-black/20">
                <span className="font-bold text-slate-300 block mb-1">Homographs</span>
                Attackers replace latin <span className="font-mono">"o"</span> characters with Cyrillic lookalikes.
              </div>
            </div>
          </div>
        </div>

        {/* Results output panel */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md flex flex-col justify-center">
          {scanResult ? (
            <div className="space-y-5 animate-fade-in w-full">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold font-mono text-slate-400">LINK REPUTATION REVEAL</h3>
                <span className="text-xs font-mono text-slate-500">DIGITAL AUDIT ID: {scanResult.id}</span>
              </div>

              {/* Dynamic threat indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Score panel */}
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
                  <div className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">THREAT LEVEL SLIDER</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        scanResult.result.threatScore > 75 
                          ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
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
                  <Info className="h-4 w-4" /> DOMAIN STRUCTURAL EXPLANATION
                </div>
                <p className="text-xs leading-relaxed font-sans">{scanResult.result.explanation}</p>
              </div>

              {/* Visualized attack indicators */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-2">EXTRACTED DETECTORS</label>
                <div className="flex flex-wrap gap-2">
                  {scanResult.result.indicators && scanResult.result.indicators.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono font-semibold bg-red-500/15 border border-red-500/30 text-rose-300 px-2 py-1 rounded"
                    >
                      ⛓️ {tag}
                    </span>
                  ))}
                  {scanResult.result.indicators.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No standard threat signatures found.</span>
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
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center w-full">
              {scanning ? (
                <>
                  <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mb-3" />
                  <p className="text-sm font-mono text-cyan-400">AUDITING REPUTATION MATRIX...</p>
                  <p className="text-xs text-slate-650 text-slate-400 mt-1 max-w-xs font-sans">Sensing redirect chains, scanning Typosquat parameters, verifying TLD registration age and DNS structures...</p>
                </>
              ) : (
                <>
                  <Globe className="h-12 w-12 text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Security diagnostic report pending.</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">Enter link addresses above and deploy evaluation tool to capture active telemetry records.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
