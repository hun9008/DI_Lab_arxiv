import Link from "next/link"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

interface UnauthorizedPageProps {
  searchParams: Promise<{ error?: string }>
}

function getMessage(error?: string) {
  switch (error) {
    case "GoogleSubjectMismatch":
      return "This email is allowlisted, but it was previously linked to a different Google account."
    case "MissingGoogleProfile":
      return "Google did not return the account information needed to verify access."
    case "NotAllowlisted":
    case "AccessDenied":
    default:
      return "This Google account is not in the lab allowlist."
  }
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md border border-border bg-card p-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Access Not Allowed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {getMessage(error)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ask an admin to add your Google email to `google_oauth_allowlist`, then try again.
        </p>
        <div className="mt-6 space-y-3">
          <GoogleSignInButton label="Try another Google account" />
          <Link href="/auth/signin" className="block text-center text-sm text-primary hover:underline">
            Back to sign-in
          </Link>
        </div>
      </div>
    </main>
  )
}
