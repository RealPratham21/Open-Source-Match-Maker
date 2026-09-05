'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

const SavedContext = createContext<{
  saved: number[]
  toggle: (id: number) => void
} | null>(null)

export function SavedStateProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<number[]>([])
  const toggle = (id: number) => setSaved((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  return <SavedContext.Provider value={{ saved, toggle }}>{children}</SavedContext.Provider>
}

export function useSavedIssues() {
  const value = useContext(SavedContext)
  if (!value) throw new Error('useSavedIssues must be used within SavedStateProvider')
  return value
}
