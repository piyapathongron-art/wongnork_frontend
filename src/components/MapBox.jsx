import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapContainer = () => {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // VITE check: Use import.meta.env
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapRef.current && mapNodeRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [100.5018, 13.7563], // Bangkok
        zoom: 13,
      });

      mapRef.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          const newMarker = new mapboxgl.Marker({ color: "#FF0000" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          const el = newMarker.getElement();
          const deleteHandler = (evt) => {
            evt.stopPropagation();
            newMarker.remove();
            markerRef.current = null;
          };

          el.addEventListener('click', deleteHandler);
          el.addEventListener('touchstart', deleteHandler, { passive: true });

          markerRef.current = newMarker;
        }
      });
    }

    return () => mapRef.current?.remove();
  }, []);

  return (
    <div 
      ref={mapNodeRef} 
      className="w-full h-full" 
    />
  );
};

export default MapContainer;