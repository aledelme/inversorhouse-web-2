type JsonNode = { type?: string; text?: string; content?: JsonNode[] };

const BLOCKS = new Set(["paragraph", "heading", "listItem", "blockquote", "hardBreak"]);

/** Plain text of a Tiptap JSON document (for excerpts, search and length checks). */
export function docToText(doc: unknown): string {
  const parts: string[] = [];
  const walk = (node: JsonNode) => {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
    if (node.type && BLOCKS.has(node.type)) parts.push("\n");
  };
  if (doc && typeof doc === "object") walk(doc as JsonNode);
  return parts
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
