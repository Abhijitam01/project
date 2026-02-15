"use client"

import React from "react"
import Link from "next/link"
import { Github, Chrome, Gem } from "lucide-react"
import { useRouter } from "next/navigation"

import { login, demoLogin } from "@/actions/login"
import { register } from "@/actions/register"
import { safeStorageSet } from "@/lib/storage"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AuthMode = "signin" | "signup"

export default function SignupFormDemo({ mode = "signup" }: { mode?: AuthMode }) {
  const router = useRouter()
  const isSignup = mode === "signup"

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [demoLoading, setDemoLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    if (!email || !password) {
      setSubmitError("Email and password are required")
      return
    }

    if (isSignup && password !== confirmPassword) {
      setSubmitError("Password and confirm password must match")
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const username = [firstName, lastName].join(" ").trim() || email.split("@")[0] || "User"
        await register({
          email,
          password,
          username,
        })
      }

      const res = await login({ email, password })
      if (!safeStorageSet("token", res.token)) {
        throw new Error("Browser storage is blocked. Enable storage access for this site.")
      }
      router.replace("/dashboard")
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : `${isSignup ? "Sign up" : "Sign in"} failed`)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setSubmitError(null)
    setDemoLoading(true)
    try {
      const res = await demoLogin()
      if (!safeStorageSet("token", res.token)) {
        throw new Error("Browser storage is blocked. Enable storage access for this site.")
      }
      router.replace("/dashboard")
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Demo login failed")
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none border border-white/10 bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black/85">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        {isSignup ? "Create your account" : "Welcome back"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        {isSignup ? "Sign up to start collaborative whiteboarding with your team." : "Sign in to continue to your rooms and boards."}
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        {isSignup ? (
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input id="firstname" placeholder="Tyler" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input id="lastname" placeholder="Durden" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </LabelInputContainer>
          </div>
        ) : null}

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="projectmayhem@fc.com" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </LabelInputContainer>

        {isSignup ? (
          <div className="mb-6 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </LabelInputContainer>
          </div>
        ) : (
          <LabelInputContainer className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </LabelInputContainer>
        )}

        {submitError ? <p className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{submitError}</p> : null}

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
          disabled={loading}
        >
          {loading ? `${isSignup ? "Signing up" : "Signing in"}...` : `${isSignup ? "Sign up" : "Sign in"} →`}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
          >
            <Github className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{demoLoading ? "Loading demo..." : "Use Demo Login"}</span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => setSubmitError("Google sign-in is not configured yet")}
          >
            <Chrome className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Google</span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
            onClick={() => setSubmitError("OnlyFans sign-in is not configured yet")}
          >
            <Gem className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">OnlyFans</span>
            <BottomGradient />
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-700 dark:text-neutral-300">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <Link href={isSignup ? "/signin" : "/signup"} className="font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200">
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  )
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
}
