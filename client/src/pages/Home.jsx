import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, HelpCircle, AlertCircle, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { useGetPublicConfigQuery } from '../app/api.js';

export const Home = () => {
  const navigate = useNavigate();
  const { coords, status, error, getLocation, setManualLocation } = useGeolocation();
  const { data: configResp } = useGetPublicConfigQuery();
  const config = configResp?.data;

  const [radius, setRadius] = useState(5000); // 5km default

  const demoLat = config?.demoCenter?.lat || 40.7128;
  const demoLng = config?.demoCenter?.lng || -74.0060;
  const demoLocationName = config?.demoLocationName || 'HealthRadius Demo City';

  // Redirect to search page once coordinates are captured
  useEffect(() => {
    if (coords && (status === 'granted' || status === 'manual')) {
      navigate(`/search?lat=${coords.latitude}&lng=${coords.longitude}&radius=${radius}`);
    }
  }, [coords, status, radius, navigate]);

  const handleLocateMe = () => {
    getLocation();
  };

  const handleUseDemo = () => {
    setManualLocation(demoLat, demoLng);
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-primary-50/50 via-slate-50 to-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Find Trusted Healthcare <br />
            <span className="text-primary-600">Within Your Radius</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-500 leading-relaxed">
            Locate nearby hospitals instantly. Compare ratings, check emergency availability, and view verified hospital details up to 5 km from you.
          </p>
        </div>

        {/* Locate/Search Card */}
        <div className="w-full max-w-xl mx-auto bg-white border border-slate-200/85 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="space-y-4">
            {/* Radius Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-left">
                Select Search Radius
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2000, 3000, 5000].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={`py-3 px-1.5 text-xs sm:text-sm font-bold rounded-2xl border transition-all ${
                      radius === r
                        ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/15 scale-105'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r / 1000} km
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-[11px] text-slate-400 text-left leading-normal">
              🛡️ <span className="font-semibold">Privacy First:</span> Your location is used solely to find nearby hospitals. We do not store or track your exact coordinates on our servers.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLocateMe}
              disabled={status === 'pending'}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-350 text-white font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-primary-500/10 text-sm sm:text-base cursor-pointer"
            >
              <Compass className={`h-5 w-5 ${status === 'pending' ? 'animate-spin' : ''}`} />
              {status === 'pending' ? 'Accessing GPS...' : 'Use Current Location'}
            </button>

            <button
              onClick={handleUseDemo}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md text-sm sm:text-base cursor-pointer"
            >
              <Search className="h-4.5 w-4.5 text-primary-400" />
              Use Demo Location
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Location Request Issue</p>
                <p className="mt-0.5">{error}</p>
                <button
                  onClick={handleUseDemo}
                  className="mt-1.5 underline font-bold text-red-800 hover:text-red-950 block"
                >
                  Click here to switch to {demoLocationName} demo area instead.
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl text-left space-y-2.5 shadow-sm">
            <Layers className="h-6 w-6 text-secondary-500" />
            <h3 className="font-bold text-slate-800 text-sm">Compare side-by-side</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select up to three hospitals and compare phone availability, specialties, emergency rooms, insurance, and accessibility layouts.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl text-left space-y-2.5 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Verify Information Trust</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Understand the freshness of records. Spot external provider metrics versus verified application audits.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl text-left space-y-2.5 shadow-sm">
            <HelpCircle className="h-6 w-6 text-primary-500" />
            <h3 className="font-bold text-slate-800 text-sm">Transparent Recommendation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sort by transparent recommendations that blend Bayesian rating averages, review volumes, and distance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Home;
