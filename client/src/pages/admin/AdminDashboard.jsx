import React from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminStatsQuery } from '../../app/api.js';
import { Shield, Users, MessageSquare, AlertOctagon, CheckSquare, Heart, RefreshCw, BarChart2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { data: statsResp, isLoading, isError, refetch } = useGetAdminStatsQuery();
  const stats = statsResp?.data;

  if (isLoading) {
    return (
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48"></div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalUsers: 0,
    publishedReviews: 0,
    pendingReviews: 0,
    openReports: 0,
    verifiedProfiles: 0,
    totalFavorites: 0
  };

  const topFavorites = stats?.topFavorites || [];
  const reportsByCategory = stats?.reportsByCategory || [];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-white shrink-0">
            <Shield className="h-5 w-5 text-emerald-450" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-tight">Admin System Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage directory configurations, moderations, and reports</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-655 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Users */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.totalUsers}</span>
        </div>

        {/* Reviews */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <MessageSquare className="h-5 w-5 text-primary-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published Reviews</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.publishedReviews}</span>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <MessageSquare className="h-5 w-5 text-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Reviews</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.pendingReviews}</span>
        </div>

        {/* Open Reports */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <AlertOctagon className="h-5 w-5 text-rose-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Reports</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.openReports}</span>
        </div>

        {/* Verified Profiles */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <CheckSquare className="h-5 w-5 text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Profiles</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.verifiedProfiles}</span>
        </div>

        {/* Total Favorites */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm space-y-1">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saves count</span>
          <span className="text-2xl font-extrabold text-slate-800 block">{metrics.totalFavorites}</span>
        </div>
      </div>

      {/* Navigation Shortcut bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/reports"
          className="bg-white border border-slate-200 hover:border-slate-350 p-4.5 rounded-2xl shadow-sm flex items-center justify-between font-bold text-xs text-slate-700 transition-colors"
        >
          <span>🚨 Resolve User Details Reports</span>
          <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg">{metrics.openReports} Actionable</span>
        </Link>
        <Link
          to="/admin/reviews"
          className="bg-white border border-slate-200 hover:border-slate-350 p-4.5 rounded-2xl shadow-sm flex items-center justify-between font-bold text-xs text-slate-700 transition-colors"
        >
          <span>💬 Moderate Patient Reviews</span>
          <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">{metrics.pendingReviews} Pending</span>
        </Link>
        <Link
          to="/admin/profiles"
          className="bg-white border border-slate-200 hover:border-slate-350 p-4.5 rounded-2xl shadow-sm flex items-center justify-between font-bold text-xs text-slate-700 transition-colors"
        >
          <span>🏥 Manage Verification Overrides</span>
          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">{metrics.verifiedProfiles} Verified</span>
        </Link>
      </div>

      {/* Aggregated distribution visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Most Saved Hospitals */}
        <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Heart className="h-4.5 w-4.5 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-sm">Most Saved Nearby Hospitals</h3>
          </div>
          {topFavorites.length === 0 ? (
            <p className="text-xs text-slate-450 italic">No favorites registered yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {topFavorites.map((fav, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                  <span className="font-bold text-slate-750">ID: {fav._id.hospitalId} ({fav._id.source})</span>
                  <span className="font-extrabold text-slate-500">{fav.count} saves</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Category Graph */}
        <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <BarChart2 className="h-4.5 w-4.5 text-primary-500" />
            <h3 className="font-bold text-slate-800 text-sm">Reports Distribution by Category</h3>
          </div>
          {reportsByCategory.length === 0 ? (
            <p className="text-xs text-slate-450 italic">No reports submitted yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {reportsByCategory.map((rep, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-650">
                    <span className="capitalize">{rep._id.replace('_', ' ')}</span>
                    <span>{rep.count}</span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (rep.count / Math.max(1, metrics.openReports)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
