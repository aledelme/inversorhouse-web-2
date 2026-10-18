"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImagePlusIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { publicObjectUrl } from "@/lib/storage/public-url";
import { cn } from "@/lib/utils";

import { type UploadedImage, UploadError, uploadImage } from "../client/upload";
import { UPLOAD_RULES } from "../rules";

type Props = {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  invalid?: boolean;
  /** Reports uploads starting (+n) and finishing (-1) so forms can block submission. */
  onBusyChange?: (delta: number) => void;
};

/** Photo picker: compresses + uploads directly to R2, reorder, first photo = cover. */
export function ImageUploader({ value, onChange, invalid, onBusyChange }: Props) {
  const t = useTranslations("uploads");
  const tErrors = useTranslations("errors");
  const inputId = useId();
  const [pending, setPending] = useState(0);
  const max = UPLOAD_RULES.image.maxFiles;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, max - value.length);
    setPending((n) => n + selected.length);
    onBusyChange?.(selected.length);
    let current = value;
    for (const file of selected) {
      try {
        const uploaded = await uploadImage(file);
        current = [...current, uploaded];
        onChange(current);
      } catch (error) {
        const code = error instanceof UploadError ? error.code : "uploadFailed";
        toast.error(
          `${file.name}: ${tErrors.has(code as never) ? tErrors(code as never) : tErrors("uploadFailed")}`,
        );
      } finally {
        setPending((n) => n - 1);
        onBusyChange?.(-1);
      }
    }
  };

  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((image, index) => (
          <li
            key={image.key}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={publicObjectUrl(image.key)}
              alt={t("photoAlt", { index: index + 1 })}
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
            {index === 0 && (
              <span className="absolute top-2 left-2 rounded-full bg-highlight px-2 py-0.5 text-[10px] font-semibold tracking-wide text-highlight-foreground uppercase">
                {t("cover")}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-linear-to-t from-black/60 to-transparent p-1.5">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={t("moveLeft")}
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={t("moveRight")}
                >
                  <ArrowRightIcon />
                </Button>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={t("remove")}
              >
                <Trash2Icon />
              </Button>
            </div>
          </li>
        ))}
        {Array.from({ length: pending }, (_, i) => (
          <li
            key={`pending-${i}`}
            className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed bg-muted"
          >
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </li>
        ))}
        {value.length + pending < max && (
          <li>
            <label
              htmlFor={inputId}
              className={cn(
                "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
                invalid && "border-destructive",
              )}
            >
              <ImagePlusIcon className="size-6" />
              {t("addPhotos")}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </li>
        )}
      </ul>
      <p className="text-xs text-muted-foreground">{t("photosHint", { max })}</p>
    </div>
  );
}
