"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet’s default-icon URLs (so markers load correctly)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:        require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:      require("leaflet/dist/images/marker-shadow.png"),
});

export function MapView() {
  // This ref will point at the <div> we render. Leaflet will create a map on it.
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // We keep the Leaflet.Map instance here so that we can remove() it on cleanup:
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // If the <div> is mounted, and we have not yet created a map instance:
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // 1) Initialize the map on that container
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 7);

      // 2) Add a tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);

      // 3) Add a single marker (Sri Lanka center)
      L.marker([7.8731, 80.7718])
        .addTo(mapInstanceRef.current)
        .bindPopup("🇱🇰 Sri Lanka Center");
    }

    // Cleanup: when this component unmounts (or React re‐mounts under StrictMode),
    // call `.remove()` so Leaflet tears down all event listeners and DOM nodes.
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render a simple <div> that Leaflet will “take over.” Give it 100% width/height
  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
