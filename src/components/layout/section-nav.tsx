"use client";

import { ChevronRightIcon, PanelLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** `icon` is a rendered element (server components cannot pass component functions). */
export type SectionNavItem = { href: Route; label: string; icon: React.ReactNode; exact?: boolean };

type Props = {
  items: SectionNavItem[];
  /** Section name ("Mi panel", "Administración"): nav label, desktop eyebrow and mobile title. */
  title: string;
  /** Extra content under the links (e.g. the admin shortcut in the panel). */
  children?: React.ReactNode;
};

function isActive(pathname: string | null, { href, exact }: SectionNavItem) {
  if (pathname === null) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  title,
  pathname,
  onNavigate,
}: Pick<Props, "items" | "title"> & { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav aria-label={title}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:py-2",
                  active && "bg-card text-foreground shadow-soft ring-1 ring-border",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Below `lg`: a bar showing the current page that opens the section links in a side panel. */
function MobileSectionNav({
  items,
  title,
  children,
  pathname,
}: Props & { pathname: string | null }) {
  // The panel stays open only while the route it was opened on is current, so any
  // navigation from inside it (links or `children`) closes it without an effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const current = pathname ?? "";
  const active = items.find((item) => isActive(pathname, item));

  return (
    <Sheet open={openedAt === current} onOpenChange={(open) => setOpenedAt(open ? current : null)}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-soft transition-colors hover:bg-accent lg:hidden"
        >
          <PanelLeftIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block eyebrow">{title}</span>
            {active && <span className="block truncate text-sm font-medium">{active.label}</span>}
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-xs" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="font-sans eyebrow text-highlight-strong">{title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 overflow-y-auto px-4 pb-6">
          <NavList
            items={items}
            title={title}
            pathname={pathname}
            onNavigate={() => setOpenedAt(null)}
          />
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionNavView(props: Props & { pathname: string | null }) {
  const { items, title, children, pathname } = props;
  return (
    <>
      <MobileSectionNav {...props} />
      <div className="hidden space-y-2 lg:block">
        <p className="px-3 pb-2 eyebrow">{title}</p>
        <NavList items={items} title={title} pathname={pathname} />
        {children}
      </div>
    </>
  );
}

function ActiveSectionNav(props: Props) {
  return <SectionNavView {...props} pathname={usePathname()} />;
}

/**
 * Vertical nav on desktop, collapsible side panel on mobile (panel/admin areas).
 * The pathname is request-time data on dynamic routes, so the active state streams in.
 */
export function SectionNav(props: Props) {
  return (
    <Suspense fallback={<SectionNavView {...props} pathname={null} />}>
      <ActiveSectionNav {...props} />
    </Suspense>
  );
}
