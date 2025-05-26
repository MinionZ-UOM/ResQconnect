'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AvailabilityToggle() {
  const [available, setAvailable] = useState(false)

  return (
    <Button
      variant="outline"
      onClick={() => setAvailable(!available)}
    >
      {available ? 'Available' : 'Not Available'}
    </Button>
  )
}
