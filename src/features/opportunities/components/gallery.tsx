"use client";

import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { ImagePlaceholder } from "./image-placeholder";

type GalleryImage = { id: string; url: string };

export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const t = useTranslations("opportunity");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl">
        <ImagePlaceholder />
      </div>
    );
  }

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);
  const [first, ...rest] = images;

  return (
    <>
      <div className={cn("grid gap-2", rest.length > 0 && "md:grid-cols-[2fr_1fr]")}>
        <button
          type="button"
          onClick={() => show(0)}
          className="group relative aspect-16/10 overflow-hidden rounded-2xl bg-muted"
          aria-label={t("photoAlt", { index: 1, title })}
        >
          <Image
            src={first!.url}
            alt={t("photoAlt", { index: 1, title })}
            fill
            preload
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
            <ExpandIcon className="size-3.5" />
            {images.length}
          </span>
        </button>
        {rest.length > 0 && (
          <div className={cn("hidden gap-2 md:grid", rest.length > 1 && "grid-rows-2")}>
            {rest.slice(0, 2).map((image, i) => (
              <button
                key={image.id}
                type="button"
                onClick={() => show(i + 1)}
                className="relative overflow-hidden rounded-2xl bg-muted"
                aria-label={t("photoAlt", { index: i + 2, title })}
              >
                <Image
                  src={image.url}
                  alt={t("photoAlt", { index: i + 2, title })}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-1rem)] border-none bg-black/95 p-2 text-white sm:max-w-5xl">
          <DialogTitle className="sr-only">{t("gallery")}</DialogTitle>
          <div className="relative aspect-3/2 w-full">
            <Image
              src={images[index]!.url}
              alt={t("photoAlt", { index: index + 1, title })}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-between px-2 pb-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => go(-1)}
                className="text-white hover:bg-white/10 hover:text-white"
                aria-label="‹"
              >
                <ChevronLeftIcon />
              </Button>
              <span className="text-sm text-white/70">
                {index + 1} / {images.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => go(1)}
                className="text-white hover:bg-white/10 hover:text-white"
                aria-label="›"
              >
                <ChevronRightIcon />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
