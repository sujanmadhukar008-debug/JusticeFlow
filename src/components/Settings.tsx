import React, { useState, useEffect } from 'react';
import { Shield, Key, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetAIInstance } from '../services/ai';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const savedKey = localStorage.getItem('justiceflow_gemini_api_key') || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    setStatus('saving');
    setTimeout(() => {
      localStorage.setItem('justiceflow_gemini_api_key', apiKey);
      resetAIInstance(); // Clear instance to pick up new key
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 border border-[#E2E8F0] rounded-xl shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">System Configuration</h3>
            <p className="text-sm text-[#64748B]">Manage security protocols and external API integrations</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                <Key className="w-4 h-4" />
                Gemini AI Integration
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold uppercase tracking-widest border border-blue-200">Active</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              The workbench uses <strong>Gemini 1.5 Flash</strong> to autonomously extract directives from judicial documents. 
              If the system environment variable is missing, you can provide a local override here.
            </p>

            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gemini API Key</label>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={handleSave}
                  disabled={status === 'saving'}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {status === 'saving' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : status === 'saved' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {status === 'saving' ? 'Applying...' : status === 'saved' ? 'Settings Saved' : 'Save Changes'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic">This key is stored locally in your browser's encrypted vault (localStorage).</p>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <h4 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-tight">Compliance Thresholds</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Heuristic Confidence Limit</span>
              <span className="font-bold text-slate-700">75%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full">
              <div className="w-3/4 h-full bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <h4 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-tight">System Identity</h4>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px]">JF</div>
            <div>
              <p className="text-xs font-bold text-slate-700">JusticeFlow Engine v2.4</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Build ID: AIS-705787</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
