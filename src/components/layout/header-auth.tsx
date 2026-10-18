"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/navigation";

/**
 * Client-side so the header stays in the static shell (no request-time
 * session read in the layout — see docs/architecture.md).
 */
export function HeaderAuth({
  signInLabel,
  panelLabel,
}: {
  signInLabel: string;
  panelLabel: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <Skeleton className="size-8 rounded-full" />;

  if (!isSignedIn) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href={routes.signIn}>{signInLabel}</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href={routes.panel}>{panelLabel}</Link>
      </Button>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label={panelLabel}
            labelIcon={<LayoutDashboardIcon className="size-4" />}
            href={routes.panel}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
