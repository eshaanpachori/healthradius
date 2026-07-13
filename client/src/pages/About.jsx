import React from 'react';
import { ShieldCheck, Info, Compass, Layers } from 'lucide-react';

export const About = () => {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recommendation Methodology</h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          How HealthRadius transparently scores and recommends hospitals
        </p>
      </div>

      {/* Intro info box */}
      <div className="bg-primary-50 border border-primary-200/50 p-4.5 rounded-2xl flex gap-3 text-xs text-primary-800 leading-relaxed">
        <Info className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Disclaimer on Clinical Quality</span>
          HealthRadius is an informational directory designed for discovery. The recommendation score does not measure, represent, or imply clinical care quality or medical outcomes. In emergencies, call your local responders immediately.
        </div>
      </div>

      {/* Formula Explanation card */}
      <div className="bg-white border border-slate-205 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="font-bold text-lg text-slate-800 border-b pb-2">The Scoring Formula</h2>
        
        <p className="text-xs text-slate-650 leading-relaxed">
          HealthRadius avoids ranking clinics solely on raw star averages. A hospital with a single 5-star review should not automatically outrank an established hospital with a 4.7-star rating across hundreds of reviews. To resolve this, we implement a transparent Bayesian Average formula to compute the weighted rating.
        </p>

        {/* LaTeX Math Block */}
        <div className="bg-slate-50 border p-4.5 rounded-2xl text-center select-all my-4">
          <div className="text-sm font-bold text-slate-800 mb-1">Bayesian Average Formula</div>
          <div className="font-mono text-xs sm:text-sm text-slate-700">
            weightedRating = (v / (v + m)) * R + (m / (v + m)) * C
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Variable Definitions</h3>
          <ul className="space-y-3.5 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded font-mono shrink-0">R</span>
              <span><strong>Hospital Rating:</strong> The raw rating score (1.0 to 5.0 stars) supplied by Google Places or our local database.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded font-mono shrink-0">v</span>
              <span><strong>Review Count:</strong> The total number of reviews submitted by patients for this specific hospital.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded font-mono shrink-0">m</span>
              <span><strong>Confidence Threshold:</strong> The minimum number of reviews required to trust a rating fully (set to <strong>20</strong>). If a hospital has fewer reviews, its score leans toward the average of all results.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded font-mono shrink-0">C</span>
              <span><strong>Mean Rating:</strong> The average rating score calculated across all hospitals returned in the active search query.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Component weights explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-2xl font-extrabold text-primary-600 block">70%</span>
          <span className="font-bold text-slate-800 text-xs block">Weighted Rating</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The major score component, derived from the Bayesian average to ensure review counts and star values are correctly balanced.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-2xl font-extrabold text-secondary-500 block">15%</span>
          <span className="font-bold text-slate-800 text-xs block">Review Volume Confidence</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Scores the relative size of feedback. Provides a slight boost to hospitals with high review counts.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-2xl font-extrabold text-emerald-500 block">15%</span>
          <span className="font-bold text-slate-800 text-xs block">Distance Proximity</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ensures that a highly rated hospital that is closer to you ranks slightly higher than a similar hospital further away.
          </p>
        </div>
      </div>

    </div>
  );
};
export default About;
