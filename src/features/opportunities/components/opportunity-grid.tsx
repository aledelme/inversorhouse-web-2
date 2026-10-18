import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { OpportunitySummary } from "../types";

import { OpportunityCard } from "./opportunity-card";

export function OpportunityGrid({
  items,
  className,
  preloadFirst = false,
}: {
  items: OpportunitySummary[];
  className?: string;
  preloadFirst?: boolean;
}) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, index) => (
        <OpportunityCard key={item.id} opportunity={item} preload={preloadFirst && index === 0} />
      ))}
    </div>
  );
}

export function OpportunityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
