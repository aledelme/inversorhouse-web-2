"use client";

import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Item = { href: Route; label: string };

export function MobileNav({
  items,
  publish,
  labels,
}: {
  items: Item[];
  publish: Item;
  labels: { menu: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={labels.menu}>
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm">
        <SheetHeader>
          <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
          <Logo />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4" aria-label={labels.menu}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 font-display text-xl text-foreground hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="lg" className="mt-4">
            <Link href={publish.href} onClick={() => setOpen(false)}>
              {publish.label}
            </Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
