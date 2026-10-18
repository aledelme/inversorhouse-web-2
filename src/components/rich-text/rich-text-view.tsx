import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

import { cn } from "@/lib/utils";

import { richTextExtensions, type RichTextDoc } from "./extensions";

/** Server-side rendering of a stored Tiptap document (no raw HTML involved). */
export function RichTextView({ doc, className }: { doc: RichTextDoc; className?: string }) {
  return (
    <div className={cn("rich-text", className)}>
      {renderToReactElement({ content: doc, extensions: richTextExtensions })}
    </div>
  );
}
