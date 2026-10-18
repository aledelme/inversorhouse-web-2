import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for panel/admin pages while their request-time content streams in. */
export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
