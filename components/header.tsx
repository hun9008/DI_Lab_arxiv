"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="group">
            <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">
              Lab Paper Archive
            </h1>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              Browse
            </Link>
            <Link
              href="/submit"
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/submit" ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              Submit
            </Link>
          </nav>
        </div>
        <div className="border-t border-border py-2 text-xs text-muted-foreground">
          Search and browse research papers shared by lab members
        </div>
      </div>
    </header>
  )
}
