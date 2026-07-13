import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Star, Phone, MapPin, Navigation, HelpCircle, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import { selectIsAuthenticated, setPendingFavorite } from '../../features/auth/authSlice.js';
import { addToComparison, removeFromComparison, selectComparisonList } from '../../features/comparison/comparisonSlice.js';
import { useAddFavoriteMutation, useRemoveFavoriteMutation, useGetFavoritesQuery } from '../../app/api.js';

export const HospitalCard = ({ hospital }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const comparison = useSelector(selectComparisonList);

  const { data: favsResp } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated });
  const favorites = favsResp?.data?.favorites || [];

  const [addFav] = useAddFavoriteMutation();
  const [removeFav] = useRemoveFavoriteMutation();

  const isFavorited = favorites.some(f => f.id === hospital.id && f.source === hospital.source);
  const isInComparison = comparison.some(c => c.id === hospital.id && c.source === hospital.source);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Store action in pending actions slice and redirect
      dispatch(setPendingFavorite({ source: hospital.source, hospitalId: hospital.id }));
      navigate('/login', { state: { from: '/search' } });
      return;
    }

    try {
      if (isFavorited) {
        await removeFav({ source: hospital.source, hospitalId: hospital.id }).unwrap();
      } else {
        await addFav({ source: hospital.source, hospitalId: hospital.id }).unwrap();
      }
    } catch (err) {}
  };

  const handleComparisonChange = (e) => {
    e.stopPropagation();
    if (isInComparison) {
      dispatch(removeFromComparison({ id: hospital.id, source: hospital.source }));
    } else {
      if (comparison.length >= 3) {
        alert('You can compare a maximum of 3 hospitals.');
        return;
      }
      dispatch(addToComparison(hospital));
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all flex flex-col justify-between gap-4">
      {/* Top Banner Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-slate-800 tracking-tight leading-tight">
              {hospital.name}
            </h3>
            {hospital.verified ? (
              <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            ) : hospital.isDemo ? (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                Demo Data
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                Not Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[280px]">{hospital.address}</span>
          </p>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full border transition-all ${
            isFavorited
              ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-100'
          }`}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4.5 w-4.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Specialty & Location details */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {hospital.distanceKm !== undefined && (
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
              {hospital.distanceKm} km away
            </span>
          )}
          {hospital.openNow !== null && (
            <span
              className={`font-semibold px-2 py-1 rounded-lg ${
                hospital.openNow
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                  : 'text-rose-700 bg-rose-50 border border-rose-100'
              }`}
            >
              {hospital.openNow ? 'Open Now' : 'Closed'}
            </span>
          )}
          {hospital.emergencyAvailable ? (
            <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg font-semibold flex items-center gap-0.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Emergency ER
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
              No Emergency ER
            </span>
          )}
        </div>

        {/* Dual Ratings Display */}
        <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-slate-100/80 my-2">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">External Provider</span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-slate-800">{hospital.externalRating}</span>
              <span className="text-[10px] text-slate-400 font-medium">({hospital.externalReviewCount})</span>
            </div>
          </div>
          <div className="text-left border-l border-slate-100 pl-3.5 space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">HealthRadius Community</span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-primary-500 fill-primary-500" />
              <span className="text-xs font-bold text-slate-800">{hospital.appRating || 'N/A'}</span>
              <span className="text-[10px] text-slate-400 font-medium">({hospital.appReviewCount})</span>
            </div>
          </div>
        </div>

        {/* Recommendation Score Panel */}
        <div className="bg-primary-50/40 border border-primary-100/50 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="bg-primary-100 text-primary-800 font-extrabold px-2 py-1 rounded-lg text-xs">
              {hospital.recommendationScore}%
            </div>
            <div>
              <span className="font-bold text-slate-700 block leading-tight">Match Score</span>
              <span className="text-[10px] text-slate-400 max-w-[150px] truncate block">
                {hospital.recommendationReasons?.join(' • ')}
              </span>
            </div>
          </div>
          <div className="relative group cursor-help text-slate-400 hover:text-slate-600">
            <HelpCircle className="h-4 w-4" />
            <div className="absolute right-0 bottom-6 hidden group-hover:block w-52 p-2.5 bg-slate-900 text-white rounded-lg text-[10px] leading-relaxed shadow-xl z-20">
              Score is a composite index computed transparently using: 70% Bayesian-averaged reviews rating, 15% reviews count confidence, and 15% distance proximity. Not a measure of medical outcomes.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between gap-2.5 border-t border-slate-100 pt-3">
        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-500 select-none">
          <input
            type="checkbox"
            checked={isInComparison}
            onChange={handleComparisonChange}
            className="rounded border-slate-300 text-secondary-600 focus:ring-secondary-500 h-4 w-4"
          />
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          Compare
        </label>

        <div className="flex items-center gap-2 shrink-0">
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              title={`Call ${hospital.name}`}
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
          {hospital.location && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.latitude},${hospital.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              title="Get Directions"
            >
              <Navigation className="h-3.5 w-3.5" />
            </a>
          )}
          <Link
            to={`/hospitals/${hospital.source}/${hospital.id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary-500/5"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
export default HospitalCard;
