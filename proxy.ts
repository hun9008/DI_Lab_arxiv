import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATH_PREFIXES = ["/auth/signin", "/auth/unauthorized", "/api/auth"]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon.png"
  ) {
    return true
  }

  return /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(pathname)
}

export async function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token) {
    return NextResponse.next()
  }

  const signInUrl = new URL("/auth/signin", request.url)
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
