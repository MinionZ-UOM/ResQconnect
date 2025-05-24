"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Disaster, GeoLocation, RequestType, RequestPriority } from "@/lib/types"
import { callApi } from "@/lib/api"

export default function NewRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disasterIdParam = searchParams.get("disasterId")

  // Dynamic disasters fetched from backend
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [loadingDisasters, setLoadingDisasters] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requestType, setRequestType] = useState<RequestType | "">("")
  const [priority, setPriority] = useState<RequestPriority | "">("")
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [selectedDisaster, setSelectedDisaster] = useState<string>(
    disasterIdParam ?? "none"
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch disasters on mount
  useEffect(() => {
    const loadDisasters = async () => {
      setLoadingDisasters(true)
      try {
        const data = await callApi<Disaster[]>("disasters", "GET")
        setDisasters(data)
      } catch (err) {
        console.error("Failed to fetch disasters:", err)
        setFetchError("Could not load disasters. Please try again later.")
      } finally {
        setLoadingDisasters(false)
      }
    }
    loadDisasters()
  }, [])

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Unable to get your location. Please enable location or refresh.")
          setIsLoadingLocation(false)
        }
      )
    } else {
      setLocationError("Geolocation not supported. Please use a modern browser.")
    }
  }, [])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (isCameraActive && videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [isCameraActive])

  const toggleCamera = async () => {
    if (isCameraActive) {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setIsCameraActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        setIsCameraActive(true)
      } catch (err) {
        console.error("Camera error:", err)
        alert("Cannot access camera.")
      }
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const ctx = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      // photos are a no-op for now
    }, "image/jpeg")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) {
      alert("Location not available.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        disaster_id: selectedDisaster === "none" ? null : selectedDisaster,
        title,
        description,
        type_of_need: requestType,
        priority,
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
      }
      await callApi("requests", "POST", payload)
      alert("Request submitted successfully!")
      router.push(
        `/dashboard/affected/requests${selectedDisaster && selectedDisaster !== "none"
          ? `?disasterId=${selectedDisaster}`
          : ""
        }`
      )
    } catch (err) {
      console.error(err)
      alert("Submission failed. Try again.")
      setIsSubmitting(false)
    }
  }

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
            <p>Loading disasters...</p>
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

        {/* Title */}
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

        {/* Description */}
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

        {/* Type & Priority */}
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

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          {isLoadingLocation ? (
            <p>Detecting location...</p>
          ) : locationError ? (
            <p className="text-red-600">{locationError}</p>
          ) : location ? (
            <p className="italic">
              {`Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`}
            </p>
          ) : (
            <p className="italic">Location not available</p>
          )}
        </div>

        {/* Photos (no-op) */}
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
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
          />
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
            </div>
          )}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  )
}
