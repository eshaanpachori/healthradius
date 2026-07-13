import React, { useState } from 'react';
import { RatingStars } from '../common/RatingStars.jsx';
import { AlertCircle, Trash2, Edit3, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ReviewList = ({
  reviewsData,
  currentUser,
  onEdit,
  onDelete,
  onReport,
  isActionLoading
}) => {
  const { reviews = [], stats = { averageRating: 0, totalCount: 0, distribution: {} } } = reviewsData || {};
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  const handleReportSubmit = (reviewId) => {
    if (!reportReason.trim()) return;
    onReport(reviewId, reportReason.trim());
    setReportCommentId(null);
    setReportReason('');
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-slate-200/60 rounded-2xl">
        <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-500 text-sm font-semibold">No reviews submitted yet.</p>
        <p className="text-slate-400 text-xs mt-1">Be the first to share your experience with this hospital!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregated Reviews Distribution Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 items-center">
        {/* Left: Overall community score */}
        <div className="text-center space-y-1">
          <span className="text-sm font-semibold text-slate-500 block">Community Rating</span>
          <div className="text-4xl font-extrabold text-slate-800">{stats.averageRating}</div>
          <div className="flex justify-center">
            <RatingStars rating={stats.averageRating} size={4.5} />
          </div>
          <span className="text-xs text-slate-400 block">{stats.totalCount} ratings total</span>
        </div>

        {/* Right: Distribution bar chart */}
        <div className="md:col-span-2 space-y-1.5">
          {Object.keys(stats.distribution)
            .reverse()
            .map((stars) => {
              const count = stats.distribution[stars] || 0;
              const pct = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3.5 text-xs text-slate-600 font-medium">
                  <span className="w-10 text-right shrink-0">{stars} star</span>
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-8 shrink-0 text-slate-400">{count}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((r) => {
          const isOwner = currentUser && r.user?._id === currentUser.id;
          const isReporting = reportCommentId === r._id;

          return (
            <div key={r._id} className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-3">
              {/* Review Card Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-200">
                    {r.user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block leading-tight">{r.user?.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                      {r.visitMonth && ` • Visited ${r.visitMonth}`}
                    </span>
                  </div>
                </div>

                {/* Rating display */}
                <RatingStars rating={r.rating} size={3.5} />
              </div>

              {/* Title & Comment */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-850 text-sm leading-snug">{r.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{r.comment}</p>
              </div>

              {/* Action bars */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-0.5 text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                  HealthRadius Resident
                </span>

                <div className="flex items-center gap-3">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => onEdit(r)}
                        className="flex items-center gap-1 hover:text-primary-600 transition-colors font-semibold"
                        disabled={isActionLoading}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your review?')) {
                            onDelete(r._id);
                          }
                        }}
                        className="flex items-center gap-1 hover:text-rose-600 transition-colors font-semibold"
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </>
                  ) : (
                    currentUser && (
                      <button
                        onClick={() => setReportCommentId(isReporting ? null : r._id)}
                        className="flex items-center gap-1 hover:text-amber-600 transition-colors font-semibold"
                        disabled={isActionLoading}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Report
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Report Input Panel */}
              {isReporting && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 mt-2">
                  <label htmlFor={`report-reason-${r._id}`} className="text-xs font-bold text-amber-800 block">Report Inappropriate Content</label>
                  <textarea
                    id={`report-reason-${r._id}`}
                    rows={2}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe why this review violates platform rules (e.g. harassment, commercial advertising, fake review)..."
                    className="w-full text-xs rounded-lg border border-amber-300 p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReportCommentId(null)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReportSubmit(r._id)}
                      className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700"
                    >
                      Submit Flag
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ReviewList;
