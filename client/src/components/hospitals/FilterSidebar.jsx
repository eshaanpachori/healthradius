import React from 'react';

const ownershipTypes = [
  { value: '', label: 'All Types' },
  { value: 'government', label: 'Government / Public' },
  { value: 'private', label: 'Private' },
  { value: 'charitable', label: 'Charitable / Non-profit' },
  { value: 'teaching', label: 'Teaching Hospital' }
];

const ratingsList = [
  { value: 0, label: 'All Ratings' },
  { value: 3.5, label: '3.5+ Stars' },
  { value: 4.0, label: '4.0+ Stars' },
  { value: 4.5, label: '4.5+ Stars' }
];

const specialtiesList = [
  { value: '', label: 'All Specialties' },
  { value: 'Emergency Medicine', label: 'Emergency Medicine' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Oncology', label: 'Oncology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Primary Care', label: 'Primary Care' }
];

export const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (name, value) => {
    onFilterChange(name, value);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Radius Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Search Radius</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1000, 2000, 3000, 5000].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleChange('radius', r)}
              className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                filters.radius === r
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-500/10'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r / 1000} km
            </button>
          ))}
        </div>
      </div>

      {/* Specialty Selector */}
      <div className="space-y-1.5">
        <label htmlFor="specialty-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Specialty</label>
        <select
          id="specialty-select"
          value={filters.specialty || ''}
          onChange={(e) => handleChange('specialty', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          {specialtiesList.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ownership Type Selector */}
      <div className="space-y-1.5">
        <label htmlFor="ownership-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Hospital Type</label>
        <select
          id="ownership-select"
          value={filters.ownershipType || ''}
          onChange={(e) => handleChange('ownershipType', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          {ownershipTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating Selector */}
      <div className="space-y-1.5">
        <label htmlFor="rating-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Minimum Rating</label>
        <select
          id="rating-select"
          value={filters.minRating || 0}
          onChange={(e) => handleChange('minRating', parseFloat(e.target.value))}
          className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          {ratingsList.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Boolean Checkbox Toggles */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.openNow || false}
            onChange={(e) => handleChange('openNow', e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
          />
          Open Now
        </label>
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.emergency || false}
            onChange={(e) => handleChange('emergency', e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
          />
          24/7 Emergency ER
        </label>
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.wheelchairAccessible || false}
            onChange={(e) => handleChange('wheelchairAccessible', e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
          />
          Wheelchair Accessible
        </label>
      </div>
    </div>
  );
};
export default FilterSidebar;
