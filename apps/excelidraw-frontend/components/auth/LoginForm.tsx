"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoginSchema } from "@repo/common/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import { useState, useTransition } from "react"
import { demoLogin, login } from "@/actions/login"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { safeStorageSet } from "@/lib/storage"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isDemoPending, setIsDemoPending] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setSubmitError(null)
    startTransition(() =>
      login(values)
        .then((res) => {
          if (!safeStorageSet("token", res.token)) {
            throw new Error("Browser storage is blocked. Enable storage access for this site.")
          }
          router.replace("/dashboard")
        })
        .catch((err: unknown) => {
          setSubmitError(err instanceof Error ? err.message : "Login failed")
        })
    )
  }

  const onDemoLogin = async () => {
    setSubmitError(null)
    setIsDemoPending(true)
    try {
      const res = await demoLogin()
      if (!safeStorageSet("token", res.token)) {
        throw new Error("Browser storage is blocked. Enable storage access for this site.")
      }
      router.replace("/dashboard")
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Demo login failed")
    } finally {
      setIsDemoPending(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#090e17]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <CardHeader className="space-y-2 pb-2">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Sign In</p>
        <CardTitle className="w-full text-center text-3xl font-black tracking-tight text-white">Welcome Back</CardTitle>
        <p className="text-center text-sm text-slate-300">Continue to your rooms and team boards.</p>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
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
              className="mt-2 h-11 w-full bg-blue-500 text-white transition hover:bg-blue-400"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-white/20 bg-transparent text-slate-100 hover:bg-white/[0.06]"
            disabled={isPending || isDemoPending}
            onClick={() => void onDemoLogin()}
          >
            {isDemoPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDemoPending ? "Signing In to Demo..." : "Use Demo Login"}
          </Button>
          <p className="text-center text-xs text-slate-400">Demo account is provisioned automatically for development.</p>
        </div>

        <p className="text-center text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-300 hover:text-blue-200 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
