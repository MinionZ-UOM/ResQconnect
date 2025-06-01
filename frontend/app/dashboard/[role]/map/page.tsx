'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Request, Resource, Disaster } from "@/lib/types";

interface MapPageProps {
  params: {
    role: string;
  };
}

// Dynamically import MapView so that it only ever loads client-side:
const MapView = dynamic(
  () => import("@/components/ui/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        Loading map…
      </div>
    ),
  }
);

export default function MapPage({ params }: MapPageProps) {
  // Role is still available if you need it later
  const { role } = params;

  const [mapLoaded, setMapLoaded] = useState(false);

  // We only keep track of which ID was selected in each dropdown.
  // No detail cards will be shown, so we don’t need to store the full object.
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");

  // ──────────────────────────────────────────────
  // Dummy data arrays (still passed down to MapView for marker plotting)
  // ──────────────────────────────────────────────
  const mockDisasters: Disaster[] = [
    {
      id: "DIS-001",
      name: "Flood Zone A",
      description: "Severe flooding in northern region",
      severity: "High",
      location: { latitude: 7.95, longitude: 80.78, address: "North Riverbank" },
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      updatedAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: "DIS-002",
      name: "Earthquake Epicenter",
      description: "M5.8 quake near Badulla",
      severity: "Critical",
      location: { latitude: 6.99, longitude: 81.05, address: "Badulla District" },
      createdAt: new Date(Date.now() - 1000 * 60 * 300),
      updatedAt: new Date(Date.now() - 1000 * 60 * 300),
    },
  ];

  const mockRequests: Request[] = [
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
  ];

  const mockResources: Resource[] = [
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
  ];

  // ──────────────────────────────────────────────
  // Simulate map loading
  // ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
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
        {/* ────────────────────────────────────────────── */}
        {/* LEFT COLUMN: Three dropdown cards only */}
        <div className="md:col-span-1 space-y-6">
          {/* ── Disasters Dropdown ── */}
          <Card>
            <CardHeader>
              <CardTitle>Disasters</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedDisasterId}
                onValueChange={(val) => setSelectedDisasterId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Disaster" />
                </SelectTrigger>
                <SelectContent>
                  {mockDisasters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {mockRequests.map((r) => (
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
                  {mockResources.map((res) => (
                    <SelectItem key={res.id} value={res.id}>
                      {res.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* ────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: Map only */}
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
                    {/* Pass all three mock arrays so MapView can plot markers */}
                    <MapView
                      disasters={mockDisasters}
                      requests={mockRequests}
                      resources={mockResources}
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
