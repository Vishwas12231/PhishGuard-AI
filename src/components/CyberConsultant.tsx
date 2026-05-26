import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Trash2, Send, Bot, User, Loader2, Play, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { ChatMessage } from '../types';

interface CyberConsultantProps {
  token: string | null;
}

export default function CyberConsultant({ token }: CyberConsultantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested starter prompts
  const suggestions = [
    'How do I detect a homograph domain scam?',
    'What should I do if I clicked a suspicious link?',
    'Explain spear-phishing vs standard phishing.',
    'How does Google Safe Browsing protect web links?'
  ];

  // Fetch histories on mount
  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Keep messages scrolled to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.history || []);
      }
    } catch (err) {
      console.error('Failed to pull chat details:', err);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      message: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The chatbot module was unable to respond.');
      }

      const aiMsg: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        sender: 'ai',
        message: data.reply,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message || 'AI Assistant is currently offline. Please check connection parameters.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Wipe chat logs clean? This action is irreversible.')) return;
    try {
      const response = await fetch('/api/chat/clear', {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        setMessages([]);
        setError(null);
      }
    } catch (err) {
      setError('Failed to wipe session timeline.');
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Bot Identity bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center justify-center relative">
            <Bot className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">PhishGuard Security Advisor</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono">MODEL CHIP: GEMINI_2.5_FLASH_SECURE</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline cursor-pointer border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-xl font-mono"
          >
            <Trash2 className="h-3.5 w-3.5" /> Wipe Board
          </button>
        )}
      </div>

      {/* Main chat window split */}
      <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col overflow-hidden relative p-4 space-y-4">
        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Bot className="h-10 w-10 text-cyan-500/40 animate-bounce" />
              <div className="space-y-1 max-w-sm">
                <p className="text-xs sm:text-sm font-semibold text-slate-200">System initialization complete.</p>
                <p className="text-[11px] sm:text-xs text-slate-450 text-slate-400 leading-relaxed font-sans">
                  I am calibrated as the PhishGuard Security Advisor. Query me about credential lures, suspect sender techniques, or digital mitigation strategies.
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
                {suggestions.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="text-left text-[11px] font-sans text-slate-300 hover:text-white p-2.5 rounded-xl border border-white/5 bg-black/20 hover:bg-white/[0.04] hover:border-cyan-500/30 transition cursor-pointer flex gap-1.5 items-center font-medium"
                  >
                    <Play className="h-3 w-3 text-cyan-400 shrink-0" /> {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Character icon marker */}
                    <div className={`p-1.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isUser 
                        ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-350' 
                        : 'bg-white/[0.03] border-white/10 text-slate-300'
                    }`}>
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    {/* Chat Text Bubble */}
                    <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-cyan-950/40 text-cyan-50 border border-cyan-500/20' 
                        : 'bg-black/30 text-slate-200 border border-white/5'
                    }`}>
                      {/* Replace newlines with breaks or support paragraphing */}
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      
                      <span className="block text-[8px] font-mono text-slate-500 mt-1.5 text-right uppercase">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="p-1.5 h-8 w-8 rounded-full bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-spin">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-black/30 border border-white/5 text-slate-450 text-slate-400 text-xs italic flex items-center gap-2 font-sans">
                    <Loader2 className="h-3 w-3 animate-spin text-cyan-500" />
                    Querying cyber protection engines...
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box section */}
        <div className="border-t border-white/5 pt-3">
          {error && (
            <div className="mb-2 rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-[11px] text-red-400 flex items-center gap-1.5 font-sans">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              placeholder="Ask PhishGuard AI... e.g., 'What is bank voice phishing (vishing)?'"
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-505 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-650 hover:opacity-95 disabled:opacity-50 text-white transition shrink-0 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.25)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
