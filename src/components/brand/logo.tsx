import Image from "next/image";
import Link from "next/link";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = { onDark?: boolean; className?: string; priority?: boolean };

/** Isotipo + wordmark, linking home. `onDark` uses the white artwork. */
export function Logo({ onDark = false, className, priority = false }: Props) {
  const { logo } = brand;
  return (
    <Link
      href="/"
      aria-label={brand.name}
      className={cn("group inline-flex items-center gap-2.5 rounded-md", className)}
    >
      <Image
        src={onDark ? logo.markOnDark : logo.mark}
        alt=""
        width={logo.markSize.width}
        height={logo.markSize.height}
        className="h-8 w-auto transition-transform duration-300 group-hover:-translate-y-0.5"
        preload={priority}
      />
      <Image
        src={onDark ? logo.wordmarkOnDark : logo.wordmark}
        alt=""
        width={logo.wordmarkSize.width}
        height={logo.wordmarkSize.height}
        className="h-3.5 w-auto"
        preload={priority}
      />
    </Link>
  );
}
