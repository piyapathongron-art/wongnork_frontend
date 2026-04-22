import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createCustomMarkerElement } from "../utils/marker.util";
import { add3DBuildingsLayer } from "../utils/mapLayers.util";
import { useMapInit } from "../hooks/useMapInit";
import useRestaurantStore from "../stores/restaurantStore";

const MapBox = forwardRef(({ onMarkerClick, onClick, isDark }, ref) => {
  // Added onClick prop
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const activeMarkersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const filteredRestaurants = useRestaurantStore(
    (state) => state.filteredRestaurants,
  );
  const fetchRestaurants = useRestaurantStore(
    (state) => state.fetchRestaurants,
  );

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
    zoomOutToOverview: () => {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        zoom: 13,
        pitch: 0,
        speed: 1.2,
        essential: true,
      });
    },
    fitBoundsToCategory: (restaurants) => {
      if (!mapRef.current || !restaurants || restaurants.length === 0) return;
      const bounds = new mapboxgl.LngLatBounds(
        [parseFloat(restaurants[0].lng), parseFloat(restaurants[0].lat)],
        [parseFloat(restaurants[0].lng), parseFloat(restaurants[0].lat)],
      );
      for (const res of restaurants) {
        const lng = parseFloat(res.lng);
        const lat = parseFloat(res.lat);
        if (!isNaN(lng) && !isNaN(lat)) bounds.extend([lng, lat]);
      }
      mapRef.current.fitBounds(bounds, {
        padding: { top: 150, bottom: 300, left: 50, right: 50 },
        pitch: 0,
        speed: 1.2,
        maxZoom: 16,
      });
    },
  }));

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

    // --- UPDATED CLICK LOGIC ---
    map.on("click", (e) => {
      // Only run placement logic if the parent (Modal) provided an onClick prop
      if (onClick) {
        const { lng, lat } = e.lngLat;

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          // Use your signature brown color or keep the red
          markerRef.current = new mapboxgl.Marker({
            color: "#BC6C25",
            draggable: true,
          })
            .setLngLat([lng, lat])
            .addTo(map);

          // If the user drags the marker, tell the form
          markerRef.current.on("dragend", () => {
            const newPos = markerRef.current.getLngLat();
            onClick({ lngLat: newPos });
          });
        }
        // Send initial click coordinates back to form
        onClick(e);
      }
    });
  };

  useEffect(() => {
    if (isMapReady && mapRef.current) {
      renderMarkers();
    }
  }, [filteredRestaurants, isMapReady]);

  const renderMarkers = () => {
    if (!mapRef.current) return;
    activeMarkersRef.current.forEach((marker) => marker.remove());
    activeMarkersRef.current = [];

    filteredRestaurants.forEach((item) => {
      const lng = parseFloat(item.lng);
      const lat = parseFloat(item.lat);
      if (isNaN(lng) || isNaN(lat)) return;

      const el = createCustomMarkerElement(item.category);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 17,
          pitch: 60,
          speed: 1.5,
          curve: 1,
          essential: true,
        });

        if (onMarkerClick) onMarkerClick(item);
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

      newMarker.restaurantId = item.id;
      activeMarkersRef.current.push(newMarker);
    });
  };

  useMapInit(mapNodeRef, handleMapLoad, Boolean(isDark));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapNodeRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
});

export default MapBox;
