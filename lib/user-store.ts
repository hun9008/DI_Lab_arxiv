"use client"

const USER_NAME_KEY = "lab-archive-user-name"

export function getUserName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(USER_NAME_KEY)
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_NAME_KEY, name)
}
