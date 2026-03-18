import { getServerSession, type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getGoogleOAuthCredentials } from "@/lib/google-oauth"
import {
  getAllowedGoogleUserByEmail,
  updateAllowedGoogleUserSub,
} from "@/lib/google-oauth-allowlist"

type GoogleProfile = {
  sub?: string
  email?: string
  name?: string
  picture?: string
}

type AuthUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  displayName?: string | null
  googleSub?: string | null
}

const { clientId, clientSecret } = getGoogleOAuthCredentials()

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/unauthorized",
  },
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return false
      }

      const googleProfile = profile as GoogleProfile | undefined
      const email = googleProfile?.email ?? user.email
      const googleSub = googleProfile?.sub

      if (!email || !googleSub) {
        return "/auth/unauthorized?error=MissingGoogleProfile"
      }

      const allowedUser = await getAllowedGoogleUserByEmail(email)
      if (!allowedUser) {
        return "/auth/unauthorized?error=NotAllowlisted"
      }

      if (allowedUser.googleSub && allowedUser.googleSub !== googleSub) {
        return "/auth/unauthorized?error=GoogleSubjectMismatch"
      }

      if (!allowedUser.googleSub) {
        await updateAllowedGoogleUserSub(allowedUser.id, googleSub)
      }

      const authUser = user as AuthUser
      authUser.displayName = allowedUser.displayName ?? user.name ?? email
      authUser.name = authUser.displayName
      authUser.email = allowedUser.email
      authUser.googleSub = googleSub

      return true
    },
    async jwt({ token, user }) {
      const authUser = user as AuthUser | undefined

      if (authUser) {
        token.name = authUser.displayName ?? authUser.name ?? token.name
        token.email = authUser.email ?? token.email
        token.picture = authUser.image ?? token.picture
        token.displayName = authUser.displayName ?? authUser.name ?? null
        token.googleSub = authUser.googleSub ?? null
      }

      return token
    },
    async session({ session, token }) {
      session.user.name = token.displayName ?? token.name ?? null
      session.user.email = token.email ?? null
      session.user.image = token.picture ?? null
      session.user.displayName = token.displayName ?? null
      session.user.googleSub = token.googleSub ?? null
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
}

export function getAuthSession() {
  return getServerSession(authOptions)
}
