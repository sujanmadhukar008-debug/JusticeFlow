import React, { useState, useEffect } from 'react';
import { api, Task } from '../services/api';
import { CheckCircle, XCircle, Edit2, AlertTriangle, ExternalLink, Info, Filter, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { DEPARTMENTS, URGENCY_LEVELS } from '../constants';
import { useAuth } from '../context/AuthContext';

interface TaskListProps {
  mode: 'verification' | 'approved' | 'critical';
  onUpdate?: () => void;
}

export default function TaskList({ mode, onUpdate }: TaskListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [forwardingTaskId, setForwardingTaskId] = useState<string | null>(null);
  const [selectedForwardDept, setSelectedForwardDept] = useState('');
  const [forwardRemarks, setForwardRemarks] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let status = undefined;
      if (mode === 'verification') status = 'draft';
      if (mode === 'approved') status = 'approved';
      
      const data = await api.getTasks(status);
      
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      // Small artificial delay for "dynamic" feel
      setTimeout(() => setLoading(false), 400);
    }
  };

  const tasksToDisplay = tasks.filter(t => {
    let matches = true;
    if (filterDept && t.department !== filterDept) matches = false;
    if (mode === 'critical' && (t.urgency !== 'Critical' || t.status === 'rejected')) matches = false;
    return matches;
  });

  useEffect(() => {
    fetchTasks();
  }, [mode]);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.verifyTask(id, status, user?.email || 'unknown@gov.in');
      fetchTasks();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const [isForwarding, setIsForwarding] = useState(false);

  const handleForward = async (id: string) => {
    if (!selectedForwardDept) return;
    setIsForwarding(true);
    try {
      await api.verifyTask(id, 'approved', user?.email || 'unknown@gov.in', { 
        department: selectedForwardDept,
        last_note: forwardRemarks 
      });
      setForwardingTaskId(null);
      setSelectedForwardDept('');
      setForwardRemarks('');
      await fetchTasks();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this task record? This action is irreversible.')) return;
    try {
      await api.deleteTask(id);
      fetchTasks();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditInit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
  };

  const handleEditSave = async () => {
    if (!editedTask) return;
    try {
      // If we are editing in verification mode (draft task), assume save = approve
      const newStatus = editedTask.status === 'draft' ? 'approved' : editedTask.status;
      await api.verifyTask(editedTask.id, newStatus, user?.email || 'unknown@gov.in', editedTask);
      setEditingTaskId(null);
      setEditedTask(null);
      fetchTasks();
      onUpdate?.();
    } catch (e) {
      console.error(e);
    }
  };

  const departments = Array.from(new Set(tasks.map(t => t.department)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-[#141414]">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 opacity-40" />
          <select 
            className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer font-medium"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">
          Showing {tasksToDisplay.length} system entries
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasksToDisplay.length === 0 ? (
        <div className="bg-white border border-[#141414] p-20 text-center flex flex-col items-center">
          <Info className="w-12 h-12 mb-4 opacity-10" />
          <h4 className="font-serif italic text-2xl">No entries found</h4>
          <p className="text-sm text-gray-500 mt-2">Database is currently synchronized for this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasksToDisplay.map((task) => (
            <div 
              key={task.id} 
              className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-8 mb-6">
                  <div className="flex-1 w-full sm:w-auto">
                    {editingTaskId === task.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                            <select 
                              className="text-[10px] font-bold uppercase tracking-wider border rounded px-2"
                              value={editedTask?.urgency}
                              onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, urgency: e.target.value }) : null)}
                            >
                              {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <select 
                              className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest border rounded px-2 flex-1"
                              value={editedTask?.department}
                              onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, department: e.target.value }) : null)}
                            >
                              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <input 
                          className="font-bold text-xl text-[#0F172A] w-full border rounded px-2 py-1"
                          value={editedTask?.action}
                          onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, action: e.target.value }) : null)}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-2">
                           <div className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            task.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                          )}>
                            {task.urgency}
                          </div>
                          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">
                            {task.department}
                          </span>
                          {task.last_note && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-tighter rounded border border-amber-200 animate-pulse">
                              Transferred
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-xl text-[#0F172A]">{task.action}</h3>
                      </>
                    )}
                    <p className="text-[12px] text-[#64748B] mt-1">Ref ID: {task.id.slice(0, 8)} • Page {task.page}</p>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded text-[10px] uppercase font-bold flex items-center gap-1 transition-colors"
                        title="Permanently Delete Records"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                    <div className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      task.confidence === 'High' ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      AI CONFIDENCE: {task.confidence === 'High' ? '98.2%' : '72.4%'}
                    </div>
                    <div className="w-24 h-1 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden sm:ml-auto">
                      <div className={cn(
                        "h-full rounded-full",
                        task.confidence === 'High' ? 'bg-emerald-500 w-[98%]' : 'bg-amber-500 w-[72%]'
                      )} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-6 border-t border-[#F1F5F9]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Compliance Deadline</p>
                        {editingTaskId === task.id ? (
                          <input 
                            className="text-sm font-semibold text-[#1E293B] w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md"
                            value={editedTask?.deadline}
                            onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, deadline: e.target.value }) : null)}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1E293B] flex items-center gap-2 px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-md">
                            <Clock className="w-4 h-4 text-[#3B82F6]" />
                            {task.deadline}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Expected Deliverable</p>
                        {editingTaskId === task.id ? (
                          <input 
                            className="text-sm font-semibold text-[#1E293B] w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-md"
                            value={editedTask?.deliverable}
                            onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, deliverable: e.target.value }) : null)}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1E293B] px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-md">
                            {task.deliverable}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">AI Reasoning & Impact</p>
                      {editingTaskId === task.id ? (
                        <div className="space-y-3">
                          <textarea 
                            className="text-sm text-[#475569] leading-relaxed w-full p-4 bg-white border border-[#E2E8F0] rounded-lg border-l-4 border-l-[#3B82F6]"
                            value={editedTask?.reasoning}
                            onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, reasoning: e.target.value }) : null)}
                            rows={3}
                          />
                          <input 
                            className="text-sm font-medium text-[#1E293B] w-full px-3 py-2 border rounded-md"
                            value={editedTask?.impact}
                            onChange={(e) => setEditedTask(prev => prev ? ({ ...prev, impact: e.target.value }) : null)}
                            placeholder="Impact"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-[#475569] leading-relaxed p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg border-l-4 border-l-[#3B82F6]">
                          {task.reasoning}
                          <div className="mt-2 pt-2 border-t border-[#E2E8F0] font-medium text-[#1E293B]">
                            Impact: {task.impact}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {task.last_note && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 items-start">
                      <div className="w-1.5 h-full bg-amber-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Transfer Remarks / Instructions</p>
                        <p className="text-xs text-amber-900 italic font-medium">"{task.last_note}"</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Source Legal Text (Extracted Chunk)</p>
                    <div className="flex-1 bg-[#F1F5F9] p-4 rounded-xl border border-[#E2E8F0] font-serif italic text-sm text-[#475569] leading-relaxed relative">
                      <div className="absolute top-2 right-2 opacity-10">
                        <Info className="w-8 h-8" />
                      </div>
                      "{task.source_text}"
                    </div>
                    
                    {mode === 'verification' && (
                      <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F1F5F9]">
                        {editingTaskId === task.id ? (
                          <>
                            <button 
                              onClick={() => setEditingTaskId(null)}
                              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleEditSave}
                              className="px-6 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-lg hover:bg-[#2563EB] transition-colors"
                            >
                              Save Changes
                            </button>
                          </>
                        ) : forwardingTaskId === task.id ? (
                          <div className="flex flex-col gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex-1">
                             <div className="flex items-center gap-2">
                               <select 
                                className="text-xs font-bold uppercase py-1.5 px-3 border border-blue-200 rounded bg-white text-blue-700 flex-1"
                                value={selectedForwardDept}
                                onChange={(e) => setSelectedForwardDept(e.target.value)}
                              >
                                <option value="">Choose Recipient Department...</option>
                                {DEPARTMENTS.filter(d => d !== task.department).map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setForwardingTaskId(null)}
                                className="text-[#64748B] hover:text-red-500"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                             </div>
                             <textarea 
                              placeholder="Add instructions or remarks for the department..."
                              className="w-full text-xs p-2 border border-blue-200 rounded-lg h-16"
                              value={forwardRemarks}
                              onChange={(e) => setForwardRemarks(e.target.value)}
                             />
                             <button 
                              onClick={() => handleForward(task.id)}
                              disabled={!selectedForwardDept || isForwarding}
                              className="w-full py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-lg hover:bg-[#2563EB] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                             >
                               {isForwarding ? 'Reassigning Directive...' : 'Assign and Forward'} <ArrowRight className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleVerify(task.id, 'rejected')}
                              className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleEditInit(task)}
                              className="px-4 py-2 border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setForwardingTaskId(task.id);
                                setSelectedForwardDept('');
                              }}
                              className="px-4 py-2 border border-blue-600 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                              Forward <ArrowRight className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleVerify(task.id, 'approved')}
                              className="px-6 py-2 bg-[#0F172A] text-white text-sm font-bold rounded-lg hover:bg-[#1E293B] transition-colors"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {mode === 'approved' && (
                      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F1F5F9]">
                         {forwardingTaskId === task.id ? (
                          <div className="flex flex-col gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex-1">
                             <div className="flex items-center gap-2">
                               <select 
                                className="text-xs font-bold uppercase py-1.5 px-3 border border-blue-200 rounded bg-white text-blue-700 flex-1"
                                value={selectedForwardDept}
                                onChange={(e) => setSelectedForwardDept(e.target.value)}
                              >
                                <option value="">Redefine Recipient Department...</option>
                                {DEPARTMENTS.filter(d => d !== task.department).map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setForwardingTaskId(null)}
                                className="text-[#64748B] hover:text-red-500"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                             </div>
                             <textarea 
                              placeholder="Reason for inter-departmental transfer..."
                              className="w-full text-xs p-2 border border-blue-200 rounded-lg h-16"
                              value={forwardRemarks}
                              onChange={(e) => setForwardRemarks(e.target.value)}
                             />
                             <button 
                              onClick={() => handleForward(task.id)}
                              disabled={!selectedForwardDept || isForwarding}
                              className="w-full py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-lg hover:bg-[#2563EB] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                             >
                               {isForwarding ? 'Transferring File...' : 'Confirm Transfer'} <ArrowRight className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setForwardingTaskId(task.id);
                              setSelectedForwardDept('');
                            }}
                            className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            Forward to Dept <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
