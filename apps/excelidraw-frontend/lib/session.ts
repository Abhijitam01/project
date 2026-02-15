"use client"

import { safeStorageGet, safeStorageRemove } from "./storage"

export const hasValidSession = async (): Promise<boolean> => {
  const token = safeStorageGet("token")
  if (!token || !process.env.NEXT_PUBLIC_HTTP_URL) {
    return false
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/user`, {
      method: "GET",
      headers: {
        authorization: token,
      },
    })

    if (!response.ok) {
      safeStorageRemove("token")
      return false
    }

    return true
  } catch {
    return false
  }
}
