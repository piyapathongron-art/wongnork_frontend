import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createCustomMarkerElement } from '../utils/marker.util';
import { add3DBuildingsLayer } from '../utils/mapLayers.util';
import { useMapInit } from '../hooks/useMapInit';
import useRestaurantStore from '../stores/restaurantStore';

const MapBox = forwardRef(({ onMarkerClick, isDark }, ref) => {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); // Ref for the red placement marker
  const activeMarkersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const filteredRestaurants = useRestaurantStore(state => state.filteredRestaurants);
  const fetchRestaurants = useRestaurantStore(state => state.fetchRestaurants);

  useImperativeHandle(ref, () => ({
    flyToRestaurant: (restaurant) => {
      if (!mapRef.current) return;
      const lng = parseFloat(restaurant.lng);
      const lat = parseFloat(restaurant.lat);
      if (isNaN(lng) || isNaN(lat)) return;

      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 17,
        pitch: 60,
        speed: 1.5,
        curve: 1,
        essential: true,
      });
    },
    fitBoundsToCategory: (restaurants) => {
      if (!mapRef.current || !restaurants || restaurants.length === 0) return;

      // Create a 'LngLatBounds' with both corners at the first coordinate.
      const bounds = new mapboxgl.LngLatBounds(
        [parseFloat(restaurants[0].lng), parseFloat(restaurants[0].lat)],
        [parseFloat(restaurants[0].lng), parseFloat(restaurants[0].lat)]
      );

      // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
      for (const res of restaurants) {
        const lng = parseFloat(res.lng);
        const lat = parseFloat(res.lat);
        if (!isNaN(lng) && !isNaN(lat)) {
          bounds.extend([lng, lat]);
        }
      }

      mapRef.current.fitBounds(bounds, {
        padding: { top: 150, bottom: 300, left: 50, right: 50 },
        pitch: 0, // Reset pitch for a better overview
        speed: 1.2,
        maxZoom: 16 // Prevent zooming in too close if there's only 1 restaurant
      });
    }
  }));

  // Initial Fetch
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
    map.on("style.load", () => {
      setTimeout(() => {
        map.resize();
        add3DBuildingsLayer(map);
        setIsMapReady(true);
      }, 0);
    });

    // Map Click Logic
    map.on("click", (e) => {
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

  // Re-render markers when filteredRestaurants change or map becomes ready
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      renderMarkers();
    }
  }, [filteredRestaurants, isMapReady]);

  const renderMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    activeMarkersRef.current.forEach(marker => marker.remove());
    activeMarkersRef.current = [];

    // Add new markers
    filteredRestaurants.forEach((item) => {
      const lng = parseFloat(item.lng);
      const lat = parseFloat(item.lat);
      if (isNaN(lng) || isNaN(lat)) return;

      const el = createCustomMarkerElement(item.category);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 17,
          pitch: 60,
          speed: 1.5,
          curve: 1,
          essential: true,
        });

        if (onMarkerClick) {
          onMarkerClick(item);
        }
      });

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: black; padding: 5px; font-family: sans-serif;">
          <h4 style="margin:0; font-weight:bold;">${item.name}</h4>
          <p style="margin:0; font-size:12px;">${item.category || "Restaurant"}</p>
        </div>
      `);

      const newMarker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      activeMarkersRef.current.push(newMarker);
    });
  };

  // Use the custom hook
  useMapInit(mapNodeRef, handleMapLoad, Boolean(isDark));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapNodeRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
});

export default MapBox;
