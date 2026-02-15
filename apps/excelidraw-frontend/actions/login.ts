import { LoginSchema } from "@repo/common/types"

import { z } from "zod"

interface LoginResponse {
  token: string
}

export const login = async (values: z.infer<typeof LoginSchema>): Promise<LoginResponse> => {
    if (!process.env.NEXT_PUBLIC_HTTP_URL) {
      throw new Error("Client config missing NEXT_PUBLIC_HTTP_URL")
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values)
    })

    const data = await res.json().catch(() => null) as { token?: string; error?: string; message?: string } | null

    if(res.ok && data?.token){
       return { token: data.token }
    }
   
    throw new Error(data?.error || data?.message || "Unable to sign in")
}

export const demoLogin = async (): Promise<LoginResponse> => {
    if (!process.env.NEXT_PUBLIC_HTTP_URL) {
      throw new Error("Client config missing NEXT_PUBLIC_HTTP_URL")
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/signin/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await res.json().catch(() => null) as { token?: string; error?: string; message?: string } | null

    if (res.ok && data?.token) {
      return { token: data.token }
    }

    throw new Error(data?.error || data?.message || "Demo login failed")
}
