import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [coords, setCoords] = useState(() => {
    try {
      const saved = sessionStorage.getItem('healthradius_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState(() => {
    return coords ? 'granted' : 'idle'; // idle, pending, granted, denied, timeout, unavailable, unsupported, manual
  });

  const [error, setError] = useState(null);

  const saveCoords = (latitude, longitude, isManual = false) => {
    const loc = { latitude, longitude };
    setCoords(loc);
    try {
      sessionStorage.setItem('healthradius_coords', JSON.stringify(loc));
    } catch {}
    setStatus(isManual ? 'manual' : 'granted');
    setError(null);
  };

  const clearLocation = () => {
    setCoords(null);
    setStatus('idle');
    setError(null);
    try {
      sessionStorage.removeItem('healthradius_coords');
    } catch {}
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('pending');
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveCoords(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        let errorMsg = 'Failed to retrieve your location.';
        let state = 'unavailable';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location access was denied. Please select a manual location or enable permission.';
            state = 'denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable.';
            state = 'unavailable';
            break;
          case err.TIMEOUT:
            errorMsg = 'The request to get your location timed out.';
            state = 'timeout';
            break;
          default:
            break;
        }
        
        setError(errorMsg);
        setStatus(state);
      },
      options
    );
  };

  return {
    coords,
    status,
    error,
    getLocation,
    clearLocation,
    setManualLocation: (lat, lng) => saveCoords(lat, lng, true)
  };
};
export default useGeolocation;
