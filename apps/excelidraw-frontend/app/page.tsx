import Link from "next/link"
import { ArrowRight } from "lucide-react"

const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_DEMO !== "false"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#12151e] text-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5">
        <span className="text-base font-semibold tracking-tight">Sketchy</span>
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="rounded-lg px-3.5 py-1.5 text-sm text-white/60 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Draw together,
          <br />
          <span className="text-white/50">in real time.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/55">
          Sketchy is a minimal multiplayer whiteboard for fast idea sharing and clean collaboration.
          No bloat, just your canvas.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Start drawing
            <ArrowRight className="h-4 w-4" />
          </Link>
          {demoEnabled ? (
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Try live demo
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Open dashboard
            </Link>
          )}
        </div>

        {/* Canvas mockup */}
        <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1e1e2e] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          {/* Toolbar mockup */}
          <div className="flex items-center justify-center border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#12151e] px-2 py-1.5">
              {["V", "H", "R", "O", "A", "L", "P", "T", "E"].map((key) => (
                <div
                  key={key}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-medium text-white/30"
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
          {/* Canvas area */}
          <div className="relative h-72">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 640 288"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
            >
              {/* Rectangle */}
              <rect
                x="60"
                y="60"
                width="160"
                height="100"
                rx="4"
                stroke="rgba(98,177,247,0.6)"
                strokeWidth="1.5"
                fill="rgba(30,70,101,0.3)"
              />
              {/* Ellipse */}
              <ellipse
                cx="380"
                cy="110"
                rx="80"
                ry="55"
                stroke="rgba(242,154,158,0.6)"
                strokeWidth="1.5"
                fill="rgba(89,49,49,0.3)"
              />
              {/* Arrow */}
              <line
                x1="230"
                y1="110"
                x2="295"
                y2="110"
                stroke="rgba(211,211,211,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M288 104 L297 110 L288 116"
                stroke="rgba(211,211,211,0.4)"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Diamond */}
              <path
                d="M490 180 L530 210 L490 240 L450 210 Z"
                stroke="rgba(77,161,83,0.6)"
                strokeWidth="1.5"
                fill="rgba(23,61,16,0.3)"
              />
              {/* Pencil lines */}
              <path
                d="M80 200 C100 190, 120 210, 140 195 S170 185, 190 200"
                stroke="rgba(183,98,42,0.5)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Text hint */}
              <text x="60" y="240" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="system-ui">
                Your ideas here
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-5 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Sketchy — multiplayer drawing for teams
      </footer>
    </main>
  )
}
