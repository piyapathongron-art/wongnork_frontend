import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export const useMapInit = (
  mapNodeRef,
  onMapLoad,
  isDark,
  disableAutoCenter = false,
  initialCenter = null,
) => {
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const initMap = (centerCoordinates) => {
      if (!mapNodeRef.current || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapNodeRef.current,
        style: isDark
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/streets-v11",
        center: centerCoordinates,
        zoom: initialCenter ? 12 : 15.5,
        pitch: initialCenter ? 0 : 45,
        bearing: initialCenter ? 0 : -17.6,
        antialias: true,
      });

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });

      map.addControl(geolocate, "bottom-right");

      // 🌟 จุดแก้ 1: เรียก onMapLoad ทันทีหลังสร้าง Map (ไม่ต้องรอ load event)
      // เพื่อให้ MapBox.jsx เข้าไปดักฟัง style.load ได้ทันเวลา
      if (onMapLoad) {
        onMapLoad(map);
      }

      map.on("load", () => {
        // 🌟 จุดแก้ 2: คุม Geolocation ตรงนี้ที่เดียว
        if (!disableAutoCenter) {
          geolocate.trigger();
        }
      });

      mapRef.current = map;
    };

    // ตรรกะเลือกพิกัดเริ่มต้น (เหมือนเดิม)
    if (initialCenter && initialCenter[0] !== 0) {
      initMap(initialCenter);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => initMap([p.coords.longitude, p.coords.latitude]),
        (err) => initMap([100.5018, 13.7563]),
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
  }, [mapNodeRef]);

  // ส่วนของ Theme Toggle (เหมือนเดิม)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const targetStyle = isDark
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/streets-v11";
    const changeStyle = () => {
      if (
        map.getStyle()?.metadata?.["mapbox:origin"] !==
        (isDark ? "dark-v10" : "streets-v11")
      ) {
        map.setStyle(targetStyle);
      }
    };
    if (map.isStyleLoaded()) changeStyle();
    else map.once("idle", changeStyle);
  }, [isDark]);

  return mapRef;
};
