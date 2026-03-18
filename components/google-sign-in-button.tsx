"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface GoogleSignInButtonProps {
  callbackUrl?: string
  label?: string
}

export function GoogleSignInButton({
  callbackUrl = "/",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl }, { prompt: "select_account" })
    setIsLoading(false)
  }

  return (
    <Button type="button" onClick={handleSignIn} disabled={isLoading} className="w-full">
      {isLoading ? "Redirecting..." : label}
    </Button>
  )
}
