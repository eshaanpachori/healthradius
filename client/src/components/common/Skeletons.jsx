import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-2.5 flex-1">
        <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
        <div className="h-3.5 bg-slate-200 rounded-md w-1/2"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded-full w-16"></div>
    </div>
    <div className="h-3 bg-slate-200 rounded-md w-5/6"></div>
    <div className="flex gap-2.5 pt-2">
      <div className="h-4 bg-slate-200 rounded w-16"></div>
      <div className="h-4 bg-slate-200 rounded w-20"></div>
    </div>
    <div className="flex gap-2 pt-2 border-t border-slate-100">
      <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
      <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
    </div>
  </div>
);

export const DetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
      <div className="space-y-4 flex-1">
        <div className="h-8 bg-slate-200 rounded-md w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-28"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-slate-200 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

export const ReviewsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="border border-slate-200/60 rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);
