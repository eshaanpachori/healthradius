import React, { useState } from 'react';
import { RatingStars } from '../common/RatingStars.jsx';
import { AlertCircle } from 'lucide-react';

export const ReviewForm = ({ initialData, onSubmit, isSubmitting, error }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [visitMonth, setVisitMonth] = useState(initialData?.visitMonth || '');

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (rating < 1 || rating > 5) {
      setValidationError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!title.trim()) {
      setValidationError('A review title is required.');
      return;
    }
    if (!comment.trim()) {
      setValidationError('Please write a detailed review comment.');
      return;
    }

    onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      visitMonth: visitMonth || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Validation or API error display */}
      {(validationError || error) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <p>{validationError || error?.data?.message || 'Failed to submit review. Please try again.'}</p>
        </div>
      )}

      {/* Star Selector */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Rating</label>
        <RatingStars rating={rating} interactive size={6} onChange={setRating} />
      </div>

      {/* Review Title */}
      <div className="space-y-1.5">
        <label htmlFor="review-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Review Title</label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Summarize your experience (e.g. Excellent patient care)"
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>

      {/* Visit Month */}
      <div className="space-y-1.5">
        <label htmlFor="visit-month" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Month of Visit <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          id="visit-month"
          type="month"
          value={visitMonth}
          onChange={(e) => setVisitMonth(e.target.value)}
          max={new Date().toISOString().slice(0, 7)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-850 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Review Comment */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="review-comment" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Detailed Review</label>
          <span className="text-[10px] text-slate-400">{1000 - comment.length} characters left</span>
        </div>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          placeholder="Share details about the facilities, wait times, specialties, and support staff..."
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          required
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-primary-500/10 text-sm"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};
export default ReviewForm;
