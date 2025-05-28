"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Disaster, GeoLocation, ObservationCreate } from "@/lib/types";
import { callApi } from "@/lib/api";
import { imagekit } from "@/lib/imagekit";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, MapPin, X } from "lucide-react";

import { enqueueRequest } from "@/lib/offlineQueue";

interface MediaItem {
  url:     string;
  file_id: string;
  name?:   string;
  size?:   number;
  width?:  number;
  height?: number;
}

export default function VolunteerReportPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const preselectDisaster = sp.get("disasterId") ?? "";

  // — disasters
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // — form fields
  const [selectedDisaster, setSelectedDisaster] = useState(preselectDisaster);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [observationType, setObservationType] = useState<ObservationCreate["observation_type"] | "">("");
  const [urgency, setUrgency] = useState<ObservationCreate["urgency"] | "">("");

  // — location
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // — file selection & previews
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // — uploaded media items
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // — submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1) Fetch disasters
  useEffect(() => {
    (async () => {
      setLoadingDisasters(true);
      try {
        const data = await callApi<Disaster[]>("disasters", "GET");
        setDisasters(data);
      } catch {
        setFetchError("Could not load disasters.");
      } finally {
        setLoadingDisasters(false);
      }
    })();
  }, []);

  // 2) Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsLoadingLocation(false);
      },
      () => {
        setLocationError("Unable to get your location.");
        setIsLoadingLocation(false);
      }
    );
  }, []);

  // 3) Build previews
  useEffect(() => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    return () => newPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  // — handlers
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.currentTarget.value = "";
  };

  const removePreview = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAll = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    try {
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) throw new Error("Auth failed");
      const { token, signature, expire } = await authRes.json();
      for (let file of selectedFiles) {
        const res = await imagekit.upload({
          file,
          fileName: file.name,
          folder: "/observations",
          token, signature, expire,
        });
        setMedia((prev) => [
          ...prev,
          {
            url: res.url,
            file_id: res.fileId,
            name: file.name,
            size: res.fileSize,
            width: res.width,
            height: res.height,
          },
        ]);
      }
      setSelectedFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("One or more uploads failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Location not available.");
      return;
    }
    if (selectedFiles.length) {
      await uploadAll();
    }
    setIsSubmitting(true);

    const payload: Omit<ObservationCreate, "image_urls"> & { image_urls: string[] } = {
      disaster_id: selectedDisaster,
      title,
      description,
      observation_type: observationType,
      urgency,
      latitude: location.latitude,
      longitude: location.longitude,
      address: locationError ? "" : `Lat:${location.latitude.toFixed(5)}, Lng:${location.longitude.toFixed(5)}`,
      image_urls: media.map((m) => m.url),
    };

    const submitOrQueue = async () => {
      if (!navigator.onLine) {
        await enqueueRequest({
          url: "observations",
          method: "POST",
          payload,
          timestamp: Date.now(),
        });
        alert("Offline: saved locally and will sync when back online.");
        router.push(`/dashboard/volunteer`);
        return;
      }
      try {
        await callApi("observations", "POST", payload);
        alert("Observation submitted!");
        router.push(`/dashboard/volunteer`);
      } catch {
        await enqueueRequest({
          url: "observations",
          method: "POST",
          payload,
          timestamp: Date.now(),
        });
        alert("Submit failed: saved locally for retry.");
        router.push(`/dashboard/volunteer`);
      }
    };

    await submitOrQueue();
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Report Field Observation</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* — Disaster selector */}
        <div>
          <Label htmlFor="disaster">Disaster Event</Label>
          {loadingDisasters
            ? <p>Loading…</p>
            : fetchError
            ? <p className="text-red-600">{fetchError}</p>
            : (
              <Select
                id="disaster"
                value={selectedDisaster}
                onValueChange={setSelectedDisaster}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select disaster" />
                </SelectTrigger>
                <SelectContent>
                  {disasters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        </div>

        {/* — Title & Description */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* — Type & Urgency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Observation Type</Label>
            <Select
              id="type"
              value={observationType}
              onValueChange={setObservationType}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damage">Infrastructure Damage</SelectItem>
                <SelectItem value="hazard">Hazardous Condition</SelectItem>
                <SelectItem value="people">People in Need</SelectItem>
                <SelectItem value="resources">Resource Status</SelectItem>
                <SelectItem value="weather">Weather Condition</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="urgency">Urgency</Label>
            <RadioGroup
              id="urgency"
              value={urgency}
              onValueChange={setUrgency}
              className="flex flex-col space-y-1"
              required
            >
              {["low","medium","high","critical"].map((u) => (
                <div key={u} className="flex items-center space-x-2">
                  <RadioGroupItem value={u} id={`urgency-${u}`} />
                  <Label htmlFor={`urgency-${u}`} className="font-normal">
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* — Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where is this observation?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5" />
              {isLoadingLocation
                ? <span>Detecting location…</span>
                : location
                ? <span>Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}</span>
                : <span className="text-red-600">{locationError}</span>
              }
            </div>
            <Input
              value={locationError ? "" : `Lat:${location?.latitude.toFixed(5)}, Lng:${location?.longitude.toFixed(5)}`}
              readOnly
            />
          </CardContent>
        </Card>

        {/* — Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Upload images (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Select Files
              </Button>
              {selectedFiles.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={uploadAll}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading…" : "Upload"}
                </Button>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={onFilesSelected}
              className="hidden"
            />

            {/* previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-full h-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* uploaded */}
            {media.length > 0 && (
              <div>
                <p className="font-medium">Uploaded Images</p>
                <div className="grid grid-cols-3 gap-2">
                  {media.map((m, i) => (
                    <a key={i} href={m.url} target="_blank" rel="noopener noreferrer">
                      <img src={m.url} className="w-full h-24 object-cover rounded" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* — Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            {isSubmitting ? "Submitting…" : "Submit Observation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
