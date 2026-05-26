import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, ShieldCheck, Mail, Globe, Image as ImageIcon, Trash2, Calendar, FileText } from 'lucide-react';
import { DashboardStats, ScanReport } from '../types';

interface StatsOverviewProps {
  stats: DashboardStats;
  onSelectScan: (item: any) => void;
  onNavigate: (tab: string) => void;
}

export default function StatsOverview({ stats, onSelectScan, onNavigate }: StatsOverviewProps) {
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<string | null>(null);

  // SVG Chart Computations for category count
  const total = stats.totalScans || 1;
  const emailPct = Math.round(((stats.categories?.email || 0) / total) * 100);
  const urlPct = Math.round(((stats.categories?.url || 0) / total) * 100);
  const imagePct = Math.round(((stats.categories?.image || 0) / total) * 100);

  // SVG Circle calculations for overall Risk Index
  const riskColor = stats.avgThreatScore > 70 
    ? 'stroke-red-500' 
    : stats.avgThreatScore > 35 
      ? 'stroke-yellow-500' 
      : 'stroke-emerald-500';

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.avgThreatScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Visual Header Banner - Frosted Design */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl animate-fade-in relative">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 pointer-events-none md:block hidden">
          {/* Futuristic matrix-grid line graphic */}
          <svg className="w-full h-full text-cyan-400" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,100 M20,0 L100,80 M40,0 L100,60 M0,20 L80,100 M0,40 L60,100" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2,2" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 font-mono mb-4">
            <Activity className="h-3 w-3 animate-pulse" /> SECURITY OPERATION CENTER ACTIVE
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
            AI Threat Guard <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Command Center</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-300">
            Real-time phishing countermeasures verified by Google Gemini deep learning safety processors. Paste messages, check credentials vectors, or inspect website screenshots instantly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('email-scanner')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Mail className="h-4 w-4" /> Scan Email
            </button>
            <button
              onClick={() => onNavigate('url-scanner')}
              className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-xs md:text-sm font-semibold text-cyan-400 transition hover:bg-white/10 cursor-pointer"
            >
              <Globe className="h-4 w-4" /> Scan Link URL
            </button>
            <button
              onClick={() => onNavigate('screenshot-scanner')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <ImageIcon className="h-4 w-4" /> Upload Screenshot
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total scans Card */}
        <div className="rounded-2xl border border-white/5 bg-black/30 p-5 backdrop-blur-md hover:border-white/10 transition-all font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-400 font-mono font-medium">TOTAL THREAT SCANS</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Activity className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">{stats.totalScans}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-450 text-slate-400">
            <span className="text-cyan-400">Gemini-certified</span> audit trail
          </div>
        </div>

        {/* Dangerous count Card */}
        <div className="rounded-2xl border border-red-500/10 bg-black/30 p-5 backdrop-blur-md hover:border-red-500/20 transition-all font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-400 font-mono font-medium">DANGEROUS LEAKS</span>
            <div className="rounded-lg bg-red-500/10 p-2 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-red-400 font-mono">{stats.dangerousCount}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-red-500/70">
            <span>Immediate disposal required</span>
          </div>
        </div>

        {/* Suspicious reports Card */}
        <div className="rounded-2xl border border-yellow-500/10 bg-black/30 p-5 backdrop-blur-md hover:border-yellow-500/20 transition-all font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-400 font-mono font-medium">SUSPICIOUS FLAGGED</span>
            <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-405 text-yellow-400 border border-yellow-400/20">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-yellow-400 font-mono">{stats.suspiciousCount}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-yellow-505 text-yellow-500/75">
            <span>Review red indicators</span>
          </div>
        </div>

        {/* Safe reports Card */}
        <div className="rounded-2xl border border-emerald-500/10 bg-black/30 p-5 backdrop-blur-md hover:border-emerald-500/20 transition-all font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-slate-400 font-mono font-bold text-emerald-400">SAFE ARTIFACTS</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">{stats.safeCount}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-505 text-emerald-500/75">
            <span>Verified safe records</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics and Charts Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Index circular gauge */}
        <div className="rounded-2xl border border-white/5 bg-black/30 p-6 backdrop-blur-md flex flex-col items-center justify-between text-center min-h-[300px]">
          <div className="w-full text-left font-mono text-xs font-semibold text-slate-400 tracking-wider">
            SYSTEM AVERAGE RISK SEVERITY
          </div>
          
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Background loop */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Dynamic threat arc */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`transition-all duration-1000 ease-out ${riskColor}`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono">{stats.avgThreatScore}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 font-semibold">SCORE</span>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            {stats.avgThreatScore > 70 ? (
              <span className="text-red-400 font-semibold text-[11px] font-mono leading-relaxed block">⚠️ HIGH RISK THREAT STATE</span>
            ) : stats.avgThreatScore > 35 ? (
              <span className="text-yellow-400 font-medium text-[11px] font-mono leading-relaxed block">🛡️ MODERATE SUSPECT ANOMALY</span>
            ) : (
              <span className="text-emerald-400 font-medium text-[11px] font-mono leading-relaxed block">✅ SECURE DIGITAL ARCHIVE</span>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Based on the average score weighting across all verified input elements in your security console account.
            </p>
          </div>
        </div>

        {/* Category breakdown bar charts */}
        <div className="rounded-2xl border border-white/5 bg-black/30 p-6 backdrop-blur-md flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="font-mono text-xs font-semibold text-slate-400 tracking-wider mb-6">
              SCAN COMPOSITION ANALYSIS
            </div>
            
            <div className="space-y-4">
              {/* Mail Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium"><Mail className="h-3.5 w-3.5 text-cyan-400" /> Email Spying Logs</span>
                  <span className="font-mono text-slate-400">{stats.categories?.email || 0} ({emailPct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${stats.totalScans ? emailPct : 0}%` }}></div>
                </div>
              </div>

              {/* URL Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium"><Globe className="h-3.5 w-3.5 text-cyan-400" /> Typosquatting URLs</span>
                  <span className="font-mono text-slate-400">{stats.categories?.url || 0} ({urlPct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full" style={{ width: `${stats.totalScans ? urlPct : 0}%` }}></div>
                </div>
              </div>

              {/* Image Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium"><ImageIcon className="h-3.5 w-3.5 text-purple-400" /> Image Vision Crops</span>
                  <span className="font-mono text-slate-400">{stats.categories?.image || 0} ({imagePct}%)</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${stats.totalScans ? imagePct : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3">
            To view individual logs, select <button onClick={() => onNavigate('threat-reports')} className="text-cyan-400 hover:underline cursor-pointer">Threat Reports</button> in the navigation panel or command center options list.
          </div>
        </div>

        {/* Threat Level ratio SVG bar graph */}
        <div className="rounded-2xl border border-white/5 bg-black/30 p-6 backdrop-blur-md flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="font-mono text-xs font-semibold text-slate-400 tracking-wider mb-4">
              COMPROMISE SCALE SECTOR RATIO
            </div>

            <div className="relative h-20 w-full bg-black/45 rounded-lg flex items-center justify-center overflow-hidden mb-6 p-2 border border-white/5">
              {stats.totalScans > 0 ? (
                <div className="flex w-full h-8 rounded overflow-hidden">
                  <div className="bg-red-500 transition-all" style={{ width: `${(stats.dangerousCount / total) * 100}%` }} title="Dangerous" />
                  <div className="bg-yellow-500 transition-all" style={{ width: `${(stats.suspiciousCount / total) * 100}%` }} title="Suspicious" />
                  <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.safeCount / total) * 100}%` }} title="Safe" />
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">No scanning inputs recorded this session.</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 border border-white/5 rounded-xl bg-white/[0.02]">
                <div className="text-[10px] text-red-500 font-bold font-mono uppercase">Dangerous</div>
                <div className="text-base font-extrabold font-mono text-white mt-1">{stats.dangerousCount}</div>
              </div>
              <div className="p-2 border border-white/5 rounded-xl bg-white/[0.02]">
                <div className="text-[10px] text-yellow-500 font-bold font-mono uppercase">Suspicious</div>
                <div className="text-base font-extrabold font-mono text-white mt-1">{stats.suspiciousCount}</div>
              </div>
              <div className="p-2 border border-white/5 rounded-xl bg-white/[0.02]">
                <div className="text-[10px] text-emerald-500 font-bold font-mono uppercase">Safe</div>
                <div className="text-base font-extrabold font-mono text-white mt-1">{stats.safeCount}</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-center text-slate-400 border-t border-white/5 pt-3">
            Red alerts signify malicious intent demanding absolute quarantine measures.
          </div>
        </div>
      </div>

      {/* Threat Activity Timeline Feed */}
      <div className="rounded-2xl border border-white/5 bg-black/30 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" /> Threat Activity Feed
          </h2>
          <span className="text-xs font-mono text-slate-400">Live operational scan logs</span>
        </div>

        {stats.timeline && stats.timeline.length > 0 ? (
          <div className="divide-y divide-slate-900">
            {stats.timeline.slice(0, 5).map((item) => {
              const scoreBadgeColor = item.threatScore > 75 
                ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                : item.threatScore > 35 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

              const itemIcon = item.type === 'email' 
                ? <Mail className="h-3.5 w-3.5 text-blue-400" />
                : item.type === 'url'
                  ? <Globe className="h-3.5 w-3.5 text-teal-400" />
                  : <ImageIcon className="h-3.5 w-3.5 text-purple-400" />;

              return (
                <div key={item.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-slate-900/20 px-2 rounded-lg transition-colors pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
                      {itemIcon}
                    </div>
                    <div className="space-y-0.5 max-w-[280px] sm:max-w-md md:max-w-xl truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white capitalize">{item.type} Scan report</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">{item.id}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono truncate">{item.preview || '(Log analysis contents omitted)'}</p>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className={`text-xs px-2.5 py-1 rounded-full border text-center font-mono font-bold ${scoreBadgeColor}`}>
                      SCORE {item.threatScore} ({item.level})
                    </div>
                    <button
                      onClick={() => {
                        // Locate full report from history and load details modal
                        onSelectScan(item as any);
                      }}
                      className="text-xs text-blue-400 hover:text-white border border-blue-500/30 bg-slate-900/50 hover:bg-blue-600 rounded-lg px-3 py-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      Audit Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 flex flex-col items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-emerald-500/40 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No security logs generated.</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Submit emails, URLs, or screenshots using the scanners above to trace threat vectors.</p>
          </div>
        )}
      </div>
    </div>
  );
}
