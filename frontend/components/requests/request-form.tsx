"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { RequestType, RequestPriority } from "@/lib/types"
import { Upload, MapPin, AlertTriangle } from "lucide-react"

interface RequestFormProps {
  role: string
}

export function RequestForm({ role }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "" as RequestType,
    priority: "" as RequestPriority,
    location: "",
    files: [] as File[],
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isOffline, setIsOffline] = useState(false)

  // Check if offline - in a real app, this would use the browser's online/offline events
  useState(() => {
    setIsOffline(false)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }))

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // If offline, store in IndexedDB for later sync
      if (isOffline) {
        console.log("Storing request in offline queue:", formData)
        // In a real app, this would use IndexedDB
        localStorage.setItem(`offline-request-${Date.now()}`, JSON.stringify(formData))
        alert("Request saved offline. It will be submitted when you're back online.")
      } else {
        console.log("Submitting request:", formData)
        alert("Request submitted successfully!")
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "" as RequestType,
        priority: "" as RequestPriority,
        location: "",
        files: [],
      })

      // Revoke all preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      setPreviewUrls([])
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("Error submitting request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">You're offline</h3>
            <p className="text-sm text-yellow-700">
              Your request will be saved locally and submitted when you're back online.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief title of your request"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Request Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Shelter">Shelter</SelectItem>
              <SelectItem value="Evacuation">Evacuation</SelectItem>
              <SelectItem value="Rescue">Rescue</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description of your request"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)} required>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Your current location"
              className="pl-10"
              required
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">Enter address or use current location</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="files">Attach Images or Files</Label>
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Drag and drop files here, or click to select files
            </p>
            <Input id="files" type="file" onChange={handleFileChange} className="hidden" multiple accept="image/*" />
            <Button type="button" variant="outline" onClick={() => document.getElementById("files")?.click()}>
              Select Files
            </Button>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <span className="sr-only">Remove</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : isOffline ? "Save Offline" : "Submit Request"}
        </Button>
      </div>
    </form>
  )
}
