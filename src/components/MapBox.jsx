import React, { useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { apiGetResturent } from '../api/resturent';
import { createCustomMarkerElement } from '../utils/marker.util';
import { add3DBuildingsLayer } from '../utils/mapLayers.util';
import { useMapInit } from '../hooks/useMapInit';

const MapBox = () => {
  const mapNodeRef = useRef(null);
  const markerRef = useRef(null); // Ref for the red placement marker

  const handleMapLoad = (map) => {
    // Add Controls
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'bottom-right');

    map.on('load', async () => {
      map.resize();
      add3DBuildingsLayer(map);

      try {
        const res = await apiGetResturent();
        const restaurants = res.data.restaurants;

        restaurants?.forEach((item) => {
          const lng = parseFloat(item.lng);
          const lat = parseFloat(item.lat);
          if (isNaN(lng) || isNaN(lat)) return;

          const el = createCustomMarkerElement(item.category);
          
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            map.flyTo({
              center: [lng, lat],
              zoom: 17,
              pitch: 60,
              speed: 1.5,
              curve: 1,
              essential: true
            });
          });

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color: black; padding: 5px; font-family: sans-serif;">
              <h4 style="margin:0; font-weight:bold;">${item.name}</h4>
              <p style="margin:0; font-size:12px;">${item.category || 'Restaurant'}</p>
            </div>
          `);

          new mapboxgl.Marker(el).setLngLat([lng, lat]).setPopup(popup).addTo(map);
        });
      } catch (err) {
        console.error("Marker Loading Error:", err);
      }
    });

    // Map Click Logic
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#FF0000" })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    });
  };

  // Use the custom hook
  useMapInit(mapNodeRef, handleMapLoad);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapNodeRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default MapBox;