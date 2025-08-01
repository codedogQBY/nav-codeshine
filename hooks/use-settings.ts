"use client"

import { useState, useEffect } from "react"
import type { Settings } from "@/types"

const defaultSettings: Settings = {
  theme: "system",
  viewMode: "grid",
  enableAnimations: true,
  autoExtractInfo: true,
  enableSmartCategory: true,
  trackVisits: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem("smart-nav-settings")
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
    }
  }, [])

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem("smart-nav-settings", JSON.stringify(settings))
  }, [settings])

  // 应用主题
  useEffect(() => {
    const root = window.document.documentElement

    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", settings.theme === "dark")
    }
  }, [settings.theme])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return {
    settings,
    updateSettings,
  }
}
