import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating, count, max = 5, interactive = false, onChange, size = 4 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  const starsArray = Array.from({ length: max }, (_, i) => i + 1);

  if (interactive) {
    return (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate from 1 to 5 stars">
        {starsArray.map((val) => {
          const active = val <= rating;
          return (
            <button
              key={val}
              type="button"
              role="radio"
              aria-checked={rating === val}
              aria-label={`Rate ${val} star${val > 1 ? 's' : ''}`}
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => onChange && onChange(val)}
            >
              <Star
                className={`h-${size} w-${size} ${
                  active ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating: ${rating} out of ${max} stars`}>
      <div className="flex items-center gap-0.5">
        {starsArray.map((val) => {
          const isFull = val <= fullStars;
          const isHalf = !isFull && val === fullStars + 1 && hasHalf;
          return (
            <Star
              key={val}
              className={`h-${size} w-${size} ${
                isFull
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400 opacity-70'
                  : 'text-slate-200'
              }`}
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 font-medium">({count})</span>
      )}
    </div>
  );
};
export default RatingStars;
