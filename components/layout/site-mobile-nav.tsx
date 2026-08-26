"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { MobileIconButton } from "@/components/layout/mobile-icon-button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/map", label: "Live Map" },
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/signup", label: "Get started" },
];

export function SiteMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <MobileIconButton
        label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </MobileIconButton>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Dismiss menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className="absolute right-0 top-12 z-50 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-2 shadow-lg"
            aria-label="Site"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
}
