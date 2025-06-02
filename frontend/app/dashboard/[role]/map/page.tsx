"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { DisasterLocation, Request, Resource } from "@/lib/types";
import { callApi } from "@/lib/api";

// Dynamically import MapView so that it only ever loads client-side:
const MapView = dynamic(
  () => import("@/components/ui/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">Loading map…</div>
    ),
  }
);

interface MapPageProps {
  params: {
    role: string;
  };
}

export default function MapPage({ params }: MapPageProps) {
  // Unwrap `params` before accessing its properties:
  const { role } = use(params);

  // ─── Real “disasters” pulled from /api/location ───
  const [disasters, setDisasters] = useState<DisasterLocation[]>([]);
  const [isLoadingDisasters, setIsLoadingDisasters] = useState(true);

  // ─── Fetch real disasters from /api/location ───
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingDisasters(true);
        const data = await callApi<DisasterLocation[]>("disasters/location");
        setDisasters(data);
      } catch (err) {
        console.error("Failed to fetch disaster locations:", err);
      } finally {
        setIsLoadingDisasters(false);
      }
    })();
  }, []);

  // ─── Automatically spawn 3–5 “requests” within 5km of each disaster ───
  const [requests, setRequests] = useState<Request[]>([]);
  useEffect(() => {
    if (disasters.length === 0) {
      setRequests([]);
      return;
    }

    const generated: Request[] = [];
    const R = 6371000; // Earth radius in meters
    const maxRadius = 5000; // 5 km

    disasters.forEach((d) => {
      // Random count between 3 and 5
      const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      for (let i = 0; i < count; i++) {
        // Generate a random point within a circle of radius 5km
        // using the “random point in circle” technique
        const r = Math.sqrt(Math.random()) * maxRadius;
        const theta = Math.random() * 2 * Math.PI;
        // Δlat in degrees
        const deltaLat = (r * Math.cos(theta)) / R * (180 / Math.PI);
        // Δlng in degrees (adjusted by cos of original latitude)
        const deltaLng =
          (r * Math.sin(theta)) /
          (R * Math.cos((d.location.lat * Math.PI) / 180)) *
          (180 / Math.PI);

        const newLat = d.location.lat + deltaLat;
        const newLng = d.location.lng + deltaLng;

        generated.push({
          id: `${d.id}-REQ-${i + 1}`,
          title: `Supply Request for ${d.name} #${i + 1}`,
          description: `Auto-generated supply request #${i + 1} within 5 km of ${d.name}.`,
          type: "Supply",
          status: "New",
          priority: "Medium",
          location: {
            latitude: newLat,
            longitude: newLng,
            address: "",
          },
          createdBy: "system",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    setRequests(generated);
  }, [disasters]);

  // ─── Fetch real resources from /api/resources/locations ───
  const [resources, setResources] = useState<Resource[]>([]);
  useEffect(() => {
    (async () => {
      try {
        // Returns [{ resource_id, status, category, location: { lat, lng } }, …]
        const data = await callApi<
          {
            resource_id: string;
            status: string;
            category: string;
            location: { lat: number; lng: number };
          }[]
        >("resources/locations");

        // Transform into Resource shape for MapView
        const mapped = data.map((r) => ({
          id: r.resource_id,
          name: r.category,
          type: r.category,
          status: r.status,
          quantity: undefined,
          location: {
            latitude: r.location.lat,
            longitude: r.location.lng,
            address: "",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        setResources(mapped);
      } catch (err) {
        console.error("Failed to fetch resource locations:", err);
      }
    })();
  }, []);

  // ─── Compute grouped counts by resource type ───
  const resourceGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [resources]);

  // ─── Dropdown selections ───
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("");

  // ─── Simulate map loading ───
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Map View
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Select a Disaster, Request, or Resource Type to highlight on the map
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ── LEFT COLUMN: Three dropdown cards ── */}
        <div className="md:col-span-1 space-y-6">
          {/* ── Disasters Dropdown ── */}
          <Card>
            <CardHeader>
              <CardTitle>Disasters</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDisasters ? (
                <div className="text-sm text-slate-500">Loading disasters…</div>
              ) : (
                <Select
                  value={selectedDisasterId}
                  onValueChange={(val) => setSelectedDisasterId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Disaster" />
                  </SelectTrigger>
                  <SelectContent>
                    {disasters.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* ── Requests Dropdown ── */}
          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedRequestId}
                onValueChange={(val) => setSelectedRequestId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Request" />
                </SelectTrigger>
                <SelectContent>
                  {requests.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* ── Resources (Grouped by Type) Dropdown ── */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedResourceType}
                onValueChange={(val) => setSelectedResourceType(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceGroups.map(({ type, count }) => (
                    <SelectItem key={type} value={type}>
                      {`${type} (${count})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Map only ── */}
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardContent className="p-0 h-full">
              {!mapLoaded ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="relative h-full bg-slate-100 dark:bg-slate-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Pass disasters, the autogenerated requests, and fetched resources to MapView */}
                    <MapView
                      disasters={disasters}
                      requests={requests}
                      resources={resources}
                      selectedDisasterId={selectedDisasterId}
                      selectedRequestId={selectedRequestId}
                      selectedResourceId={selectedResourceType}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
