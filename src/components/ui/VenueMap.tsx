import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LatLng {
  lat: number;
  lng: number;
}

interface VenueMapProps {
  /** Centre of the geofence — the venue. */
  venue: LatLng;
  /** Geofence radius in metres. */
  radiusM: number;
  /** The student's current position, if known. */
  position?: (LatLng & { accuracyM?: number }) | null;
  /** Let the user click/drag to move the venue pin (admin picker). */
  editable?: boolean;
  onVenueChange?: (next: LatLng) => void;
  className?: string;
}

// Leaflet's default marker points at image assets that break under bundlers.
// Div icons avoid that entirely and let the pins match the app's palette.
const venueIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#111;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const youIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function VenueMap({
  venue,
  radiusM,
  position,
  editable,
  onVenueChange,
  className = '',
}: VenueMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const venueMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const youMarkerRef = useRef<L.Marker | null>(null);
  const accuracyRef = useRef<L.Circle | null>(null);
  // Kept in a ref so the click handler always sees the current callback
  // without having to tear the map down and rebuild it.
  const onVenueChangeRef = useRef(onVenueChange);
  onVenueChangeRef.current = onVenueChange;

  // Build the map once.
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;

    const map = L.map(hostRef.current, {
      center: [venue.lat, venue.lng],
      zoom: 16,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    circleRef.current = L.circle([venue.lat, venue.lng], {
      radius: radiusM,
      color: '#111',
      weight: 2,
      fillColor: '#111',
      fillOpacity: 0.08,
    }).addTo(map);

    venueMarkerRef.current = L.marker([venue.lat, venue.lng], {
      icon: venueIcon,
      draggable: !!editable,
    }).addTo(map);

    if (editable) {
      venueMarkerRef.current.on('dragend', () => {
        const p = venueMarkerRef.current!.getLatLng();
        onVenueChangeRef.current?.({ lat: p.lat, lng: p.lng });
      });
      map.on('click', (e: L.LeafletMouseEvent) => {
        onVenueChangeRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    // The map is often mounted inside a modal or a tab that is still animating,
    // so its container has no size yet and tiles render grey. Recalculate once
    // the layout settles.
    const settle = window.setTimeout(() => map.invalidateSize(), 200);

    return () => {
      window.clearTimeout(settle);
      map.remove();
      mapRef.current = null;
      venueMarkerRef.current = null;
      circleRef.current = null;
      youMarkerRef.current = null;
      accuracyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the venue pin + geofence in sync.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    venueMarkerRef.current?.setLatLng([venue.lat, venue.lng]);
    circleRef.current?.setLatLng([venue.lat, venue.lng]);
    circleRef.current?.setRadius(radiusM);
  }, [venue.lat, venue.lng, radiusM]);

  // Keep the student's position in sync and frame both points.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!position) {
      if (youMarkerRef.current) {
        youMarkerRef.current.remove();
        youMarkerRef.current = null;
      }
      if (accuracyRef.current) {
        accuracyRef.current.remove();
        accuracyRef.current = null;
      }
      return;
    }

    const here: L.LatLngExpression = [position.lat, position.lng];

    if (youMarkerRef.current) {
      youMarkerRef.current.setLatLng(here);
    } else {
      youMarkerRef.current = L.marker(here, { icon: youIcon }).addTo(map);
    }

    if (position.accuracyM && position.accuracyM > 0) {
      if (accuracyRef.current) {
        accuracyRef.current.setLatLng(here);
        accuracyRef.current.setRadius(position.accuracyM);
      } else {
        accuracyRef.current = L.circle(here, {
          radius: position.accuracyM,
          color: '#2563eb',
          weight: 1,
          fillColor: '#2563eb',
          fillOpacity: 0.1,
        }).addTo(map);
      }
    }

    map.fitBounds(L.latLngBounds([here, [venue.lat, venue.lng]]).pad(0.6), { maxZoom: 17 });
  }, [position, venue.lat, venue.lng]);

  return (
    <div
      ref={hostRef}
      className={`w-full rounded-2xl overflow-hidden border border-ink-light-grey z-0 ${className}`}
    />
  );
}

/** Great-circle distance in metres — mirrors geo_distance_m() in the database. */
export function distanceMetres(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
