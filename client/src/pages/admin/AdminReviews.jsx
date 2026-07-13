import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminReviewsQuery, useModerateReviewMutation } from '../../app/api.js';
import { ChevronLeft, MessageSquare, CheckCircle2, XCircle, Star } from 'lucide-react';

export const AdminReviews = () => {
  const { data: reviewsResp, isLoading, refetch } = useGetAdminReviewsQuery();
  const [moderateReview, { isLoading: moderating }] = useModerateReviewMutation();
  const reviews = reviewsResp?.data?.reviews || [];

  const [selectedReview, setSelectedReview] = useState(null);
  const [newStatus, setNewStatus] = useState('published');
  const [moderationReason, setModerationReason] = useState('');

  const handleModerate = async (reviewId) => {
    try {
      await moderateReview({ reviewId, status: newStatus, moderationReason }).unwrap();
      setSelectedReview(null);
      setModerationReason('');
      refetch();
    } catch (err) {}
  };

  const statusColors = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <MessageSquare className="h-5 w-5 text-primary-500" />
        <h1 className="font-extrabold text-slate-800 text-base">Review Moderation Queue ({reviews.length})</h1>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-white border rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No reviews found in the system.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[review.status]}`}>
                      {review.status.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800">"{review.title}"</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{review.comment}</p>
                  <p className="text-[10px] text-slate-400">
                    By: {review.user?.name || 'Unknown'} ({review.user?.email}) • Hospital: {review.hospitalId} ({review.source}) • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {review.moderationReason && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded italic">
                      Moderation Note: {review.moderationReason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedReview(review); setNewStatus(review.status); setModerationReason(review.moderationReason || ''); }}
                  className="text-xs font-bold bg-slate-800 text-white px-3.5 py-2 rounded-xl hover:bg-slate-700 shrink-0"
                >
                  Moderate
                </button>
              </div>

              {selectedReview?._id === review._id && (
                <div className="border-t pt-4 space-y-3 bg-slate-50 p-4 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Set Review Status</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="text-sm rounded-xl border border-slate-200 bg-white p-2 font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="published">Published (Visible)</option>
                      <option value="pending">Pending (Hidden)</option>
                      <option value="rejected">Rejected (Removed)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Moderation Note (Optional)</label>
                    <textarea
                      rows={2}
                      value={moderationReason}
                      onChange={e => setModerationReason(e.target.value)}
                      placeholder="Reason for moderation action..."
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerate(review._id)}
                      disabled={moderating}
                      className="text-xs font-bold bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 disabled:opacity-50"
                    >
                      {moderating ? 'Saving...' : 'Apply Moderation'}
                    </button>
                    <button
                      onClick={() => setSelectedReview(null)}
                      className="text-xs font-semibold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminReviews;
