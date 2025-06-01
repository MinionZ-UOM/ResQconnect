// File: /components/disasters/DisasterDetailModal.tsx
"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export interface Disaster {
  id: string
  name: string
  description: string
  location: { lat: number; lng: number }
  image_urls: string[]
  created_at: string
  created_by: string
  chat_session_id: string
}

interface DisasterDetailModalProps {
  disaster: Disaster | null
  onClose: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DisasterDetailModal({
  disaster,
  onClose,
  open,
  onOpenChange,
}: DisasterDetailModalProps) {
  if (!disaster) return null

  const startedDate = new Date(disaster.created_at).toLocaleDateString()

  const imgSrc = disaster.image_urls.length
    ? disaster.image_urls[0]
    : "/placeholder.svg?height=300&width=600"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Card className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>

          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url('${imgSrc}')` }}
          >
            <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div>
                <h3 className="text-xl font-bold text-white">{disaster.name}</h3>
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>{disaster.name}</span>
            </CardTitle>
            <CardDescription>
              Created on: <strong>{startedDate}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-600">Description:</h3>
              <p className="text-gray-800">{disaster.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-600">Location:</h3>
              <p className="text-gray-800">
                Lat: {disaster.location.lat}, Lng: {disaster.location.lng}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-600">Created By:</h3>
              <p className="text-gray-800">{disaster.created_by}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-600">Chat Session ID:</h3>
              <p className="text-gray-800">{disaster.chat_session_id}</p>
            </div>
          </CardContent>

          <div className="flex justify-end px-6 pb-4">
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              Close
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
