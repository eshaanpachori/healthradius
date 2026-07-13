import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export const Disclaimer = ({ inline = false }) => {
  const text = "This platform provides hospital directory information and does not provide medical advice. Ratings and distance do not represent clinical quality. In an emergency, contact your local emergency service immediately.";

  if (inline) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed" role="alert">
        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
        <p>{text}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-800 text-sm shadow-sm leading-relaxed" role="alert">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-semibold block mb-0.5">Medical Disclaimer</span>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
};
export default Disclaimer;
