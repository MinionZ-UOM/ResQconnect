"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Disaster, GeoLocation, RequestType, RequestPriority } from "@/lib/types";
import { callApi } from "@/lib/api";
import { imagekit } from "@/lib/imagekit";

interface MediaItem {
  url:     string;
  file_id: string;
  name?:   string;
  size?:   number;
  width?:  number;
  height?: number;
}

export default function NewRequestPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const disasterIdParam = sp.get("disasterId") ?? "none";

  // — disasters
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // — form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [priority, setPriority] = useState<RequestPriority | "">("");
  const [selectedDisaster, setSelectedDisaster] = useState(disasterIdParam);

  // — location
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // — pre-upload selection & previews
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // — post-upload media metadata
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // — submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch disasters
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

  // Get user location
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

  // Build previews whenever selectedFiles changes
  useEffect(() => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  // Handle file selection
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.currentTarget.value = "";
  };

  // Remove a preview before upload
  const removePreview = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload all selected files
  const uploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    try {
      // Fetch ImageKit auth once
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) throw new Error("Auth failed");
      const { token, signature, expire } = await authRes.json();

      for (let file of selectedFiles) {
        const res = await imagekit.upload({
          file,
          fileName: file.name,
          folder: "/requests",
          token,
          signature,
          expire,
        });
        // Map ImageKit response → our MediaItem
        setMedia((prev) => [
          ...prev,
          {
            url:     res.url,
            file_id: res.fileId,
            name:    file.name,
            size:    res.fileSize,
            width:   res.width,
            height:  res.height,
          },
        ]);
      }

      // Clear selection & previews
      setSelectedFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("One or more uploads failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Final form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Location not available.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      disaster_id: selectedDisaster === "none" ? null : selectedDisaster,
      title,
      description,
      type_of_need: requestType,
      priority,
      location: { lat: location.latitude, lng: location.longitude },
      media, // ← full array of MediaItem
    };

    console.log("Submitting payload:", payload);
    try {
      await callApi("requests", "POST", payload);
      alert("Request submitted!");
      router.push(
        `/dashboard/affected/requests${
          selectedDisaster !== "none" ? `?disasterId=${selectedDisaster}` : ""
        }`
      );
    } catch {
      alert("Submit failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">New Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* — Disaster selector */}
        <div>
          <label className="block mb-1 font-medium">Disaster</label>
          {loadingDisasters ? (
            <p>Loading disasters…</p>
          ) : fetchError ? (
            <p className="text-red-600">{fetchError}</p>
          ) : (
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="none">Not Included</option>
              {disasters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* — Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* — Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>

        {/* — Type & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Type of Need</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select type</option>
              <option value="Medical">Medical</option>
              <option value="Food">Food</option>
              <option value="Shelter">Shelter</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as RequestPriority)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* — Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          {isLoadingLocation ? (
            <p>Detecting location…</p>
          ) : locationError ? (
            <p className="text-red-600">{locationError}</p>
          ) : location ? (
            <p className="italic">
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
            </p>
          ) : (
            <p className="italic">Location not available</p>
          )}
        </div>

        {/* — Photos: select & preview */}
        <div>
          <label className="block mb-1 font-medium">Photos</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border rounded"
            >
              Select Files
            </button>
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={uploadAll}
                disabled={isUploading}
                className="px-3 py-2 border rounded bg-green-100"
              >
                {isUploading ? "Uploading…" : "Upload Selected Images"}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onFilesSelected}
            className="hidden"
          />

          {/* previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* uploaded */}
          {media.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Uploaded Images:</p>
              <div className="grid grid-cols-3 gap-2">
                {media.map((m, i) => (
                  <a key={i} href={m.url} target="_blank" rel="noopener noreferrer">
                    <img src={m.url} className="w-full h-24 object-cover rounded" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* — Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
