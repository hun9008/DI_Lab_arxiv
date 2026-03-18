import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      displayName?: string | null
      googleSub?: string | null
    }
  }

  interface User {
    displayName?: string | null
    googleSub?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    displayName?: string | null
    googleSub?: string | null
  }
}
