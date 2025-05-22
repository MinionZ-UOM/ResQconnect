"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Camera, MapPin, Upload, X } from "lucide-react"
import type { Disaster, GeoLocation } from "@/lib/types"

export default function VolunteerReportPage() {
  const searchParams = useSearchParams()
  const disasterId = searchParams.get("disasterId")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [observationType, setObservationType] = useState<string>("")
  const [urgency, setUrgency] = useState<string>("")
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [address, setAddress] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [selectedDisaster, setSelectedDisaster] = useState<string>(disasterId || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mock disasters - in a real app, this would come from an API
  const mockDisasters: Disaster[] = [
    {
      id: "disaster-001",
      name: "California Wildfire",
      type: "Wildfire",
      status: "Active",
      description: "Rapidly spreading wildfire in Northern California affecting multiple counties.",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento, CA" },
      affectedArea: { radius: 50 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
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
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      severity: 5,
      impactedPopulation: 50000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setLocation(newLocation)

          // In a real app, we would use a reverse geocoding service to get the address
          // For now, we'll just set a mock address
          setAddress("Current Location (coordinates detected)")
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Unable to get your location. Please enter your location manually.")
          setIsLoadingLocation(false)
        },
      )
    } else {
      setLocationError("Geolocation is not supported by your browser. Please enter your location manually.")
    }
  }, [])

  // Clean up photo preview URLs when component unmounts
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviewUrls])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (isCameraActive && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isCameraActive])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setPhotos((prev) => [...prev, ...newFiles])

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setPhotoPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const handleRemovePhoto = (index: number) => {
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index])

    // Remove the photo and its preview URL
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleCamera = async () => {
    if (isCameraActive) {
      // Turn off camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsCameraActive(false)
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsCameraActive(true)
      } catch (error) {
        console.error("Error accessing camera:", error)
        alert("Unable to access camera. Please check your permissions.")
      }
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame on the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })

            // Add to photos array
            setPhotos((prev) => [...prev, file])

            // Create and add preview URL
            const previewUrl = URL.createObjectURL(blob)
            setPhotoPreviewUrls((prev) => [...prev, previewUrl])
          }
        }, "image/jpeg")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to submit the report
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Submitting report:", {
        disasterId: selectedDisaster,
        title,
        description,
        observationType,
        urgency,
        location,
        address,
        photos: photos.map((p) => p.name),
      })

      // Show success message
      alert("Observation report submitted successfully!")

      // Reset form
      setTitle("")
      setDescription("")
      setObservationType("")
      setUrgency("")
      setAddress("")

      // Clean up photo previews
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
      setPhotos([])
      setPhotoPreviewUrls([])
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Error submitting report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Report Field Observation</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Submit observations from the field to help coordinate disaster response
        </p>
      </header>

      {locationError && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-yellow-700 dark:text-yellow-400">{locationError}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                Location information helps responders accurately identify the area you're reporting about.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observation Details</CardTitle>
            <CardDescription>Provide detailed information about what you're observing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disaster">Disaster Event</Label>
              <Select value={selectedDisaster} onValueChange={setSelectedDisaster} required>
                <SelectTrigger id="disaster">
                  <SelectValue placeholder="Select disaster event" />
                </SelectTrigger>
                <SelectContent>
                  {mockDisasters.map((disaster) => (
                    <SelectItem key={disaster.id} value={disaster.id}>
                      {disaster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Observation Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of your observation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you're observing in detail"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Observation Type</Label>
                <Select value={observationType} onValueChange={setObservationType} required>
                  <SelectTrigger id="type">
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

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <RadioGroup
                  id="urgency"
                  value={urgency}
                  onValueChange={setUrgency}
                  className="flex flex-col space-y-1"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="urgency-low" />
                    <Label htmlFor="urgency-low" className="font-normal">
                      Low - For information only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="urgency-medium" />
                    <Label htmlFor="urgency-medium" className="font-normal">
                      Medium - Needs attention soon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="urgency-high" />
                    <Label htmlFor="urgency-high" className="font-normal">
                      High - Requires prompt action
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="urgency-critical" />
                    <Label htmlFor="urgency-critical" className="font-normal">
                      Critical - Immediate response needed
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where is this observation located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-400" />
              {isLoadingLocation ? (
                <span className="text-slate-500">Detecting your location...</span>
              ) : location ? (
                <span className="text-slate-700 dark:text-slate-300">
                  Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </span>
              ) : (
                <span className="text-slate-500">No location detected</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address or Location Description</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or describe the location"
                required
              />
              <p className="text-xs text-slate-500">
                Please provide a detailed description of the location to help responders find it
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Add photos to help illustrate your observation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
              <Button type="button" variant="outline" onClick={toggleCamera}>
                <Camera className="mr-2 h-4 w-4" />
                {isCameraActive ? "Turn Off Camera" : "Take Photo"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            {isCameraActive && (
              <div className="relative border rounded-md overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-[300px] object-contain bg-black" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <Button type="button" onClick={capturePhoto} className="bg-white text-black hover:bg-gray-200">
                    Capture
                  </Button>
                </div>
              </div>
            )}

            {photoPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !selectedDisaster}>
            {isSubmitting ? "Submitting..." : "Submit Observation"}
          </Button>
        </div>
      </form>
    </div>
  )
}
