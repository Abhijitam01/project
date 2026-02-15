import Link from "next/link"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { Button } from "@repo/ui/button"

const pillars = [
  "Realtime collaboration without refresh",
  "Shapes, freehand, text, and clean exports",
  "Keyboard-first drawing workflow",
]

const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_DEMO !== "false"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0f1115] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-14 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Sketchy
          </Link>
          <div className="flex items-center gap-2">
            {demoEnabled ? (
              <Link href="/demo">
                <Button variant="outline" size="sm">
                  Live demo
                </Button>
              </Link>
            ) : null}
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </header>

        <section className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Minimal canvas. Serious collaboration.
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Draw together in real time with zero friction.
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
                Sketchy is a focused multiplayer whiteboard built for fast idea sharing, clean sessions, and production-ready exports.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button className="gap-2" size="lg">
                    Start drawing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {demoEnabled ? (
                  <Link href="/demo">
                    <Button variant="outline" size="lg">
                      Try live demo
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signin">
                    <Button variant="outline" size="lg">
                      Open dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Core promises</p>
              <ul className="mt-4 space-y-3">
                {pillars.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-0.5 rounded-full bg-white/10 p-1">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <Metric label="Sync latency" value="~Instant" />
          <Metric label="Export formats" value="PNG, SVG, JSON" />
          <Metric label="Input model" value="Mouse, touch, keyboard" />
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-2 text-sm font-medium text-white/90">{value}</p>
    </article>
  )
}
