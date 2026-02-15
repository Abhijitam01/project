import Link from "next/link"
import { ArrowRight, Check, Clock3, Download, Keyboard, ShieldCheck, Sparkles, Users2 } from "lucide-react"
import { Button } from "@repo/ui/button"

const pillars = [
  "Realtime collaboration without refresh",
  "Shapes, freehand, text, and clean exports",
  "Keyboard-first drawing workflow",
]

const features = [
  {
    title: "Realtime Rooms",
    description: "Collaborate with your team live in the same canvas with instant sync.",
    icon: Users2,
  },
  {
    title: "Fast Performance",
    description: "Low-latency interactions built for quick sketching and iteration.",
    icon: Clock3,
  },
  {
    title: "Privacy Controls",
    description: "Run private rooms and invite only who should join.",
    icon: ShieldCheck,
  },
  {
    title: "Export Ready",
    description: "Save your work in practical formats for docs and handoff.",
    icon: Download,
  },
]

const steps = [
  {
    title: "Create a room",
    description: "Start from dashboard in seconds and name your session.",
  },
  {
    title: "Invite collaborators",
    description: "Share the room link and work on the same board instantly.",
  },
  {
    title: "Sketch, iterate, export",
    description: "Use tools quickly, refine ideas, and export outcomes cleanly.",
  },
]

const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_DEMO !== "false"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0f1115] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30 mb-8 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur sm:px-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Sketchy
            </Link>

            <nav className="hidden items-center justify-center gap-8 text-sm text-white/70 md:flex">
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#workflow" className="transition hover:text-white">
                Workflow
              </a>
              <a href="#footer" className="transition hover:text-white">
                Contact
              </a>
            </nav>

            <div className="flex items-center justify-end gap-2">
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
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 sm:p-12">
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

        <section id="features" className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
              <Keyboard className="h-4 w-4" />
              Features
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Everything you need for focused collaboration</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              The core toolkit is designed to keep your team in flow from ideation to final handoff.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="mb-3 inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-2">
                    <Icon className="h-4 w-4 text-cyan-200" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="workflow" className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">From blank canvas to aligned decisions</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Follow a simple three-step process to move quickly while keeping work structured.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">Step {index + 1}</p>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/65">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <footer id="footer" className="mt-12 rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="text-lg font-semibold">Sketchy</p>
              <p className="mt-3 max-w-md text-sm text-white/65">
                Multiplayer whiteboarding for teams that need speed, clarity, and reliable collaboration.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/signup" className="transition hover:text-white">
                    Get started
                  </Link>
                </li>
                <li>
                  <Link href="/signin" className="transition hover:text-white">
                    Dashboard access
                  </Link>
                </li>
                {demoEnabled ? (
                  <li>
                    <Link href="/demo" className="transition hover:text-white">
                      Live demo
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Navigation</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>
                  <a href="#features" className="transition hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="transition hover:text-white">
                    Workflow
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Back to top
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/45">
            © {new Date().getFullYear()} Sketchy. Built for collaborative drawing.
          </div>
        </footer>
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
