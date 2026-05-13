'use client'
import { useEffect } from 'react'

export default function ThemeProvider({ theme, children }: { theme: string; children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }, [theme])

  return <>{children}</>
}