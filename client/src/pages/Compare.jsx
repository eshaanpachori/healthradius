import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectComparisonList, removeFromComparison, clearComparison } from '../features/comparison/comparisonSlice.js';
import { Layers, Trash2, Heart, Star, CheckCircle2, ChevronLeft, MapPin } from 'lucide-react';
import RatingStars from '../components/common/RatingStars.jsx';

export const Compare = () => {
  const comparisonList = useSelector(selectComparisonList);
  const dispatch = useDispatch();

  const handleRemove = (hospital) => {
    dispatch(removeFromComparison({ id: hospital.id, source: hospital.source }));
  };

  const handleClear = () => {
    dispatch(clearComparison());
  };

  if (comparisonList.length === 0) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-slate-100 text-slate-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <Layers className="h-8 w-8 text-slate-500" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg">Comparison Deck Empty</h2>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-md mx-auto">
            You haven't added any hospitals to compare yet. Browse nearby hospitals and click the "Compare" check-box on their card.
          </p>
        </div>
        <Link to="/" className="inline-block bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-primary-500/10">
          Search Hospitals
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Title block */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-secondary-500" />
          <h1 className="font-extrabold text-slate-800 text-base leading-tight">
            Compare Hospitals ({comparisonList.length} of 3)
          </h1>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors border border-rose-100/50 hover:bg-rose-50/50 px-3 py-1.5 rounded-xl"
        >
          Clear Selection
        </button>
      </div>

      {/* Comparison Grid View (Responsive Table Layout) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 font-bold text-slate-400 uppercase tracking-wider w-48 shrink-0">Hospital Parameters</th>
                {comparisonList.map((h) => (
                  <th key={`${h.source}-${h.id}`} className="p-4 font-bold text-slate-800 min-w-[200px] border-l border-slate-100">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="font-extrabold text-sm block leading-tight text-slate-800">{h.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[150px]">{h.address}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(h)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 font-medium text-slate-650">
              
              {/* Proximity / Distance */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Selected Distance</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100 font-bold text-slate-800">
                    {h.distanceKm ? `${h.distanceKm} km` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Match Score */}
              <tr className="bg-primary-50/20">
                <td className="p-4 font-semibold text-slate-500">Recommendation Score</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      {h.recommendationScore}% Match
                    </div>
                  </td>
                ))}
              </tr>

              {/* External Rating */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">External Rating</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {h.externalRating} <span className="text-[10px] text-slate-400 font-normal">({h.externalReviewCount} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Community Rating */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">HealthRadius Rating</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-primary-500 fill-primary-500" />
                      {h.appRating || 'N/A'} <span className="text-[10px] text-slate-400 font-normal">({h.appReviewCount} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Open Now */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Status Now</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100 font-bold">
                    {h.openNow !== null ? (
                      <span className={h.openNow ? 'text-emerald-600' : 'text-rose-600'}>
                        {h.openNow ? 'Open Now' : 'Closed'}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                ))}
              </tr>

              {/* Ownership Type */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Ownership Type</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100 capitalize">
                    {h.ownershipType || 'Unknown'}
                  </td>
                ))}
              </tr>

              {/* Emergency Availability */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Emergency ER Availability</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100 font-bold">
                    <span className={h.emergencyAvailable ? 'text-red-650' : 'text-slate-450'}>
                      {h.emergencyAvailable ? 'Available 24/7' : 'Not Available / Unknown'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Wheelchair Accessibility */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Wheelchair Accessible</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100 font-semibold">
                    {h.wheelchairAccessible ? '♿ Yes' : 'No'}
                  </td>
                ))}
              </tr>

              {/* Specialties */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Specialties</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {h.categories?.slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="bg-slate-50 border px-1.5 py-0.5 rounded text-[10px]">
                          {spec}
                        </span>
                      )) || 'N/A'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Facilities */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Facilities</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {h.facilities?.slice(0, 3).map((fac, idx) => (
                        <span key={idx} className="bg-slate-50 border px-1.5 py-0.5 rounded text-[10px]">
                          {fac}
                        </span>
                      )) || 'N/A'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Accepted Insurance */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Accepted Insurance</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {h.insuranceAccepted?.map((ins, idx) => (
                        <span key={idx} className="bg-primary-50 text-primary-850 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {ins}
                        </span>
                      )) || 'N/A'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Trust Status */}
              <tr>
                <td className="p-4 font-semibold text-slate-500">Verification Integrity</td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      h.verified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                        : 'bg-slate-55 bg-slate-50 border-slate-205 text-slate-500'
                    }`}>
                      {h.verified ? 'Verified Platform Details' : 'Community Sourced'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Navigation button */}
              <tr>
                <td className="p-4"></td>
                {comparisonList.map((h) => (
                  <td key={h.id} className="p-4 border-l border-slate-100">
                    <Link
                      to={`/hospitals/${h.source}/${h.id}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-3 py-1.5 rounded-xl block text-center"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default Compare;
