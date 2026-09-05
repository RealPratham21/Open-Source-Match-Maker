'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Recommendation } from '@/lib/mock-data'
import type { CandidateIssue } from '@/lib/github/types'

const STORAGE_KEY = 'contribmatch.discovery'

type DiscoveryState = {
  recommendations: Recommendation[]
  candidates: CandidateIssue[]
  loading: boolean
  stage: string
  error: string | null
  run: (force?: boolean) => Promise<void>
}

const DiscoveryContext = createContext<DiscoveryState | null>(null)

const STAGES = [
  'Finding active repositories…',
  'Searching open issues…',
  'Checking project setup…',
  'Preparing candidates…',
]

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [candidates, setCandidates] = useState<CandidateIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(STAGES[0])
  const [error, setError] = useState<string | null>(null)
  const inflight = useRef(false)

  const run = useCallback(async (force = false) => {
    if (inflight.current) return

    if (!force) {
      const cached = readCache()
      if (cached) {
        setRecommendations(cached.recommendations)
        setCandidates(cached.candidates)
        return
      }
    }

    inflight.current = true
    setLoading(true)
    setError(null)
    setStage(STAGES[0])
    const timer = window.setInterval(() => {
      setStage((current) => {
        const index = STAGES.indexOf(current)
        return STAGES[Math.min(index + 1, STAGES.length - 1)]
      })
    }, 3500)

    try {
      const response = await fetch('/api/discover', { method: 'POST' })
      const payload = (await response.json()) as {
        error?: string
        recommendations?: Recommendation[]
        candidates?: CandidateIssue[]
      }
      if (!response.ok) {
        throw new Error(payload.error ?? 'Discovery failed. Please try again.')
      }
      const nextRecommendations = payload.recommendations ?? []
      const nextCandidates = payload.candidates ?? []
      setRecommendations(nextRecommendations)
      setCandidates(nextCandidates)
      writeCache({ recommendations: nextRecommendations, candidates: nextCandidates })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed. Please try again.')
      setRecommendations([])
      setCandidates([])
    } finally {
      inflight.current = false
      window.clearInterval(timer)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setRecommendations(cached.recommendations)
      setCandidates(cached.candidates)
    }
  }, [])

  return (
    <DiscoveryContext.Provider value={{ recommendations, candidates, loading, stage, error, run }}>
      {children}
    </DiscoveryContext.Provider>
  )
}

export function useDiscovery() {
  const value = useContext(DiscoveryContext)
  if (!value) throw new Error('useDiscovery must be used within DiscoveryProvider')
  return value
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { recommendations: Recommendation[]; candidates: CandidateIssue[] }
  } catch {
    return null
  }
}

function writeCache(value: { recommendations: Recommendation[]; candidates: CandidateIssue[] }) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore quota errors.
  }
}
