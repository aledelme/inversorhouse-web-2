import StarterKit from "@tiptap/starter-kit";

/**
 * The single Tiptap configuration shared by the editor (client) and the static
 * renderer (server). Changing it changes what descriptions can contain.
 */
export const richTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      protocols: ["http", "https", "mailto"],
      HTMLAttributes: { rel: "noopener noreferrer nofollow ugc", target: "_blank" },
    },
  }),
];

export type RichTextDoc = Record<string, unknown>;
