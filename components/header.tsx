"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  currentGroupName?: string
}

export function Header({ currentGroupName }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const displayName = session?.user?.displayName || session?.user?.name || session?.user?.email

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="group">
              <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">
                DI Lab Paper Archive
              </h1>
            </Link>
            {currentGroupName && (
              <span className="text-lg font-serif text-muted-foreground">
                / {currentGroupName}
              </span>
            )}
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/submit"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-md px-4 shadow-none",
                pathname === "/submit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Submit
            </Link>
            {currentGroupName && (
              <Link
                href="/"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Out Group
              </Link>
            )}
            {displayName && (
              <>
                <a
                  href="https://sites.google.com/view/unist-dilab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  {displayName}
                </a>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Sign out
                </button>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
        <div className="border-t border-border py-2 text-xs text-muted-foreground">
          {currentGroupName
            ? `Browse papers collected in ${currentGroupName}`
            : "Search and browse research papers shared by lab members"}
        </div>
      </div>
    </header>
  )
}
