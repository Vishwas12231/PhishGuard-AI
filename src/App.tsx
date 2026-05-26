import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Mail, Globe, Image as ImageIcon,
  Bot, FileText, Settings, LogIn, LogOut, UserPlus, Flame,
  Loader2, Radio, Server, Fingerprint, Lock, Key, AlertCircle, Menu, X,
  Eye, EyeOff
} from 'lucide-react';

import { User, AuthState, ScanReport, DashboardStats } from './types.js';

import StatsOverview from './components/StatsOverview.tsx';
import EmailScanner from './components/EmailScanner.tsx';
import UrlScanner from './components/UrlScanner.tsx';
import ScreenshotScanner from './components/ScreenshotScanner.tsx';
import CyberConsultant from './components/CyberConsultant.tsx';
import ThreatHistory from './components/ThreatHistory.tsx';
import LearningCenter from './components/LearningCenter.tsx';
import ReportDetailsModal from './components/ReportDetailsModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Security session authentications
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  // Authentication inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitLoading, setAuthSubmitLoading] = useState(false);

  // Core database states
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    dangerousCount: 0,
    suspiciousCount: 0,
    safeCount: 0,
    avgThreatScore: 0,
    categories: { email: 0, url: 0, image: 0 },
    timeline: []
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<ScanReport | null>(null);

  // Boot and read secure credentials from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('phishguard_token');
    const savedUser = localStorage.getItem('phishguard_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Re-verify profile through secure JWT auth
      verifySession(savedToken);
    } else {
      // Ensure there is a guest token in localStorage for session tracking
      let guestToken = localStorage.getItem('phishguard_guest_token');
      if (!guestToken) {
        guestToken = 'guest_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('phishguard_guest_token', guestToken);
      }
      setToken(guestToken);
      setAuthLoading(false);
      fetchDashboardStats(guestToken);
    }
  }, []);

  const verifySession = async (jwtToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        fetchDashboardStats(jwtToken);
      } else {
        // Clear stale session
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to authenticate backend session, loading fallback:', err);
      fetchDashboardStats(jwtToken); // Try loading anyway
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchDashboardStats = async (jwtToken: string | null) => {
    setReportsLoading(true);
    try {
      // 1. Fetch KPI Statistics values
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch list of scanning reports
      const reportsRes = await fetch('/api/scan/history', {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
      });
      if (reportsRes.ok) {
        const reprData = await reportsRes.json();
        setReports(reprData.reports || []);
      }
    } catch (err) {
      console.error('Network failed to fetch scan registers:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          fullName: authFullName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed.');
      }

      localStorage.setItem('phishguard_token', data.token);
      localStorage.setItem('phishguard_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthMode(null);
      
      // Auto-fetch data for the new account
      fetchDashboardStats(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Gateway registration failure.');
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Sign in credentials invalid.');
      }

      localStorage.setItem('phishguard_token', data.token);
      localStorage.setItem('phishguard_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthMode(null);

      // Fetch dynamic analytics
      fetchDashboardStats(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Authentification failure.');
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('phishguard_token');
    localStorage.removeItem('phishguard_user');
    setUser(null);
    setActiveTab('dashboard');

    let guestToken = localStorage.getItem('phishguard_guest_token');
    if (!guestToken) {
      guestToken = 'guest_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('phishguard_guest_token', guestToken);
    }
    setToken(guestToken);
    fetchDashboardStats(guestToken);
  };

  const handleDeleteReport = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/scan/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        fetchDashboardStats(token);
      }
    } catch (err) {
      console.error('Failed to remove scanning document:', err);
    }
  };

  // Navigations switcher tabs
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ShieldAlert },
    { id: 'email-scanner', label: 'Email Scanner', icon: Mail },
    { id: 'url-scanner', label: 'URL Scanner', icon: Globe },
    { id: 'screenshot-scanner', label: 'screenshot AI', icon: ImageIcon },
    { id: 'chat', label: 'Defense Chat', icon: Bot },
    { id: 'threat-reports', label: 'Threat Reports', icon: FileText },
    { id: 'learning', label: 'Challenge Box', icon: Flame },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-900 print:bg-white print:text-black relative">
      
      {/* Dynamic Cyber Grid decorative background */}
      <div className="fixed inset-0 cyber-grid opacity-15 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.25)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Primary Application Header Bar - Frosted Glass */}
      <header className="sticky top-0 z-40 bg-black/40 border-b border-white/10 backdrop-blur-2xl px-4 sm:px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)] print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PHISHGUARD AI</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-cyan-400 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded">OP_STATION_V35</span>
          </div>
        </div>

        {/* Action Header controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white max-w-[120px] truncate">{user.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthFullName('');
                  setAuthMode('login');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </button>
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthFullName('');
                  setAuthMode('signup');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </button>
            </div>
          )}

          {/* Mobile responsive toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded border border-white/10 bg-white/5 text-slate-450 text-slate-300 hover:bg-white/10 lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex z-10 p-4 sm:p-6 gap-6 relative print:p-0 print:border-none">
        
        {/* Desktop Left Sidebar Rail */}
        <nav className="hidden lg:flex flex-col w-60 shrink-0 space-y-1 print:hidden z-10">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-3 mb-3 block">Security Suite</span>
          {navItems.map((item) => {
            const IconComp = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-semibold transition-all uppercase cursor-pointer ${
                  active 
                    ? 'bg-white/5 text-cyan-400 border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] shrink-0"></span>
                )}
                <IconComp className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile menu sheet */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-black/90 border-b border-white/10 p-4 z-50 flex flex-col gap-1 lg:hidden animate-fade-in print:hidden backdrop-blur-2xl">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-semibold transition uppercase cursor-pointer ${
                    active ? 'bg-white/10 text-cyan-400 border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Master Workspace Box */}
        <main className="flex-1 w-full min-w-0 print:p-0 z-10">
          {authLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-3" />
              <p className="text-xs font-mono text-slate-500 uppercase">Synchronizing session parameters...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <StatsOverview
                  stats={stats}
                  onSelectScan={(timelineItem: any) => {
                    const foundReport = reports.find(r => r.id === timelineItem.id);
                    if (foundReport) {
                      setActiveReport(foundReport);
                    } else {
                      const fallback: ScanReport = {
                        id: timelineItem.id,
                        type: timelineItem.type,
                        createdAt: timelineItem.timestamp,
                        inputData: timelineItem.type === 'email' 
                          ? { senderEmail: timelineItem.preview } 
                          : timelineItem.type === 'url' 
                            ? { url: timelineItem.preview } 
                            : { fileName: timelineItem.preview },
                        result: {
                          threatScore: timelineItem.threatScore,
                          threatLevel: timelineItem.level,
                          explanation: 'Archived threat brief preview.',
                          mitigationAdvice: ['Review full system logs.', 'Verify origin security credentials.'],
                          indicators: [timelineItem.level]
                        }
                      };
                      setActiveReport(fallback);
                    }
                  }}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'email-scanner' && (
                <EmailScanner
                  onScanComplete={() => fetchDashboardStats(token)}
                  token={token}
                />
              )}

              {activeTab === 'url-scanner' && (
                <UrlScanner
                  onScanComplete={() => fetchDashboardStats(token)}
                  token={token}
                />
              )}

              {activeTab === 'screenshot-scanner' && (
                <ScreenshotScanner
                  onScanComplete={() => fetchDashboardStats(token)}
                  token={token}
                />
              )}

              {activeTab === 'chat' && (
                <CyberConsultant
                  token={token}
                />
              )}

              {activeTab === 'threat-reports' && (
                <ThreatHistory
                  reports={reports}
                  loading={reportsLoading}
                  onDeleteReport={handleDeleteReport}
                  onSelectScan={setActiveReport}
                  token={token}
                />
              )}

              {activeTab === 'learning' && (
                <LearningCenter />
              )}

              {activeTab === 'settings' && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-cyan-400" /> Platform Configurations & Security Tokens
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure your local workspace coordinates, inspect state database registries, and review access keys.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Database status */}
                    <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-3">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Server className="h-4 w-4 text-cyan-400" /> FILE PERSISTENCE CONFIGURATION
                      </span>
                      <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">Database Driver:</span>
                          <span className="font-mono text-cyan-400">Local JSON Registry</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">Archived Reports Count:</span>
                          <span className="font-mono text-cyan-400">{reports.length} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">Session Mode:</span>
                          <span className="font-mono text-cyan-400">{user ? 'Personal SECURE Profile' : 'Public Guest / Demo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* API and secret indications */}
                    <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-3">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Fingerprint className="h-4 w-4 text-purple-400" /> DEEP LEARNING MODEL TELEMETRY
                      </span>
                      <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">Vertex AI Target:</span>
                          <span className="font-mono text-purple-400">Google Gemini</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">Core Model ID:</span>
                          <span className="font-mono text-purple-400">gemini-3.5-flash</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-mono text-[11px]">API Key Authorization:</span>
                          <span className="font-mono text-emerald-400">CALIBRATED SECURE</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual configuration instructions */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 leading-relaxed font-sans">
                    <span className="font-bold text-white block mb-1">🔑 Note on Environment Variables</span>
                    API credentials like <span className="text-cyan-400 font-mono">GEMINI_API_KEY</span> are controlled automatically using standard cloud vaults inside Google AI Studio. You never have to publish secret variables in plaintext inside application bundles.
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Persistent security status footer */}
      <footer className="bg-slate-950 border-t border-slate-900 px-4 py-3 pb-4 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-2 print:hidden z-10 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          SECURE ENCLAVE ACTIVE - JWT 256 SHIELD COORD_ID: {user?.id || 'GUEST_CONSOLE'}
        </span>
        <span>
          © 2026 PhishGuard AI Systems. Formulated on deep learning safety modules.
        </span>
      </footer>

      {/* User Login/Signup Overlays Modal */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4 relative">
            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center space-y-1">
              <div className="h-10 w-10 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-1">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white uppercase sm:tracking-wider">
                {authMode === 'login' ? 'Sign In to Guard Console' : 'Register Defender Profile'}
              </h3>
              <p className="text-[11px] text-slate-400">Access historical logs securely from any diagnostic machine.</p>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3.5 pt-2">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Defender Full Name</label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Officer John Doe"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Security Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Console Password Code</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-3 pr-10 py-2 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="rounded border border-red-500/20 bg-red-500/10 p-2.5 text-[11px] text-red-500 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
              >
                {authSubmitLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    Querying credentials...
                  </>
                ) : (
                  authMode === 'login' ? 'Authenticate Session' : 'Commit New Identity'
                )}
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
              {authMode === 'login' ? (
                <>
                  Require a secure identity file?{' '}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode('signup');
                    }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode('login');
                    }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details report zoom modal */}
      {activeReport && (
        <ReportDetailsModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}

    </div>
  );
}
