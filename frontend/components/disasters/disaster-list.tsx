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

// shape returned by GET /disasters/{id}/joined
interface JoinedResponse {
  joined: boolean
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
      console.groupCollapsed(`[Disasters] Loading started at ${new Date().toISOString()}`)
      try {
        // 1) Load all disasters
        console.log("Calling GET /api/disasters…")
        const data = await callApi<Disaster[]>("disasters")
        console.log("Received data:", data)
        console.table(data)
        setDisasters(data)

        // 2) For each disaster, check if already joined
        const joinedSet = new Set<string>()
        await Promise.all(
          data.map(async (d) => {
            try {
              const res = await callApi<JoinedResponse>(`disasters/${d.id}/joined`)
              if (res.joined) {
                joinedSet.add(d.id)
              }
            } catch {
              // on 404 or error, treat as not-joined; ignore
            }
          })
        )
        setJoinedIds(joinedSet)
      } catch (err: any) {
        console.error("Error loading disasters:", err)
        console.error(err.stack)
        setError(err.message)
      } finally {
        console.log(`Finished loading at ${new Date().toISOString()}`)
        console.groupEnd()
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

  const handleLeave = async (disasterId: string) => {
    try {
      // DELETE /api/disasters/{id}/leave
      await callApi<void>(`disasters/${disasterId}/leave`, "DELETE")
      setJoinedIds(prev => {
        const next = new Set(prev)
        next.delete(disasterId)
        return next
      })
    } catch (e: any) {
      console.error("Leave error:", e)
      alert("Could not leave: " + e.message)
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
        const hasImage = d.image_urls.length > 0
        const imgSrc = hasImage ? d.image_urls[0] : "/placeholder.svg?height=300&width=600"

        return (
          <Card key={d.id} className="transition-shadow hover:shadow-lg overflow-hidden">
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgSrc}')` }}
            >
              <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{d.name}</h3>
                </div>
              </div>
            </div>

            <CardContent>
              <CardDescription className="mt-2">{d.description}</CardDescription>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
              {isJoined ? (
                <Dialog
                  open={activeDialogId === d.id}
                  onOpenChange={open => setActiveDialogId(open ? d.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setActiveDialogId(d.id)}>
                      Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Leave</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to leave this incident?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setActiveDialogId(null)}>
                        No
                      </Button>
                      <Button variant="destructive" onClick={() => handleLeave(d.id)}>
                        Yes, Leave
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog
                  open={activeDialogId === d.id}
                  onOpenChange={open => setActiveDialogId(open ? d.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setActiveDialogId(d.id)}>Join</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Association</DialogTitle>
                      <DialogDescription>
                        Are you associated with this incident?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setActiveDialogId(null)}>
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
