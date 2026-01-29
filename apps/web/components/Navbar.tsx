"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="glass fixed top-0 w-full z-50 border-b border-[var(--border)]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white">
              D
            </div>
            <span>Drawr</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--muted)]">
            <Link href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link>
            <Link href="#about" className="hover:text-[var(--foreground)] transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
