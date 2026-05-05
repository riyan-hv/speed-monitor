'use client'

import { useEffect, useState } from 'react'

export default function LocalTime({ utc }: { utc: string }) {
  const [display, setDisplay] = useState<string | null>(null)
  useEffect(() => {
    setDisplay(new Date(utc).toLocaleString())
  }, [utc])
  // Render raw UTC until client hydrates — avoids hydration mismatch
  return <>{display ?? utc}</>
}
