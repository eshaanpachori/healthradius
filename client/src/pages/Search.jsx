import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetNearbyHospitalsQuery } from '../app/api.js';
import { FilterSidebar } from '../components/hospitals/FilterSidebar.jsx';
import { HospitalCard } from '../components/hospitals/HospitalCard.jsx';
import { SimpleMap } from '../components/map/SimpleMap.jsx';
import { CardSkeleton } from '../components/common/Skeletons.jsx';
import { AlertCircle, SlidersHorizontal, Map, List, Compass, ChevronLeft, ChevronRight } from 'lucide-react';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));
  const radius = parseInt(searchParams.get('radius') || '5000', 10);

  const minRating = parseFloat(searchParams.get('minRating') || '0');
  const openNow = searchParams.get('openNow') === 'true';
  const emergency = searchParams.get('emergency') === 'true';
  const ownershipType = searchParams.get('ownershipType') || '';
  const specialty = searchParams.get('specialty') || '';
  const wheelchairAccessible = searchParams.get('wheelchairAccessible') === 'true';
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const sort = searchParams.get('sort') || 'recommended';

  // Toggle mobile filters drawer & map vs list view
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list, map
  const [activeHospitalId, setActiveHospitalId] = useState(null);

  const activeCardRef = useRef(null);

  // Redirect to home if coordinates are missing
  useEffect(() => {
    if (isNaN(lat) || isNaN(lng)) {
      navigate('/');
    }
  }, [lat, lng, navigate]);

  const queryParams = {
    lat,
    lng,
    radius,
    minRating,
    openNow,
    emergency,
    ownershipType,
    specialty,
    wheelchairAccessible,
    page,
    limit,
    sort
  };

  const { data: searchResp, isLoading, isError, error, isFetching } = useGetNearbyHospitalsQuery(queryParams, {
    skip: isNaN(lat) || isNaN(lng)
  });

  const searchData = searchResp?.data || { hospitals: [], pagination: {} };
  const hospitals = searchData.hospitals || [];
  const pagination = searchData.pagination || {};

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === false || value === 0) {
      newParams.delete(name);
    } else {
      newParams.set(name, value);
    }
    // Reset page number on filter changes
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('lat', lat);
    newParams.set('lng', lng);
    newParams.set('radius', radius);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  };

  const handleMarkerClick = (hospital) => {
    setActiveHospitalId(hospital.id);
    setViewMode('list');
    
    // Scroll element into view (simulation helper)
    setTimeout(() => {
      const element = document.getElementById(`hospital-card-${hospital.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const filters = {
    radius,
    minRating,
    openNow,
    emergency,
    ownershipType,
    specialty,
    wheelchairAccessible
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Search Toolbar Info Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2.5 rounded-xl border border-primary-100 text-primary-600 shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-base leading-tight">
              Hospital Directory Results
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Locating around center (lat {lat.toFixed(4)}, lng {lng.toFixed(4)}) within {radius / 1000} km
            </p>
          </div>
        </div>

        {/* Sort select & mobile action triggers */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="shrink-0">Sort By</span>
            <select
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="recommended">Recommended Match</option>
              <option value="nearest">Nearest Proximity</option>
              <option value="highest-rated">Highest Ratings</option>
              <option value="most-reviewed">Most Reviewed</option>
              <option value="app-rating">Community Choice</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* Mobile view toggles */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 bg-slate-50"
              title="Filters"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 bg-slate-50 flex items-center gap-1 text-xs font-bold"
            >
              {viewMode === 'list' ? <Map className="h-4 w-4" /> : <List className="h-4 w-4" />}
              {viewMode === 'list' ? 'Map' : 'List'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Mobile sidebar modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end lg:hidden">
            <div className="w-80 bg-white h-full p-5 overflow-y-auto shadow-2xl relative flex flex-col gap-4 animate-slide-in">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-extrabold text-slate-800 text-sm uppercase">Adjust Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 font-bold text-xs">Close</button>
              </div>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        )}

        {/* Main List and Map splits */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-6 md:h-[680px]">
          
          {/* Results list column */}
          <div
            className={`md:col-span-3 space-y-4 md:overflow-y-auto md:pr-2 h-full ${
              viewMode === 'map' ? 'hidden md:block' : 'block'
            }`}
          >
            {isLoading || isFetching ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : isError ? (
              <div className="text-center py-10 bg-white border border-slate-200/80 rounded-2xl p-6">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">Discovery Request Failed</h4>
                <p className="text-slate-500 text-xs mt-1">
                  {error?.data?.message || 'We encountered issues searching nearby hospitals. Please switch your data provider or retry.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-primary-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl"
                >
                  Return to locator
                </button>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200/80 rounded-3xl p-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">No Hospitals Found</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-sm mx-auto">
                    We couldn't find hospitals matching your criteria within {radius / 1000} km. Try increasing the search radius, clearing filters, or switching coordinates.
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleFilterChange('radius', 5000)}
                    className="bg-primary-50 text-primary-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-primary-200"
                  >
                    Increase to 5 km
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {hospitals.map((h) => (
                    <div key={`${h.source}-${h.id}`} id={`hospital-card-${h.id}`}>
                      <HospitalCard hospital={h} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 pb-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <span className="text-xs text-slate-500 font-semibold">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                      className="inline-flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map display column */}
          <div
            className={`md:col-span-2 h-full min-h-[320px] md:min-h-0 ${
              viewMode === 'list' ? 'hidden md:block' : 'block'
            }`}
          >
            <SimpleMap
              hospitals={hospitals}
              center={{ lat, lng }}
              activeHospitalId={activeHospitalId}
              onMarkerClick={handleMarkerClick}
            />
          </div>

        </div>

      </div>
    </div>
  );
};
export default Search;
