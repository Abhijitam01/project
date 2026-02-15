"use client"

import SignupFormDemo from "@/components/signup-form-demo"
import Link from "next/link"

const SignUpPage = () => {
  return (
    <main className="min-h-screen bg-[#0f1115] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-14 pt-6 sm:px-8 lg:px-10">
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 grid min-h-[72vh] w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Sketchy Workspace</p>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Collaborate on your canvas in real time.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-white/70">
                Create rooms, invite your team, and turn ideas into clear visual workflows without friction.
              </p>

              <div className="grid max-w-xl gap-3 text-sm text-white/75 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">Live multiplayer whiteboarding</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">Private rooms with invite links</div>
              </div>

              <Link href="/" className="inline-flex text-sm font-medium text-cyan-200 transition-colors hover:text-cyan-100 hover:underline">
                Back to landing page
              </Link>
            </section>

            <div className="w-full">
              <SignupFormDemo mode="signup" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SignUpPage
