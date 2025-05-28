'use client'

import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { callApi } from '@/lib/api'

export interface AvailabilityUpdate {
  availability: boolean
  location?: { lat: number; lng: number }  // <- allow coords
}

export default function AvailabilityCard() {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  // On mount, fetch current availability:
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { availability } = await callApi<AvailabilityUpdate>(
          'users/me/availability',
          'GET'
        )
        setAvailable(availability)
      } catch (err: any) {
        console.error('Failed to load availability:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  const toggleAvailability = async () => {
    const next = !available
    setLoading(true)
    try {
      // If turning ON availability, ask if they want to update coords
      let payload: AvailabilityUpdate = { availability: next }
      if (next) {
        const updateLoc = window.confirm(
          'You just became available – would you like to update your location now?'
        )
        if (updateLoc) {
          const latStr = window.prompt('Enter your current latitude:')
          const lngStr = window.prompt('Enter your current longitude:')
          const lat = latStr ? parseFloat(latStr) : NaN
          const lng = lngStr ? parseFloat(lngStr) : NaN
          if (!isNaN(lat) && !isNaN(lng)) {
            payload.location = { lat, lng }
          } else {
            alert('Invalid coordinates entered; skipping location update.')
          }
        }
      }

      await callApi<void>(
        'users/me/availability',
        'PATCH',
        payload
      )
      setAvailable(next)
    } catch (err: any) {
      console.error('Availability update failed:', err)
      alert('Could not update availability: ' + (err.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="sm:col-span-2 md:col-span-2 p-6 bg-gray-50">
        <CardContent className="flex justify-center">
          <span>Loading…</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`sm:col-span-2 md:col-span-2 p-6 ${available ? 'bg-green-50' : 'bg-red-50'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">
          {available ? 'You’re Available' : 'You’re Unavailable'}
        </CardTitle>
        <CardDescription>
          {available
            ? 'Let coordinators know you can help'
            : 'You won’t receive new tasks'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          className={`
            ${available
              ? 'border-green-600 text-green-600 hover:bg-green-100'
              : 'border-red-600 text-red-600 hover:bg-red-100'}
          `}
          onClick={toggleAvailability}
          disabled={loading}
        >
          {available ? 'Set Unavailable' : 'Set Available'}
        </Button>
      </CardContent>
    </Card>
  )
}
