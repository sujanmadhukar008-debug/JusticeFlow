import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadView from './components/UploadView';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import { api } from './services/api';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalJudgments: 0, pendingVerification: 0, approvedTasks: 0, transferredTasks: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, login, isAuthenticated } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0F172A] p-6">
        <div className="max-w-md w-full bg-[#1E293B] border border-[#334155] p-10 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-2xl flex items-center justify-center border border-[#3B82F6]/30">
              <ShieldCheck className="w-10 h-10 text-[#3B82F6]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2 text-sans tracking-tight">justiceflow</h1>
          <p className="text-slate-400 text-center text-sm mb-8 font-medium italic">Federal Judgment Compliance Portal</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Access Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name.officer@gov.in"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all"
                />
              </div>
            </div>
            <button 
              onClick={() => login(loginEmail || 'guest.officer@gov.in')}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Authenticate Session
            </button>
            <p className="text-[9px] text-[#475569] text-center uppercase tracking-widest mt-6 font-mono">Secure Sandbox Environment v2.4</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] text-[#1E293B] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="bg-white border-b border-[#E2E8F0] min-h-[64px] flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-2 sm:py-0 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 -ml-2 text-[#64748B] hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div>
              <h2 className="font-semibold text-[16px] sm:text-[18px] tracking-tight truncate max-w-[200px] sm:max-w-none">
                {activeTab === 'dashboard' ? 'Compliance Workbench' : activeTab.replace('_', ' ')}
              </h2>
              <p className="hidden xs:block text-[10px] sm:text-[12px] text-[#64748B]">Active User: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex gap-2">
              <div className="bg-[#FEE2E2] text-[#991B1B] px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#991B1B]" />
                {stats.pendingVerification} Pending
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider leading-tight">Admin Section</p>
                <div className="text-[11px] font-medium leading-tight">{user?.department || 'Compliance Unit'}</div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#3B82F6] border border-[#3B82F6]/20 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs">
                {user?.name.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <Dashboard stats={stats} />}
                {activeTab === 'upload' && <UploadView onComplete={() => setActiveTab('verification')} />}
                {activeTab === 'verification' && <TaskList mode="verification" onUpdate={fetchStats} />}
                {activeTab === 'approved' && <TaskList mode="approved" onUpdate={fetchStats} />}
                {activeTab === 'critical' && <TaskList mode="critical" onUpdate={fetchStats} />}
                {activeTab === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
