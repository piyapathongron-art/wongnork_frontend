import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInit = (mapNodeRef, onMapLoad, onMoveEnd, isDarkMode) => {
    const mapRef = useRef(null);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

        const initMap = (centerCoordinates) => {
            // Prevent double initialization in React Strict Mode
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

            // --- 1. ADD STANDARD CONTROLS ---
            map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                    showUserHeading: true
                }),
                'bottom-right'
            );

            // --- 2. ADD EVENT LISTENERS ---
            // Triggered whenever the user stops panning or zooming
            map.on('moveend', () => {
                if (onMoveEnd) {
                    onMoveEnd(map);
                }
            });

            mapRef.current = map;

            // Pass the map instance back to the component for specific setup (like markers)
            if (onMapLoad) {
                onMapLoad(map);
            }
        };

        // --- 3. GEOLOCATION STARTUP ---
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => initMap([p.coords.longitude, p.coords.latitude]),
                (err) => {
                    console.warn("Location denied or insecure context, defaulting to Bangkok.");
                    initMap([100.5018, 13.7563]);
                }
            );
        } else {
            initMap([100.5018, 13.7563]);
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapNodeRef, onMapLoad, onMoveEnd]);

    useEffect(() => {
        if (!mapRef.current) return;

        const newStyle = isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11';

        mapRef.current.setStyle(newStyle);
    }, [isDark]);

    return mapRef;
};