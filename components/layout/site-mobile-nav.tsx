"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useState } from "react";

import { ClientPortal } from "@/components/layout/client-portal";
import { MobileIconButton } from "@/components/layout/mobile-icon-button";
import {
  MOBILE_LAYER_TOP,
  useOpenLayer,
} from "@/components/layout/use-open-layer";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/map", label: "Live Map" },
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/signup", label: "Get started" },
];

export function SiteMobileNav() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useOpenLayer(open, close);

  return (
    <div className="relative md:hidden">
      <MobileIconButton
        label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </MobileIconButton>

      {open ? (
        <>
          <ClientPortal>
            <button
              type="button"
              className={`fixed inset-x-0 bottom-0 z-40 bg-black/40 md:hidden ${MOBILE_LAYER_TOP}`}
              data-tap="none"
              aria-label="Dismiss menu"
              onClick={close}
            />
          </ClientPortal>
          <nav
            id="site-mobile-nav"
            className="absolute right-0 top-full z-50 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-2 shadow-lg"
            aria-label="Site"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm touch-manipulation hover:bg-muted"
                onClick={close}
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
