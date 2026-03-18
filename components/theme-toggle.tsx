"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex h-9 w-[78px] items-center rounded-full border px-1.5 transition-all duration-300",
        "border-border/80 bg-gradient-to-r from-slate-100 via-white to-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(15,23,42,0.08)]",
        "hover:border-primary/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.12)]",
        "dark:border-white/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.28)]"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-7 w-7 rounded-full transition-all duration-300",
          "bg-gradient-to-b from-white to-slate-200 shadow-[0_6px_14px_rgba(15,23,42,0.18)]",
          "dark:from-slate-700 dark:to-slate-900 dark:shadow-[0_6px_16px_rgba(0,0,0,0.36)]",
          isDark ? "translate-x-[38px]" : "translate-x-0"
        )}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-1 text-muted-foreground">
        <Sun
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            !isDark ? "text-amber-500" : "text-slate-500"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isDark ? "text-sky-300" : "text-slate-400"
          )}
        />
      </span>
    </button>
  )
}
