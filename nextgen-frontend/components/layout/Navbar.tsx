"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

const links = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" }
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-0 top-4 z-40 w-full px-4 sm:px-8">
      <GlassCard className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-xs font-semibold tracking-wide sm:text-base">
            NextGen Web & AI Labs
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-textPrimary sm:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden items-center gap-6 text-sm text-textSecondary sm:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-accentCyan">
                {link.label}
              </a>
            ))}
          </nav>
          <Link
            href="/contact"
            className="hidden rounded-full border border-cyan-300/40 px-4 py-1.5 text-xs font-semibold text-textPrimary transition hover:shadow-glow sm:block sm:text-sm"
          >
            Let's Talk
          </Link>
        </div>

        {isOpen ? (
          <nav className="mt-3 grid gap-2 border-t border-white/10 pt-3 sm:hidden">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-textSecondary transition hover:bg-white/5 hover:text-accentCyan"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-1 rounded-md border border-cyan-300/40 px-3 py-2 text-center text-sm font-semibold text-textPrimary"
            >
              Let&apos;s Talk
            </Link>
          </nav>
        ) : null}
      </GlassCard>
    </header>
  );
}
