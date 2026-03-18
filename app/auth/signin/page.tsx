import { redirect } from "next/navigation"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { getAuthSession } from "@/lib/auth"

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getAuthSession()
  const { callbackUrl } = await searchParams

  if (session) {
    redirect(callbackUrl || "/")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md border border-border bg-card p-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Sign In Required
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sign in with your Google account to access the lab paper archive.
        </p>
        <div className="mt-6">
          <GoogleSignInButton callbackUrl={callbackUrl || "/"} />
        </div>
      </div>
    </main>
  )
}
