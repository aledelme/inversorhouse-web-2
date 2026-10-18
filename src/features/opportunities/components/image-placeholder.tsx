import Image from "next/image";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Branded fallback when an opportunity has no photos. */
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary to-inverse",
        className,
      )}
    >
      <Image
        src={brand.logo.markOnDark}
        alt=""
        width={brand.logo.markSize.width}
        height={brand.logo.markSize.height}
        className="w-1/4 opacity-15"
      />
    </div>
  );
}
