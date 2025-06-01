"use client";

import React, { use, useState, useEffect } from "react";
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

  // ─── Still‐mocking “requests” + “resources” for now ───
  const [requests] = useState<Request[]>([
    {
      id: "REQ-001",
      title: "Medical assistance needed",
      description: "Elderly person with diabetes needs insulin",
      type: "Medical",
      status: "New",
      priority: "High",
      location: { latitude: 7.87, longitude: 80.77, address: "Pokunuwita Rd, Colombo" },
      createdBy: "user-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "REQ-002",
      title: "Food supplies for shelter",
      description: "Need food supplies for 50 people at community shelter",
      type: "Food",
      status: "Assigned",
      priority: "Medium",
      location: { latitude: 7.88, longitude: 80.76, address: "Galle Rd, Colombo" },
      createdBy: "user-002",
      assignedTo: "user-102",
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  ]);

  const [resources] = useState<Resource[]>([
    {
      id: "RES-001",
      name: "Ambulance",
      type: "Vehicle",
      status: "Available",
      quantity: 1,
      location: { latitude: 7.87, longitude: 80.79, address: "National Hospital" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "RES-002",
      name: "Medical Supplies",
      type: "Medical",
      status: "Available",
      quantity: 20,
      location: { latitude: 7.86, longitude: 80.75, address: "Pharmacy Depot" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // ─── Dropdown selections ───
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");

  // ─── Simulate map loading ───
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // ─── Fetch real disasters from /api/location ───
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingDisasters(true);
        const data = await callApi<DisasterLocation[]>("disasters/location");

        console.log("Fetched disaster locations:", data);
        
        // API returns [{ id, name, location: { lat, lng } }, …]
        setDisasters(data);
      } catch (err) {
        console.error("Failed to fetch disaster locations:", err);
      } finally {
        setIsLoadingDisasters(false);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Map View
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Select a Disaster, Request, or Resource to highlight its marker on the map
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

          {/* ── Resources Dropdown ── */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedResourceId}
                onValueChange={(val) => setSelectedResourceId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((res) => (
                    <SelectItem key={res.id} value={res.id}>
                      {res.name}
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
                    {/* Pass the fetched disasters + mock requests & resources to MapView */}
                    <MapView
                      disasters={disasters}
                      requests={requests}
                      resources={resources}
                      selectedDisasterId={selectedDisasterId}
                      selectedRequestId={selectedRequestId}
                      selectedResourceId={selectedResourceId}
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
