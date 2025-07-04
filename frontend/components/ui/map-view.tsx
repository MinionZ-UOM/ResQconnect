"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { DisasterLocation, Request, Resource } from "@/lib/types";

// Colored marker icons:
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  disasters: DisasterLocation[];
  requests: Request[];
  resources: Resource[];
}

export function MapView({ disasters, requests, resources }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize the map centered on Sri Lanka
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(
        [7.8731, 80.7718],
        7
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers by removing all layers except tile layer
    mapInstanceRef.current?.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapInstanceRef.current!.removeLayer(layer);
      }
    });

    // Plot Disasters (red) using lat/lng from API
    disasters.forEach((d) => {
      L.marker([d.location.lat, d.location.lng], { icon: redIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<strong>${d.name}</strong>`);
    });

    // Plot Requests (blue)
    requests.forEach((r) => {
      L.marker([r.location.latitude, r.location.longitude], { icon: blueIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<strong>${r.title}</strong><br/>
           Type: ${r.type}<br/>
           Status: ${r.status}`
        );
    });

    // Plot Resources (green)
    resources.forEach((res) => {
      L.marker([res.location.latitude, res.location.longitude], {
        icon: greenIcon,
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<strong>${res.name}</strong><br/>
           Type: ${res.type}<br/>
           Status: ${res.status}`
        );
    });

        // Add legend to the map
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <i style="background-image: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png');
                  background-size: contain; width: 25px; height: 41px; display: inline-block;"></i> Disaster<br/>
        <i style="background-image: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png');
                  background-size: contain; width: 25px; height: 41px; display: inline-block;"></i> Request<br/>
        <i style="background-image: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png');
                  background-size: contain; width: 25px; height: 41px; display: inline-block;"></i> Resource
      `;
      return div;
    };

    legend.addTo(mapInstanceRef.current!);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [disasters, requests, resources]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
