// frontend/components/disasters/DisasterList.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { callApi } from "@/lib/api"

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

interface DisasterListProps {
  role: string // e.g. "first-responder"
}

export function DisasterList({ role }: DisasterListProps) {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDialogId, setActiveDialogId] = useState<string | null>(null)
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())

  // Convert slug → API role: "first-responder" → "first_responder"
  const apiRole = role.replace("-", "_")

  useEffect(() => {
    async function load() {
      try {
        // GET /api/disasters
        const data = await callApi<Disaster[]>("disasters")
        setDisasters(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleJoin = async (disasterId: string) => {
    try {
      // POST /api/disasters/{id}/join
      const updated = await callApi<Disaster>(
        `disasters/${disasterId}/join`,
        "POST",
        { role: apiRole }
      )
      setJoinedIds(prev => new Set(prev).add(disasterId))
      setDisasters(ds => ds.map(d => (d.id === disasterId ? updated : d)))
    } catch (e: any) {
      console.error("Join error:", e)
      alert("Could not join: " + e.message)
    } finally {
      setActiveDialogId(null)
    }
  }

  if (loading) return <p>Loading disasters…</p>
  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {disasters.map(d => {
        const isJoined = joinedIds.has(d.id)
        return (
          <Card key={d.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle>{d.name}</CardTitle>
            </CardHeader>

            <CardContent>
              <CardDescription>{d.description}</CardDescription>
              {d.image_urls.length > 0 && (
                <img
                  src={d.image_urls[0]}
                  alt={d.name}
                  className="mt-4 w-full h-32 object-cover rounded"
                />
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
              {isJoined ? (
                <Button disabled>Joined</Button>
              ) : (
                <Dialog
                  open={activeDialogId === d.id}
                  onOpenChange={open =>
                    setActiveDialogId(open ? d.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setActiveDialogId(d.id)}>
                      Join
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Association</DialogTitle>
                      <DialogDescription>
                        Are you associated with this incident?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setActiveDialogId(null)}
                      >
                        No
                      </Button>
                      <Button onClick={() => handleJoin(d.id)}>Yes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
