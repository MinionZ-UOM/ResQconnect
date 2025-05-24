"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Disaster, GeoLocation, RequestType, RequestPriority } from "@/lib/types";
import { callApi } from "@/lib/api";
import { imagekit } from "@/lib/imagekit";

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disasterIdParam = searchParams.get("disasterId") ?? "none";

  // --- disasters list ---
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loadingDisasters, setLoadingDisasters] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- form fields ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [priority, setPriority] = useState<RequestPriority | "">("");
  const [selectedDisaster, setSelectedDisaster] = useState<string>(disasterIdParam);

  // --- location ---
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // --- ImageKit uploads ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // --- submission state ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch disasters
  useEffect(() => {
    (async () => {
      console.log("Loading disasters…");
      setLoadingDisasters(true);
      try {
        const data = await callApi<Disaster[]>("disasters", "GET");
        console.log("Fetched disasters:", data);
        setDisasters(data);
      } catch (err) {
        console.error("Failed to fetch disasters:", err);
        setFetchError("Could not load disasters. Please try again later.");
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
    console.log("Attempting to get geolocation…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Got position:", pos);
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error("Error getting location:", err);
        setLocationError("Unable to get your location.");
        setIsLoadingLocation(false);
      }
    );
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (isCameraActive && videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraActive]);

  // Toggle camera on/off
  const toggleCamera = async () => {
    if (isCameraActive) {
      console.log("Stopping camera…");
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraActive(false);
    } else {
      console.log("Starting camera…");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Cannot access camera.");
      }
    }
  };

  // Capture & upload photo from camera
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      console.log("Captured blob:", blob);
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      try {
        console.log("Uploading captured photo…");
        const res = await imagekit.upload({
          file,
          fileName: file.name,
          folder: "/requests/captures",
        });
        console.log("Capture upload result:", res);
        setMediaUrls((prev) => [...prev, res.url]);
      } catch (err) {
        console.error("Capture upload failed:", err);
        alert("Could not upload captured photo");
      }
    }, "image/jpeg");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. grab the native input element immediately
    const input = e.currentTarget
    const files = Array.from(input.files || [])
    
    for (let file of files) {
      try {
        console.log("Uploading file:", file.name)
        
        // 2. fetch auth params yourself (so you know they’re there)
        const authRes = await fetch("/api/imagekit/auth")
        if (!authRes.ok) throw new Error("Auth fetch failed")
        const { token, signature, expire } = await authRes.json()
        console.log("Got auth params:", { token, signature, expire })
        
        // 3. pass them into your upload call
        const res = await imagekit.upload({
          file,
          fileName: file.name,
          folder: "/requests",
          tags: ["requestMedia"],
          token,
          signature,
          expire,
        })
        console.log("Upload success:", res)
        setMediaUrls((prev) => [...prev, res.url])
      } catch (err) {
        console.error("Upload failed for", file.name, err)
        alert(`Image upload failed: ${file.name}`)
      }
    }
    
    // 4. now it’s safe to clear the input
    input.value = ""
  }

  // Form submit
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
      media_urls: mediaUrls,
    };

    console.log("Submitting payload:", payload);
    try {
      await callApi("requests", "POST", payload);
      console.log("Request submitted successfully");
      alert("Request submitted!");
      router.push(
        `/dashboard/affected/requests${selectedDisaster !== "none" ? `?disasterId=${selectedDisaster}` : ""}`
      );
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">New Request</h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Disaster selector */}
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
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>

        {/* Type & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Type of Need</label>
            <select
              name="typeOfNeed"
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
              name="priority"
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

        {/* Location */}
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

        {/* Photos (upload & camera) */}
        <div>
          <label className="block mb-1 font-medium">Photos</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border rounded"
            >
              Upload
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className="px-3 py-2 border rounded"
            >
              {isCameraActive ? "Stop Camera" : "Open Camera"}
            </button>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* live camera & capture */}
          {isCameraActive && (
            <div className="mb-2">
              <video ref={videoRef} autoPlay className="w-full max-w-sm rounded" />
              <button
                type="button"
                onClick={capturePhoto}
                className="mt-2 px-3 py-2 border rounded"
              >
                Capture
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* uploaded URLs */}
          {mediaUrls.length > 0 && (
            <ul className="mt-2 space-y-1">
              {mediaUrls.map((url) => (
                <li key={url} className="text-sm text-blue-600">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
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
