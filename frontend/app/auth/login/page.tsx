"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import { callApi } from "@/lib/api";
import type { BackendRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  uid: string;
  email: string;
  role_id: BackendRole;
  location?: { lat: number; lng: number } | null;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // State for location prompt
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const getBrowserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported by your browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password)

      // Use auth/me endpoint for consistency with signup page
      const profile = await callApi<{ role_id: BackendRole }>("users/me")
      console.log("Login profile response:", profile)
      const role = profile.role_id.toLowerCase();
      console.log("User role:", role)

      if (role === "affected_individual" && !profile.location) {
        setShowLocationPrompt(true);
        setIsLoading(false);
        return;
      }

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(`/dashboard/${role}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = async () => {
    setLocationError(null);
    setIsSavingLocation(true);

    try {
      const { lat, lng } = await getBrowserLocation();
      const token = await auth.currentUser!.getIdToken();

      const res = await fetch("/api/users/me/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lng }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || "Failed to save location.");
      }

      setShowLocationPrompt(false);
      router.push(`/dashboard/affected_individual`);
    } catch (geoErr: any) {
      console.error("Error fetching/saving location:", geoErr);
      setLocationError(geoErr.message || "Could not fetch your location. Please try again.");
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4 py-8 dark:from-slate-900 dark:to-slate-800 sm:px-6 md:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
              <AlertTriangle className="h-6 w-6" />
              <span>ResQConnect</span>
            </div>
          </Link>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Disaster Response Coordination Platform</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm border border-red-200">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Please share your location</h2>
            <p className="text-sm mb-4">
              We need your current GPS location to proceed. This helps us route your request to nearby volunteers.
            </p>
            {locationError && <div className="text-red-600 text-sm mb-2">{locationError}</div>}
            <Button
              onClick={handleShareLocation}
              className="w-full mb-2"
              disabled={isSavingLocation}
            >
              {isSavingLocation ? "Requesting Location…" : "Share My Location"}
            </Button>
            <button
              onClick={() => {
                setShowLocationPrompt(false);
                router.push("/dashboard/affected_individual");
              }}
              className="text-sm text-gray-600 hover:underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
