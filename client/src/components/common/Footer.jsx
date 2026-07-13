import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicConfigQuery } from '../../app/api.js';
import { AlertCircle } from 'lucide-react';

export const Footer = () => {
  const { data: configResp } = useGetPublicConfigQuery();
  const config = configResp?.data;

  const emergencyMessage = config?.emergencyMessage || "In an emergency, contact your local emergency service immediately.";
  const emergencyPhone = config?.emergencyPhone || "911";

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      {/* Emergency Restrained Red Alert Banner inside footer */}
      <div className="bg-red-950/60 border-b border-red-900/50 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 text-xs text-red-200">
          <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
          <p>
            <span className="font-semibold text-red-300">EMERGENCY NOTICE:</span> {emergencyMessage}{' '}
            {emergencyPhone && (
              <a href={`tel:${emergencyPhone}`} className="font-bold underline text-red-300 ml-1 hover:text-red-100">
                Call {emergencyPhone}
              </a>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-3">
            <span className="font-extrabold text-lg text-white tracking-tight">
              Health<span className="text-primary-400">Radius</span>
            </span>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              HealthRadius is a transparent hospital discovery directory and information trust platform. Finding quality care based on proximity and public feedback.
            </p>
          </div>
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Recommendation Methodology</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">Compare Hospitals</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Legal & Privacy</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Use & Disclaimers</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
          <p>© {new Date().getFullYear()} HealthRadius. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Healthcare directory data is for educational and directory lookup purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
