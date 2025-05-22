"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Disaster, GeoLocation, RequestType, RequestPriority } from "@/lib/types"

export default function NewRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disasterIdParam = searchParams.get("disasterId")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requestType, setRequestType] = useState<RequestType | "">("")
  const [priority, setPriority] = useState<RequestPriority | "">("")
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [address, setAddress] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [selectedDisaster, setSelectedDisaster] = useState<string>(disasterIdParam || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mock disasters - replace with API data in production
  const mockDisasters: Disaster[] = [
    {
      id: "disaster-001",
      name: "California Wildfire",
      type: "Wildfire",
      status: "Active",
      description: "Rapidly spreading wildfire in Northern California affecting multiple counties.",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento, CA" },
      affectedArea: { radius: 50 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      severity: 4,
      impactedPopulation: 25000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "disaster-002",
      name: "Hurricane Maria",
      type: "Hurricane",
      status: "Active",
      description: "Category 3 hurricane approaching the Gulf Coast with heavy rainfall and strong winds.",
      location: { latitude: 29.7604, longitude: -95.3698, address: "Houston, TX" },
      affectedArea: { radius: 100 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      severity: 5,
      impactedPopulation: 50000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setLocation(newLoc)
          setAddress("Current location detected")
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Unable to get your location. Please enter manually.")
          setIsLoadingLocation(false)
        }
      )
    } else {
      setLocationError("Geolocation not supported. Please enter location manually.")
    }
  }, [])

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviewUrls])

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (isCameraActive && videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [isCameraActive])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    setPhotos((p) => [...p, ...newFiles])
    const newUrls = newFiles.map((f) => URL.createObjectURL(f))
    setPhotoPreviewUrls((u) => [...u, ...newUrls])
  }

  const handleRemovePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviewUrls[idx])
    setPhotos((p) => p.filter((_, i) => i !== idx))
    setPhotoPreviewUrls((u) => u.filter((_, i) => i !== idx))
  }

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
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })
      setPhotos((p) => [...p, file])
      setPhotoPreviewUrls((u) => [...u, URL.createObjectURL(blob)])
    }, "image/jpeg")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // simulate API
      await new Promise((r) => setTimeout(r, 1500))
      alert("Request submitted successfully!")
      router.push(
        `/dashboard/affected/requests${selectedDisaster ? `?disasterId=${selectedDisaster}` : ""}`
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
        <div>
          <label className="block mb-1 font-medium">Disaster</label>
          <select
            value={selectedDisaster}
            onChange={(e) => setSelectedDisaster(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select a disaster</option>
            {mockDisasters.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Type</label>
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

        <div>
          <label className="block mb-1 font-medium">Location</label>
          {isLoadingLocation ? (
            <p>Detecting location...</p>
          ) : locationError ? (
            <>
              <p className="text-red-600 mb-1">{locationError}</p>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className="w-full border rounded px-3 py-2"
                required
              />
            </>
          ) : (
            <p className="italic">{address}</p>
          )}
        </div>

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
            onChange={handleFileChange}
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

          <canvas ref={canvasRef} className="hidden" />

          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photoPreviewUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
