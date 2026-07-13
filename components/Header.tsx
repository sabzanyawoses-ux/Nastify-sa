"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/browse", label: "Browse Rooms" },
    { href: "/list-property", label: "List Your Property" },
    { href: "/signin", label: "Sign In" },
    { href: "/signup", label: "Create Account" },
  ];

  return (
    <header className="border-b border-panelborder bg-ink sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-5">
        <Link href="/" className="font-display font-800 text-2xl tracking-tight">
          NASTIFY<span className="gold-text">SA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-white/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setOpen(!open)}
        >
          <span className="w-6 h-0.5 bg-white block" />
          <span className="w-6 h-0.5 bg-white block" />
          <span className="w-6 h-0.5 bg-white block" />
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-panelborder px-5 py-4 flex flex-col gap-4 text-white/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-gold">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
