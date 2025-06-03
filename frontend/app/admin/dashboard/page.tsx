"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RequestsOverview } from "@/components/dashboard/requests-overview";
import { MetricsDisplay } from "@/components/dashboard/metrics-display";
import { UserStats } from "@/components/dashboard/user-stats";
import type { Disaster } from "@/lib/types";

export default function AdminDashboardPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<string>("all");

  // State for Langfuse feedback counts
  const [zeroCount, setZeroCount] = useState<number | null>(null);
  const [oneCount, setOneCount] = useState<number | null>(null);
  const [loadingLangfuse, setLoadingLangfuse] = useState<boolean>(true);
  const [langfuseError, setLangfuseError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisasters() {
      const snapshot = await getDocs(collection(db, "disasters"));
      const result: Disaster[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Disaster, "id">),
      }));
      setDisasters(result);
    }
    fetchDisasters();
  }, []);

  // Fetch Langfuse feedback counts
  useEffect(() => {
    async function fetchLangfuseScores() {
      setLoadingLangfuse(true);
      setLangfuseError(null);

      try {
        const res = await fetch("/api/langfuse");
        if (!res.ok) throw new Error("Unable to fetch Langfuse data");
        const json = await res.json();

        // Expecting: { data: [ { value: 0|1, ... }, ... ], meta: {...} }
        if (!Array.isArray(json.data)) {
          throw new Error("Unexpected Langfuse response format");
        }

        const allScores = json.data;
        const zeros = allScores.filter((item: any) => item.value === 0).length;
        const ones = allScores.filter((item: any) => item.value === 1).length;

        setZeroCount(zeros);
        setOneCount(ones);
      } catch (err: any) {
        console.error(err);
        setLangfuseError(err.message || "Unknown error");
      } finally {
        setLoadingLangfuse(false);
      }
    }

    fetchLangfuseScores();
  }, []);

  const currentDisaster = disasters.find((d) => d.id === selectedDisaster);

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="mb-6 ml-8 md:ml-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedDisaster === "all"
                ? "Overview of all disaster response activities"
                : `Overview of ${currentDisaster?.name || "Selected Disaster"} response activities`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedDisaster}
              onValueChange={setSelectedDisaster}
            >
              <SelectTrigger className="w-[180px] md:w-[240px]">
                <SelectValue placeholder="Select disaster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disasters</SelectItem>
                {disasters.map((disaster) => (
                  <SelectItem key={disaster.id} value={disaster.id}>
                    {disaster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button asChild>
              <a href="/admin/disasters">Register New Disaster</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Requests</CardTitle>
            <CardDescription>Pending assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {selectedDisaster === "all" ? 42 : 24}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-green-500 dark:text-green-400">↑ 12%</span> from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Resources</CardTitle>
            <CardDescription>Ready to deploy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {selectedDisaster === "all" ? 78 : 42}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="text-red-500 dark:text-red-400">↓ 8%</span> from yesterday
            </div>
          </CardContent>
        </Card>

        {/* Feedback Card with two small boxes */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 shadow-xl rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Feedback</CardTitle>
            <CardDescription>User feedback counts</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLangfuse ? (
              <div className="text-3xl font-bold text-gray-500">Loading…</div>
            ) : langfuseError ? (
              <div className="text-red-500 text-sm">Error: {langfuseError}</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Positive Responses Box */}
                <div className="bg-green-100 dark:bg-green-900 rounded-md p-4 flex flex-col items-center">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Positive Responses
                  </span>
                  <span className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                    {oneCount}
                  </span>
                </div>

                {/* Negative Responses Box */}
                <div className="bg-red-100 dark:bg-red-900 rounded-md p-4 flex flex-col items-center">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Negative Responses
                  </span>
                  <span className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                    {zeroCount}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overview Section (full width, bigger) */}
      <div className="mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="requests">
              <TabsList className="mb-4 overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <div className="overflow-x-auto">
                <TabsContent value="requests">
                  <RequestsOverview
                    disasterId={selectedDisaster === "all" ? undefined : selectedDisaster}
                  />
                </TabsContent>
                <TabsContent value="users">
                  <UserStats
                    disasterId={selectedDisaster === "all" ? undefined : selectedDisaster}
                  />
                </TabsContent>
                <TabsContent value="metrics">
                  <MetricsDisplay
                    disasterId={selectedDisaster === "all" ? undefined : selectedDisaster}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
