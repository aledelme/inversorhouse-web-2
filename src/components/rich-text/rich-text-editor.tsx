"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  type LucideIcon,
  QuoteIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { richTextExtensions, type RichTextDoc } from "./extensions";

type Props = {
  value: RichTextDoc | null;
  onChange: (doc: RichTextDoc) => void;
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
};

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
        active && "bg-secondary text-primary",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/** Tiptap editor limited to the shared `richTextExtensions`. Emits JSON. */
export function RichTextEditor({ value, onChange, id, invalid, ...aria }: Props) {
  const t = useTranslations("editor");
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: id ?? "",
        class: "rich-text min-h-56 px-4 py-3 outline-none",
        role: "textbox",
        "aria-multiline": "true",
        ...(aria["aria-describedby"] ? { "aria-describedby": aria["aria-describedby"] } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichTextDoc),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      link: e?.isActive("link") ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  });

  const chain = () => editor!.chain().focus();

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) return void chain().unsetLink().run();
    const href = window.prompt(t("linkPrompt"), "https://");
    if (href && /^(https?:\/\/|mailto:)/i.test(href))
      chain().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30",
        invalid && "border-destructive",
      )}
    >
      <div
        role="toolbar"
        aria-label={t("toolbar")}
        className="flex flex-wrap gap-0.5 border-b bg-muted/40 p-1"
      >
        <ToolbarButton
          icon={BoldIcon}
          label={t("bold")}
          active={state?.bold}
          onClick={() => chain().toggleBold().run()}
        />
        <ToolbarButton
          icon={ItalicIcon}
          label={t("italic")}
          active={state?.italic}
          onClick={() => chain().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Heading2Icon}
          label={t("heading2")}
          active={state?.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3Icon}
          label={t("heading3")}
          active={state?.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          icon={ListIcon}
          label={t("bulletList")}
          active={state?.bullet}
          onClick={() => chain().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrderedIcon}
          label={t("orderedList")}
          active={state?.ordered}
          onClick={() => chain().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={QuoteIcon}
          label={t("quote")}
          active={state?.quote}
          onClick={() => chain().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={LinkIcon}
          label={t("link")}
          active={state?.link}
          onClick={toggleLink}
        />
        <span className="mx-1 w-px self-stretch bg-border" />
        <ToolbarButton
          icon={Undo2Icon}
          label={t("undo")}
          disabled={!state?.canUndo}
          onClick={() => chain().undo().run()}
        />
        <ToolbarButton
          icon={Redo2Icon}
          label={t("redo")}
          disabled={!state?.canRedo}
          onClick={() => chain().redo().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
