import { useEffect, useRef, useState } from 'react';

export type GeoStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable' | 'insecure' | 'error';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracyM: number;
}

interface UseGeolocationResult {
  status: GeoStatus;
  position: GeoPosition | null;
  error: string | null;
}

/**
 * Watches the device position while `active` is true.
 *
 * This exists to show the student where they are relative to the venue — the
 * database is what actually decides whether a check-in is inside the geofence,
 * because anything reported from here is client-supplied.
 */
export function useGeolocation(active: boolean): UseGeolocationResult {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      return;
    }

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setStatus('insecure');
      setError('Location needs a secure connection (HTTPS or localhost).');
      return;
    }
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('This browser cannot report your location.');
      return;
    }

    setStatus('locating');

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        });
        setError(null);
        setStatus('ready');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location access was denied. Allow it in your browser settings to check in here.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('error');
          setError("Couldn't get a location fix. Move somewhere with a clearer view of the sky and try again.");
        } else {
          setStatus('error');
          setError('Timed out getting your location. Try again.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [active]);

  return { status, position, error };
}
