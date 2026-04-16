import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInit = (mapNodeRef, onMapLoad) => {
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const initMap = (centerCoordinates) => {
      if (!mapNodeRef.current || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: centerCoordinates,
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });
      
      mapRef.current = map;
      onMapLoad(map);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => initMap([p.coords.longitude, p.coords.latitude]),
        () => initMap([100.5018, 13.7563])
      );
    } else {
      initMap([100.5018, 13.7563]);
    }

    return () => mapRef.current?.remove();
  }, [mapNodeRef]);

  return mapRef;
};