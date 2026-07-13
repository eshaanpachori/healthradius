import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4 text-center space-y-6">
      <div className="bg-slate-100 p-4 rounded-full text-slate-400">
        <AlertCircle className="h-10 w-10 text-slate-500" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">404 - Page Not Found</h1>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
          The requested page address is invalid or might have been removed. Let's redirect you back to finding nearby hospitals.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-primary-500/10"
      >
        <Compass className="h-4 w-4" /> Go to Locator
      </Link>
    </div>
  );
};
export default NotFound;
