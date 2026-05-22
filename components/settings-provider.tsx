"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { UserSettings, DEFAULT_SETTINGS } from "@/lib/settings"

interface SettingsContextType {
  settings: UserSettings
  isLoading: boolean
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || DEFAULT_SETTINGS)
      }
    } catch {
      console.error("Erro ao carregar configurações")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      refreshSettings()
    }
  }, [authLoading, refreshSettings])

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })
    } catch {
      console.error("Erro ao salvar configurações")
      // Rollback
      setSettings(settings)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
