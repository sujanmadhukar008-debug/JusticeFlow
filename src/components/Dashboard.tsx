import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

interface Stats {
  totalJudgments: number;
  pendingVerification: number;
  approvedTasks: number;
  transferredTasks: number;
}

export default function Dashboard({ stats }: { stats: Stats }) {
  const [deptStats, setDeptStats] = useState<{ department: string, count: number }[]>([]);
  const [recentApproved, setRecentApproved] = useState<any[]>([]);

  useEffect(() => {
    api.getDeptStats().then(setDeptStats).catch(console.error);
    api.getTasks('approved').then(tasks => setRecentApproved(tasks.slice(0, 3))).catch(console.error);
  }, [stats.approvedTasks, stats.pendingVerification, stats.totalJudgments]);

  const cards = [
    { label: 'Total Judgments', value: stats.totalJudgments, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Verification', value: stats.pendingVerification, icon: Clock, color: 'bg-amber-500' },
    { label: 'Approved Actions', value: stats.approvedTasks, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Inter-Dept Transfers', value: stats.transferredTasks, icon: AlertCircle, color: 'bg-indigo-500' },
  ];

  const totalApproved = deptStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${card.color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest leading-none font-bold mb-1">Metrics 0{i+1}</p>
                  {(i === 0 || i === 1 || i === 3) && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Live Sync</span>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1 text-[#1E293B]">{card.value}</h3>
              <p className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 border border-[#E2E8F0] rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F1F5F9]">
            <h4 className="font-bold text-lg text-[#1E293B]">Recent System Activity</h4>
            <button className="text-[12px] font-bold text-[#3B82F6] hover:underline">View All Logs</button>
          </div>
          <div className="space-y-6">
            {recentApproved.length > 0 ? (
              recentApproved.map((task, i) => (
                <div key={task.id} className="flex items-center gap-4 py-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#334155] line-clamp-1">{task.action}</p>
                    <p className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider">{task.department} • Ref: {task.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest rounded-full border border-emerald-100">Approved</span>
                  </div>
                </div>
              ))
            ) : stats.pendingVerification > 0 ? (
              <div className="flex items-center gap-4 py-1 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#334155]">Verification Pending</p>
                  <p className="text-[11px] text-[#94A3B8] font-medium">{stats.pendingVerification} directives awaiting manual review</p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-sm italic">
                Awaiting manual verification of extracted directives...
              </div>
            )}
            <div className="flex items-center gap-4 py-1 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center font-bold text-[#64748B] text-xs">
                AI
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#334155]">Extraction Engine Pulse</p>
                <p className="text-[11px] text-[#94A3B8] font-medium">Monitoring case files for new judicial mandates</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-[#94A3B8] font-mono">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] text-white p-8 rounded-xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <h4 className="font-bold text-lg mb-8 text-[#F8FAFC] relative z-10">Directive Distribution</h4>
          <div className="space-y-8 relative z-10">
            {deptStats.length > 0 && totalApproved > 0 ? deptStats.map((dept, idx) => (
              <div key={dept.department}>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-2.5 text-[#94A3B8]">
                  <span>{dept.department}</span>
                  <span className={idx === 0 ? "text-[#3B82F6]" : idx === 1 ? "text-emerald-500" : "text-amber-500"}>
                    {Math.round((dept.count / totalApproved) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", idx === 0 ? "bg-[#3B82F6]" : idx === 1 ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${(dept.count / totalApproved) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500 italic">No approved directives to map.</p>
                <div className="mt-4 flex justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse delay-150" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-12 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[11px] font-medium text-[#94A3B8] leading-relaxed italic">
              "Statistical mapping derived from heuristic analysis of legal directives. Confidence scoring active."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
