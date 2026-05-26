import React, { useState } from 'react';
import { Mail, ShieldCheck, ShieldAlert, AlertCircle, Info, Send, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { ScanReport } from '../types';

interface EmailScannerProps {
  onScanComplete: (report: ScanReport) => void;
  token: string | null;
}

export default function EmailScanner({ onScanComplete, token }: EmailScannerProps) {
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanReport | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody.trim()) {
      setError('Please provide the suspicious email body text to analyze.');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          senderEmail,
          subject,
          emailBody
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The email scanner API returned an error status.');
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
    setSenderEmail('billing-update@verify-netflixonline.co.uk');
    setSubject('URGENT: Your Netflix Membership is Suspended - Action Required Today!');
    setEmailBody(`Dear NetfIix Customer,

We were unable to process your monthly membership premium on the billing card currently linked to your profile page due to an authentication error.

Consequently, we have temporary suspended your access loop. To prevent permanent profile clearance and service removal, you must authenticate your personal credit card coordinates below:

👉 http://netflix-secure-resolve.com/auth/login/secure-session-id

If you do not complete verification credentials within 24 hours, security terms will lock your catalog.

Respectfully,
The Netflix Security Department Team`);
  };

  return (
    <div className="space-y-6">
      {/* Visual Hub header card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="h-5 w-5 text-cyan-400" /> Deep Learning Phishing Email Detector
        </h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Paste the suspect email headers, subjects, and text coordinates below. Gemini AI parses sender credibility vectors, urgency, tone patterns, and suspicious link structures to calculate risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input parameters panel */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold font-mono text-slate-400">ANALYSIS CRITERIA</h3>
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
              <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-1.5">Sender Email / Address Header</label>
              <input
                type="text"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. support@netflixonline-services.net or paypal-invoice@paypa1.co"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-1.5">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Action Required: Your account will be shut down"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-1.5">Email Body Text (Include linked addresses if possible)</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={8}
                required
                placeholder="Dear subscriber, we detected a login from Moscow. Please verify here..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition font-sans"
              />
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Analyzing threat factors...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Run PhishGuard Threat Analysis
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
                <h3 className="text-sm font-bold font-mono text-slate-400">THREAT INTELLIGENCE SUMMARY</h3>
                <span className="text-xs font-mono text-slate-500">SECURE LOG ID: {scanResult.id}</span>
              </div>

              {/* Dynamic threat indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Score panel */}
                <div className="rounded-xl border border-white/5 bg-black/30 p-4 text-center">
                  <div className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">THREAT LEVEL</div>
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
                  <div className="text-[10px] font-mono font-semibold text-slate-400 tracking-wider">THREAT SCORE SCALE</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        scanResult.result.threatScore > 75 
                          ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
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
                  <Info className="h-4 w-4" /> COMPREHENSIVE CYBER ANALYSIS
                </div>
                <p className="text-xs leading-relaxed font-sans">{scanResult.result.explanation}</p>
              </div>

              {/* Visualized attack indicators */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-2">IDENTIFIED SIGNATURES</label>
                <div className="flex flex-wrap gap-2">
                  {scanResult.result.indicators && scanResult.result.indicators.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono font-semibold bg-red-500/15 border border-red-500/30 text-rose-300 px-2 py-1 rounded"
                    >
                      ☠️ {tag}
                    </span>
                  ))}
                  {scanResult.result.indicators.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No standard attack templates detected.</span>
                  )}
                </div>
              </div>

              {/* Actionable mitigation checklist */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 block mb-2">MITIGATION ACTIONS</label>
                <ul className="space-y-1.5">
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
                  <p className="text-sm font-mono text-cyan-400">QUERYING SAFETY NEURAL MODEL...</p>
                  <p className="text-xs text-slate-650 text-slate-400 mt-1 max-w-xs font-sans">Evaluating email body patterns, linguistic urgency weights, and typosquat signatures...</p>
                </>
              ) : (
                <>
                  <Mail className="h-12 w-12 text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400">Security diagnostic report pending.</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">Provide message criteria and execute scanning to deploy safety AI diagnostics.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
