import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm rounded-xl" />}>
      <SignIn />
    </Suspense>
  );
}
