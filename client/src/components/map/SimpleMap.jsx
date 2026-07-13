import React from 'react';
import { MapPin, Compass, Navigation, Info } from 'lucide-react';

export const SimpleMap = ({ hospitals, center, activeHospitalId, onMarkerClick }) => {
  // Translate latitude & longitude into pixel coordinates relative to search center
  // Earth radius: 111,000 meters per degree lat
  const getRelativePosition = (lat, lng) => {
    if (!center) return { x: 50, y: 50 };

    const latDiff = lat - center.lat;
    // Compensation for longitude compression based on latitude
    const lngDiff = (lng - center.lng) * Math.cos((center.lat * Math.PI) / 180);

    // Map 0.05 degrees difference to grid coordinates (0 to 100)
    // 0.025 degrees is approx 2.7km. Max radius is 5km (0.045 degrees lat)
    const scale = 1100; // grid scaling factor
    
    // Invert Y because latitude goes up (north) but SVG Y goes down
    const x = 50 + lngDiff * scale;
    const y = 50 - latDiff * scale;

    // Clamp coordinates to bounds of the container
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y))
    };
  };

  return (
    <div className="relative w-full h-[320px] md:h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-between">
      {/* Map header overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-bold flex items-center gap-1.5 shadow-md">
        <Compass className="h-3.5 w-3.5 text-primary-400 animate-spin" style={{ animationDuration: '6s' }} />
        HealthRadius Local Radar
      </div>

      {/* Radial Grid Canvas */}
      <div className="flex-1 w-full relative select-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Radial radar circles representing distance limits */}
          <circle cx="50" cy="50" r="15" fill="none" stroke="#334155" strokeWidth="0.25" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#334155" strokeWidth="0.25" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="0.25" strokeDasharray="1,1" />

          {/* Crosshair grid lines */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.15" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.15" />
        </svg>

        {/* Center/User Location Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300"
          style={{ left: '50%', top: '50%' }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-primary-400 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-primary-500 border-2 border-white shadow-md"></span>
          </div>
        </div>

        {/* Hospital Location Pins */}
        {hospitals.map((h) => {
          if (!h.location) return null;
          const { x, y } = getRelativePosition(h.location.latitude, h.location.longitude);
          const isActive = h.id === activeHospitalId;

          return (
            <button
              key={`${h.source}-${h.id}`}
              onClick={() => onMarkerClick && onMarkerClick(h)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all group z-20 hover:z-30"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={h.name}
            >
              <div className="relative flex flex-col items-center">
                {/* Micro tooltip on marker hover */}
                <div className="absolute bottom-6 hidden group-hover:block bg-slate-950 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap border border-slate-800">
                  {h.name} ({h.distanceKm} km)
                </div>

                <MapPin
                  className={`transition-all ${
                    isActive
                      ? 'h-7 w-7 text-rose-500 scale-125 filter drop-shadow-md'
                      : 'h-5 w-5 text-primary-400 group-hover:text-primary-300 group-hover:scale-110'
                  }`}
                />
                
                {/* Active marker glow ring */}
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-20 -top-1"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Footer Info */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4 py-2.5 flex items-center gap-2 text-[10px] text-slate-500 leading-tight">
        <Info className="h-3.5 w-3.5 text-primary-500 shrink-0" />
        <p>Pins show relative locations. Radial lines represent distance limits of up to 5 kilometres from your center position.</p>
      </div>
    </div>
  );
};
export default SimpleMap;
