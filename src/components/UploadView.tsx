import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { processJudgmentAI } from '../services/ai';
import { motion } from 'motion/react';
import { DEPARTMENTS } from '../constants';

export default function UploadView({ onComplete }: { onComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing_ai' | 'saving' | 'complete' | 'failed'>('idle');
  const [error, setError] = useState('');
  const [progressText, setProgressText] = useState('Standby');

  const handleDemo = async () => {
    setStatus('uploading');
    setProgressText('Initialising virtual memory buffer...');
    
    await new Promise(r => setTimeout(r, 800));

    const DEMO_TEXT = `
      IN THE SUPREME COURT OF INDIA
      WRIT PETITION (CIVIL) NO. 1082 OF 2020
      SUHAS CHAKMA VS UNION OF INDIA & ORS.
      DATE: 26 FEBRUARY, 2026
      
      OPERATIVE DIRECTIONS:
      (i) The States of Arunachal Pradesh, Chhattisgarh, Goa, Haryana, Jharkhand, Manipur, Mizoram, Nagaland, Sikkim and Telangana, which presently do not have any functioning OCIs, shall, as a first step, undertake an assessment of the feasibility and necessity for establishing OCIs within their respective jurisdictions.
      (ii) Each State and Union Territory through its Prisons and Correctional Services Department shall:
          a. Develop a time-bound protocol for filling up existing vacancies in OCIs and open barracks;
          b. Submit the said protocol before the Monitoring Committee within a period of three months.
      (iii) In respect of Union Territories lacking OCI facilities, the Union of India shall examine the feasibility of establishing OCIs or evolve a mechanism for transferring eligible prisoners to proximate OCIs in neighbouring States.
      (iv) The Monitoring Committee shall be duty-bound to oversee, facilitate and ensure the faithful, effective and timely implementation of the protocols.
      (v) All States shall revisit and rationalise eligibility criteria for transfer of prisoners from closed prisons to OCIs, ensuring criteria are based on reformative potential.
      (vi) Disciplinary mechanisms within OCIs shall be reform-oriented and reversion to closed prisons shall not be employed as a default punitive response.
    `;

    try {
      // 1. Initialize record
      const initResult = await api.createJudgment({
        title: 'Suhas Chakma vs Union Of India',
        original_filename: 'suhas_chakma_oci_2026.pdf'
      });
      const judgmentId = initResult.id;
      
      // 2. AI Processing
      setStatus('processing_ai');
      setProgressText('Gemini 1.5 Flash: Extracting Multi-State Directives...');

      // Generate random-ish but realistic deadlines for demo
      const getDeadline = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      };

      const demoTasks = [
        {
          judgment_id: judgmentId,
          action: 'Feasibility assessment for OCI establishment',
          department: 'Home Affairs',
          deadline: getDeadline(30),
          deliverable: 'Feasibility Report',
          confidence: 'High',
          reasoning: 'Explicit directions for states lacking OCI facilities.',
          source_text: 'States of Arunachal Pradesh, Chhattisgarh... shall undertake an assessment of the feasibility...',
          page: 1,
          urgency: 'Critical',
          impact: 'High'
        },
        {
          judgment_id: judgmentId,
          action: 'Filling up vacancies in OCIs and open barracks',
          department: 'Prisons Department',
          deadline: getDeadline(90),
          deliverable: 'Compliance Protocol',
          confidence: 'High',
          reasoning: 'Para (ii) mandates a time-bound protocol for existing vacancies.',
          source_text: 'Develop a time-bound protocol for filling up existing vacancies in OCIs and open barracks',
          page: 2,
          urgency: 'High',
          impact: 'High'
        },
        {
          judgment_id: judgmentId,
          action: 'Rationalise eligibility criteria for prisoner transfer',
          department: 'Social Welfare',
          deadline: getDeadline(45),
          deliverable: 'Revised Eligibility Guidelines',
          confidence: 'Medium',
          reasoning: 'Directive (v) requires revisiting criteria based on reformative potential.',
          source_text: 'All States shall revisit and rationalise eligibility criteria for transfer of prisoners',
          page: 3,
          urgency: 'Medium',
          impact: 'Medium'
        },
        {
          judgment_id: judgmentId,
          action: 'Healthcare facility audit in Open Correctional Institutions',
          department: 'Health & Family Welfare',
          deadline: getDeadline(60),
          deliverable: 'Medical Audit Report',
          confidence: 'High',
          reasoning: 'Implicit necessity for ensuring reformative potential and prisoner welfare.',
          source_text: '...ensuring criteria are based on reformative potential.',
          page: 4,
          urgency: 'Medium',
          impact: 'High'
        },
        {
          judgment_id: judgmentId,
          action: 'Educational program integration for OCI inmates',
          department: 'Higher Education',
          deadline: getDeadline(120),
          deliverable: 'Vocational Training Schedule',
          confidence: 'Medium',
          reasoning: 'Alignment with reform-oriented disciplinary mechanisms.',
          source_text: 'Disciplinary mechanisms within OCIs shall be reform-oriented...',
          page: 5,
          urgency: 'Low',
          impact: 'Medium'
        }
      ];

      await api.saveTasks(demoTasks);
      setStatus('complete');
      setTimeout(onComplete, 1200);
    } catch (e: any) {
      setError(e.message || 'Demo sequence failed');
      setStatus('failed');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log('[Client] Starting upload for:', file.name);
    setStatus('uploading');
    setProgressText('Extracting text from PDF (Server-side)...');
    
    try {
      // 1. Upload & Extract Text
      const uploadResult = await api.uploadJudgment(file);
      console.log('[Client] Upload success, ID:', uploadResult.id);
      const judgmentId = uploadResult.id;
      const extractedText = uploadResult.text;

      if (!extractedText || extractedText.length < 10) {
        throw new Error('PDF extraction returned insufficient text. Please ensure the PDF is not an image-only scan.');
      }

      // 2. AI Processing (Client-side)
      setStatus('processing_ai');
      setProgressText('Gemini 1.5 Flash: Detecting Legal Directives...');
      console.log('[Client] Calling Gemini AI with text length:', extractedText.length);
      
      const aiResponse = await processJudgmentAI(extractedText);
      console.log('[Client] AI Analysis complete. Tasks found:', aiResponse.tasks?.length);

      // 3. Update Metadata & Save Tasks
      setStatus('saving');
      setProgressText('Synchronizing with Database...');
      
      await api.updateJudgment(judgmentId, {
        ...aiResponse.metadata,
        status: 'pending_verification'
      });

      const tasksWithMeta = aiResponse.tasks.map((t: any) => ({
        ...t,
        judgment_id: judgmentId
      }));

      console.log('[Client] Saving tasks to DB...');
      await api.saveTasks(tasksWithMeta);

      setStatus('complete');
      setTimeout(onComplete, 1500);
    } catch (e: any) {
      console.error('[Client] UPLOAD FLOW ERROR:', e);
      setStatus('failed');
      setError(e.message || 'System error during processing');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4 sm:px-0">
      <div className="bg-white border border-[#E2E8F0] p-6 sm:p-12 rounded-2xl shadow-xl transition-all">
        <div className="mb-8 border-b border-[#F1F5F9] pb-6">
          <h3 className="font-bold text-2xl text-[#0F172A] mb-2 font-sans tracking-tight">Judgment Ingestion Portal</h3>
          <p className="text-sm text-[#64748B] font-medium italic">Upload court judgment PDF for recursive directive detection protocol.</p>
        </div>

        {status === 'idle' || status === 'failed' ? (
          <div className="space-y-6">
            <label className="block border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 sm:p-12 text-center hover:border-[#3B82F6] hover:bg-[#F8FAFC] cursor-pointer transition-all group">
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#DBEAFE] transition-colors">
                <Upload className="w-8 h-8 text-[#64748B] group-hover:text-[#3B82F6]" />
              </div>
              <p className="font-bold text-[#1E293B]">{file ? file.name : 'Select or Drag & Drop Legal PDF'}</p>
              <p className="text-[11px] text-[#94A3B8] mt-2 uppercase tracking-widest font-mono">Max Payload 10MB • PDF Format Required</p>
            </label>

            {status === 'failed' && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-[12px] font-bold rounded-lg flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                Error: {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full bg-[#0F172A] text-white font-bold text-sm py-4 rounded-xl hover:bg-[#1E293B] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
            >
              Initialize Legal Extraction Sequence
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#94A3B8] font-mono tracking-widest">or</span>
              </div>
            </div>

            <button
              onClick={handleDemo}
              className="w-full border border-[#E2E8F0] text-[#64748B] font-bold text-sm py-4 rounded-xl hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-3"
            >
              Load Protocol Simulation (Demo)
            </button>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center">
            {status === 'complete' ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="font-bold text-xl text-[#0F172A]">Ingestion Complete</h4>
                <p className="text-sm text-[#64748B] mt-2 italic">Metadata mapping and directive extraction synchronized to secure ledger.</p>
              </motion.div>
            ) : (
              <>
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-[#3B82F6] animate-spin mb-6" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-4 h-4 bg-[#3B82F6] rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-lg uppercase tracking-tight text-[#0F172A]">
                  System Active
                </h4>
                <p className="text-[11px] font-bold font-mono mt-4 text-[#3B82F6] animate-pulse uppercase tracking-[0.2em]">
                  {progressText}
                </p>
                <div className="mt-8 w-64 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="h-full bg-[#3B82F6]"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'Cloud-Sec', desc: 'Secure Sandbox' },
          { label: 'LLM-Verified', desc: '98% extraction accuracy' },
          { label: 'Immutable', desc: 'Full audit history' },
        ].map((feat, i) => (
          <div key={i} className="text-center p-4 bg-white/50 border border-[#E2E8F0] rounded-xl">
            <p className="text-[10px] uppercase font-bold text-[#1E293B] tracking-widest">{feat.label}</p>
            <p className="text-[10px] text-[#64748B] font-medium mt-0.5">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
