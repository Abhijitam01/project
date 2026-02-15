"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { RegisterSchema } from "@repo/common/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import { useState, useTransition } from "react"
import { register } from "@/actions/register"
import { login } from "@/actions/login"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { safeStorageSet } from "@/lib/storage"

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setSubmitError(null)
    startTransition(() =>
      register(values)
        .then(() => {
          return login({
            email: values.email,
            password: values.password,
          })
        })
        .then((res) => {
          if (!safeStorageSet("token", res.token)) {
            throw new Error("Account created, but browser storage is blocked. Please enable storage and sign in.")
          }
          router.replace("/dashboard")
        })
        .catch((err: unknown) => {
          setSubmitError(err instanceof Error ? err.message : "Registration failed")
        })
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#090e17]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <CardHeader className="space-y-2 pb-2">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Sign Up</p>
        <CardTitle className="w-full text-center text-3xl font-black tracking-tight text-white">Create Account</CardTitle>
        <p className="text-center text-sm text-slate-300">Start collaborating with your team today.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="border-white/15 bg-white/[0.06] text-slate-100 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      autoComplete="username"
                      placeholder="John Doe"
                      className="border-white/15 bg-white/[0.06] text-slate-100 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className="border-white/15 bg-white/[0.06] text-slate-100 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{submitError}</p>
            ) : null}

            <Button
              type="submit"
              disabled={isPending}
              className="mt-2 h-11 w-full bg-cyan-500 text-slate-950 transition hover:bg-cyan-400"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
