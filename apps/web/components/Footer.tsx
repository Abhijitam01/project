"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 md:py-20">
      <div className="container grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-sm">
              D
            </div>
            <span>Drawr</span>
          </Link>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            The simplest way to collaborate in real-time. Visualize your ideas together.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link></li>
            <li><Link href="#about" className="hover:text-[var(--foreground)] transition-colors">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Community</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-[var(--foreground)] transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)] text-center">
        <p>&copy; {new Date().getFullYear()} Drawr Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
