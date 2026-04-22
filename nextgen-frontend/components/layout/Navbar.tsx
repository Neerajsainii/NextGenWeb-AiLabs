"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

const links = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" }
];

export function Navbar() {
  return (
    <header className="fixed left-0 top-4 z-40 w-full px-4 sm:px-8">
      <GlassCard className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-sm font-semibold tracking-wider sm:text-base">
          NextGen Web & AI Labs
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-textSecondary sm:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-accentCyan">
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full border border-cyan-300/40 px-4 py-1.5 text-xs font-semibold text-textPrimary transition hover:shadow-glow sm:text-sm"
        >
          Let's Talk
        </Link>
      </GlassCard>
    </header>
  );
}
