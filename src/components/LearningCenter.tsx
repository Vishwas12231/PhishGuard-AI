import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, ChevronRight, Play, AlertCircle, Info, Sparkles, RefreshCw, EyeOff } from 'lucide-react';

interface Scenario {
  id: number;
  title: string;
  source: string;
  body: string;
  options: Array<{ text: string; isCorrect: boolean; explanation: string }>;
  difficulty: 'Beginner' | 'Expert';
}

export default function LearningCenter() {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "The Coinbase Wallet Threat",
      source: "coinbase-support@securesignin-coinbase.xyz",
      body: "Security Alert: We locked your portfolio due to unauthorized crypto ledger transfer of 0.84 BTC on 2026-05-26. To reverse authorization, verify your security seed phrase within 30 minutes: https://accounts-coinbase.net/login/seed",
      difficulty: "Beginner",
      options: [
        {
          text: "Phishing Scam (Malicious Domain)",
          isCorrect: true,
          explanation: "Correct! The domain used is typo-squatted (coinbase.net instead of coinbase.com), utilizes a cheap .xyz TLD, and demands cryptographic seed phrase parameters, which Coinbase employees under no terms will ever ask of you."
        },
        {
          text: "Safe Communication Alert",
          isCorrect: false,
          explanation: "Incorrect. Major crypto portals will never host portals on lookalike domains or request physical recovery seed phrases via web browser hyperlinks."
        }
      ]
    },
    {
      id: 2,
      title: "Homograph Domain Homology",
      source: "admin@paypa1.com",
      body: "Dear PayPal user, please retrieve your tax invoice update using lookups: http://paypal-resolve.com/auth",
      difficulty: "Expert",
      options: [
        {
          text: "Safe Invoice Update",
          isCorrect: false,
          explanation: "Incorrect. Look closely at the sender. The sender address is spoofed with paypa1.com, replacing the final 'l' with numeric '1' (a standard international homograph lookalike glyph attack)."
        },
        {
          text: "Phishing Attack (Homograph glyph trick)",
          isCorrect: true,
          explanation: "Spot on! The domain is paypa1.com which mimics paypal.com by abusing standard character glyph structures."
        }
      ]
    },
    {
      id: 3,
      title: "The Unsolicited OTP Ingress",
      source: "Shortcode SMS 44030",
      body: "Your Chase credit line approval key code is: 933091. If you did not requisition this token, please cancel immediately via: https://chase-verification-cancel.support-server.net/validate",
      difficulty: "Expert",
      options: [
        {
          text: "Phishing Attack (OTP harvest model)",
          isCorrect: true,
          explanation: "Excellent work! This is an OTP harvest attack. Rather than verifying transaction alerts, the provided URL links to a credential collection module that harvests security answers."
        },
        {
          text: "Official Transaction alerts",
          isCorrect: false,
          explanation: "Incorrect. Authentic institutions never instruct customers to load credit links to cancel or invalidate system OTP structures."
        }
      ]
    }
  ];

  const handleOptionClick = (idx: number) => {
    if (submitted) return;
    setSelectedOptionIdx(idx);
  };

  const handleVerify = () => {
    if (selectedOptionIdx === null || submitted) return;
    setSubmitted(true);
    if (scenarios[currentScenarioIdx].options[selectedOptionIdx].isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOptionIdx(null);
    setSubmitted(false);
    setCurrentScenarioIdx((prev) => (prev + 1) % scenarios.length);
  };

  const activeScenario = scenarios[currentScenarioIdx];

  return (
    <div className="space-y-6">
      {/* Visual Hub header card */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400 animate-pulse" /> Cyber Intelligence Defense Center
        </h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Refine your threat identification intuition, test yourself against live homograph attacks, and review the corporate safety action plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive spot the phish simulation */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md lg:col-span-2 flex flex-col justify-between space-y-4 min-h-[420px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 tracking-wider">
                <Award className="h-4.5 w-4.5 text-yellow-500" /> SPOT THE PHISH CHALLENGE
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">STREAK: {score} / {scenarios.length}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase">{activeScenario.title}</h3>
                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                  activeScenario.difficulty === 'Expert' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  {activeScenario.difficulty} Level
                </span>
              </div>

              {/* Fake message graphic box */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono space-y-2 text-xs relative overflow-hidden">
                <div className="absolute right-0 top-0 text-[8px] bg-red-500/20 border-l border-b border-white/5 text-rose-300 px-2 py-0.5 font-sans font-bold">SUSPECT INBOUND ARTIFACT</div>
                <div>
                  <span className="text-slate-550 text-slate-400 text-slate-500 uppercase">From:</span> <span className="text-slate-300 select-all">{activeScenario.source}</span>
                </div>
                <div className="border-t border-white/5 my-2"></div>
                <p className="text-slate-200 leading-relaxed font-sans">{activeScenario.body}</p>
              </div>
            </div>

            {/* Multiple select buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {activeScenario.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionClick(i)}
                  className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    selectedOptionIdx === i
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-white/15 flex items-center justify-center shrink-0 bg-transparent">
                      {selectedOptionIdx === i && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            {submitted ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                  activeScenario.options[selectedOptionIdx || 0].isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/20 text-rose-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold uppercase mb-1 font-mono">
                    {activeScenario.options[selectedOptionIdx || 0].isCorrect ? '✅ ATTRACTIVE INFERENCE! CORRECT' : '❌ ANOMALY OVERLOOKED! FAIL'}
                  </div>
                  <p className="font-sans leading-relaxed text-slate-300">{activeScenario.options[selectedOptionIdx || 0].explanation}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-2 text-xs font-semibold text-white rounded-xl transition text-center cursor-pointer"
                >
                  Next Safety Simulation Case
                </button>
              </div>
            ) : (
              <button
                onClick={handleVerify}
                disabled={selectedOptionIdx === null}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm transition text-center cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Submit Decision Audit
              </button>
            )}
          </div>
        </div>

        {/* Corporate safety checklist and Homograph tools */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-xs font-bold text-slate-400 tracking-wider block mb-4 uppercase">
              ANTI-PHISHING SAFETY CODE
            </span>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Enforce Multilateral MFA</h4>
                  <p className="text-[11px] text-slate-450 text-slate-400 leading-relaxed font-sans">Lock high-priority login routes using hardware authenticator keys, preventing credential harvest leaks.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Cross-examine domain structures</h4>
                  <p className="text-[11px] text-slate-450 text-slate-400 leading-relaxed font-sans">Check link properties manually. Never update details on redirect parameters (e.g., .xyz, .top, .live TLDs).</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Deploy sandbox analyzers</h4>
                  <p className="text-[11px] text-slate-450 text-slate-400 leading-relaxed font-sans">Validate snapshots and bodies through PhishGuard AI models prior to credentials deployment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300 leading-relaxed font-sans">
            <span className="font-extrabold uppercase font-mono block mb-1">💡 COGNITIVE SCENARIO NOTES</span>
            Phishers harvest credentials by inducing feelings of panic, temporary membership closures, or unexpected bank updates. High structural friction is the core antivirus step.
          </div>
        </div>
      </div>
    </div>
  );
}
