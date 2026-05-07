import React from 'react';
import { LayoutDashboard, FileText, CheckCircle, Clock, ShieldCheck, UploadCloud, AlertTriangle, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { logout } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Compliance Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Judgment', icon: UploadCloud },
    { id: 'verification', label: 'Verification Queue', icon: Clock },
    { id: 'approved', label: 'Approved Actions', icon: CheckCircle },
    { id: 'critical', label: 'Critical Deadlines', icon: AlertTriangle },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <div className={cn(
        "fixed md:relative z-40 w-64 bg-[#0F172A] text-[#CBD5E1] h-screen flex flex-col border-r border-[#1E293B] transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#3B82F6]" />
              <h1 className="font-bold text-lg tracking-tight text-[#F8FAFC]">justiceflow</h1>
            </div>
            {setIsOpen && (
              <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1 text-[#94A3B8] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-40 font-mono">GOV-DEPT instance v2.4</p>
        </div>
        
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen?.(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded-md",
                  isActive ? "text-[#F8FAFC] bg-[#1E293B]" : "text-[#CBD5E1] hover:bg-[#1E293B]/50 hover:text-[#F8FAFC]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#3B82F6]" : "opacity-70")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-[#1E293B]">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all rounded-md"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      <div className="p-4">
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155]">
          <p className="text-[10px] text-[#94A3B8] uppercase mb-2 font-mono font-bold tracking-wider">System Integrity</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-[#CBD5E1]">Connection Stable</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
