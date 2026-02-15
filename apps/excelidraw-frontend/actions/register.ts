import { RegisterSchema } from "@repo/common/types"
import {z} from "zod"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    if (!process.env.NEXT_PUBLIC_HTTP_URL) {
      throw new Error("Client config missing NEXT_PUBLIC_HTTP_URL")
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
    })

    const data = await res.json().catch(() => null) as { error?: string; message?: string } | null

    if (res.ok) {
        return data
    }

    throw new Error(data?.error || data?.message || "Unable to sign up")
}
