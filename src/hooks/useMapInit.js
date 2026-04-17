import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInit = (mapNodeRef, onMapLoad, isDark) => {
    const mapRef = useRef(null);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

        const initMap = (centerCoordinates) => {
            if (!mapNodeRef.current || mapRef.current) return;

            const map = new mapboxgl.Map({
                container: mapNodeRef.current,
                // Ensure initial load uses the current state
                style: isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11',
                center: centerCoordinates,
                zoom: 15.5,
                pitch: 45,
                bearing: -17.6,
                antialias: true
            });

            map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                    showUserHeading: true
                }),
                'bottom-right'
            );

            mapRef.current = map;

            if (onMapLoad) {
                onMapLoad(map);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => initMap([p.coords.longitude, p.coords.latitude]),
                (err) => {
                    console.warn("Location denied, defaulting to Bangkok.");
                    initMap([100.5018, 13.7563]);
                }
            );
        } else {
            initMap([100.5018, 13.7563]);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
        // Adding isDark here is the "Auto-Refresh" secret.
        // It ensures that if the theme changes BEFORE geolocation finishes,
        // the map still initializes with the correct style.
    }, [mapNodeRef, isDark]); 

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const targetStyle = isDark 
            ? 'mapbox://styles/mapbox/dark-v10' 
            : 'mapbox://styles/mapbox/streets-v11';

        const changeStyle = () => {
            // Check if the style is already set to avoid infinite loops
            if (map.getStyle()?.metadata?.['mapbox:origin'] !== (isDark ? 'dark-v10' : 'streets-v11')) {
                map.setStyle(targetStyle);
            }
        };

        if (map.isStyleLoaded()) {
            changeStyle();
        } else {
            map.once('idle', changeStyle);
        }
    }, [isDark]);

    return mapRef;
};