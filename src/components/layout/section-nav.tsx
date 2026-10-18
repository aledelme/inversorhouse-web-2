"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

/** `icon` is a rendered element (server components cannot pass component functions). */
export type SectionNavItem = { href: Route; label: string; icon: React.ReactNode; exact?: boolean };

type Props = { items: SectionNavItem[]; label: string };

function NavList({ items, label, pathname }: Props & { pathname: string | null }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ href, label: text, icon, exact }) => {
          const active =
            pathname !== null &&
            (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-card text-foreground shadow-soft ring-1 ring-border",
                )}
              >
                {icon}
                {text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ActiveNavList(props: Props) {
  return <NavList {...props} pathname={usePathname()} />;
}

/**
 * Vertical nav on desktop, horizontal scroller on mobile (panel/admin areas).
 * The pathname is request-time data on dynamic routes, so the active state streams in.
 */
export function SectionNav(props: Props) {
  return (
    <Suspense fallback={<NavList {...props} pathname={null} />}>
      <ActiveNavList {...props} />
    </Suspense>
  );
}
