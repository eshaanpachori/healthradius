import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-205 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex items-center gap-2 border-b pb-3">
          <ShieldAlert className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Terms of Use & Disclaimers</h1>
        </div>

        {/* Restrained Red Alert Banner */}
        <div className="bg-red-50 border border-red-200 text-red-800 p-4.5 rounded-2xl flex gap-3 text-xs leading-relaxed">
          <AlertCircle className="h-5 w-5 text-red-650 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block mb-0.5">Critical Safety Disclaimer</span>
            HealthRadius does not provide medical guidance, triage, or clinical quality assessments. In a medical emergency, do not search this directory. Call your local emergency responders (such as 911) immediately.
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
          <h2 className="font-bold text-sm text-slate-800">1. Informational Directory Scope</h2>
          <p>
            The hospital ratings, distance ranges, hours, and descriptions are compiled for directory lookup assistance. Ratings and match recommendation scores are composite data index evaluations and do not reflect clinical outcomes.
          </p>

          <h2 className="font-bold text-sm text-slate-800">2. No Patient-Doctor Relationship</h2>
          <p>
            Use of HealthRadius does not establish a clinical relationship. The directory should not be used to self-diagnose, prescribe medicines, or select surgical procedures.
          </p>

          <h2 className="font-bold text-sm text-slate-800">3. User Submissions Integrity</h2>
          <p>
            Users posting reviews and details flags represent their personal feedback. HealthRadius moderators reserve rights to remove flagged spam, commercial advertisements, or inappropriate submissions.
          </p>
        </div>

      </div>
    </div>
  );
};
export default Terms;
