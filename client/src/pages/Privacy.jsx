import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-205 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex items-center gap-2 border-b pb-3">
          <ShieldCheck className="h-6 w-6 text-primary-500" />
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Privacy Policy</h1>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Last Updated: July 2026. HealthRadius is built with privacy-first standards, ensuring your geographic coordinates are protected.
        </p>

        <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
          <h2 className="font-bold text-sm text-slate-800">1. User Location Processing</h2>
          <p>
            Your exact latitude and longitude coordinates are processed purely in real-time in the browser to calculate distance ranges of up to 5 kilometres. These values are saved transiently in browser session storage for caching purposes, and are never saved on HealthRadius databases.
          </p>

          <h2 className="font-bold text-sm text-slate-800">2. Account Data Storage</h2>
          <p>
            When registering, we store your name, email, and encrypted password hashes. Users who submit reviews or flag hospital details will have their user ID associated with that content to prevent abuse and coordinate moderation.
          </p>

          <h2 className="font-bold text-sm text-slate-800">3. Third-party Providers</h2>
          <p>
            When utilizing Google Places mode, search coordinate criteria may be processed by Google API gateways. Please consult Google’s privacy terms regarding Place Search handling.
          </p>

          <h2 className="font-bold text-sm text-slate-800">4. Legal Disclaimer</h2>
          <p>
            This application is an educational college project directory. It does not store medical charts, health records, or diagnoses, and is not HIPAA-regulated.
          </p>
        </div>

      </div>
    </div>
  );
};
export default Privacy;
