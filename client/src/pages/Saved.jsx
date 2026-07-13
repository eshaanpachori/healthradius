import React from 'react';
import { useGetFavoritesQuery } from '../app/api.js';
import { HospitalCard } from '../components/hospitals/HospitalCard.jsx';
import { CardSkeleton } from '../components/common/Skeletons.jsx';
import { Heart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Saved = () => {
  const { data: favsResp, isLoading, isError } = useGetFavoritesQuery();
  const favorites = favsResp?.data?.favorites || [];

  if (isLoading) {
    return (
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        <h1 className="text-xl font-extrabold text-slate-800">Your Saved Hospitals</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="font-extrabold text-slate-800 text-lg">Failed to Retrieve Favorites</h2>
        <p className="text-slate-500 text-xs">There was an issue fetching your saved hospitals list. Please refresh or try logging in again.</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-slate-100 text-slate-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg">No Saved Hospitals</h2>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-md mx-auto">
            Your saved hospitals deck is empty. When searching, click the heart icon on any hospital card to save it for quick lookup.
          </p>
        </div>
        <Link to="/" className="inline-block bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-primary-500/10">
          Find Hospitals Near Me
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-2 shadow-sm">
        <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
        <h1 className="font-extrabold text-slate-850 text-base leading-tight">
          Your Saved Hospitals ({favorites.length})
        </h1>
      </div>

      {/* Favorites list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((h) => (
          <HospitalCard key={`${h.source}-${h.id}`} hospital={h} />
        ))}
      </div>

    </div>
  );
};
export default Saved;
