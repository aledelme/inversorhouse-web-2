"use client";

import { FileTextIcon, Loader2Icon, PaperclipIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { type UploadedDocument, uploadDocument, UploadError } from "../client/upload";
import { UPLOAD_RULES } from "../rules";

const ACCEPT = Object.keys(UPLOAD_RULES.document.contentTypes).join(",");

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

/** Private documents (only signed-in users can download them). */
export function DocumentUploader({
  value,
  onChange,
  onBusyChange,
}: {
  value: UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
  /** Reports uploads starting (+n) and finishing (-1) so forms can block submission. */
  onBusyChange?: (delta: number) => void;
}) {
  const t = useTranslations("uploads");
  const tErrors = useTranslations("errors");
  const inputId = useId();
  const [pending, setPending] = useState<string[]>([]);
  const max = UPLOAD_RULES.document.maxFiles;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, max - value.length);
    setPending((p) => [...p, ...selected.map((f) => f.name)]);
    onBusyChange?.(selected.length);
    let current = value;
    for (const file of selected) {
      try {
        current = [...current, await uploadDocument(file)];
        onChange(current);
      } catch (error) {
        const code = error instanceof UploadError ? error.code : "uploadFailed";
        toast.error(
          `${file.name}: ${tErrors.has(code as never) ? tErrors(code as never) : tErrors("uploadFailed")}`,
        );
      } finally {
        setPending((p) => p.filter((name) => name !== file.name));
        onBusyChange?.(-1);
      }
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-lg border bg-card">
        {value.map((doc, index) => (
          <li key={doc.key} className="flex items-center gap-3 px-4 py-3 text-sm">
            <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{doc.fileName}</span>
            <span className="text-xs text-muted-foreground">{formatSize(doc.size)}</span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={t("remove")}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
        {pending.map((name) => (
          <li
            key={`pending-${name}`}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground"
          >
            <Loader2Icon className="size-4 animate-spin" />
            <span className="truncate">{name}</span>
          </li>
        ))}
        {value.length === 0 && pending.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t("noDocuments")}
          </li>
        )}
      </ul>
      {value.length + pending.length < max && (
        <div>
          <Button asChild type="button" variant="outline">
            <label htmlFor={inputId} className="cursor-pointer">
              <PaperclipIcon />
              {t("addDocuments")}
            </label>
          </Button>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">{t("documentsHint", { max })}</p>
    </div>
  );
}
