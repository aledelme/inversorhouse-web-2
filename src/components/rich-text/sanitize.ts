import { getSchema } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";

import { richTextExtensions } from "./extensions";
import { docToText } from "./text";

const schema = getSchema(richTextExtensions);
const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

type JsonMark = { type: string; attrs?: Record<string, unknown> };
type JsonNode = { type: string; marks?: JsonMark[]; content?: JsonNode[]; [key: string]: unknown };

function stripUnsafeLinks(node: JsonNode): JsonNode {
  return {
    ...node,
    marks: node.marks?.filter(
      (mark) => mark.type !== "link" || SAFE_HREF.test(String(mark.attrs?.href ?? "")),
    ),
    content: node.content?.map(stripUnsafeLinks),
  };
}

/**
 * Validates untrusted Tiptap JSON against our editor schema and removes links with
 * unsafe protocols. Throws if the document is not valid for the schema.
 */
export function sanitizeRichText(doc: unknown): { doc: Record<string, unknown>; text: string } {
  const cleaned = stripUnsafeLinks(doc as JsonNode);
  const node = Node.fromJSON(schema, cleaned);
  node.check();
  const json = node.toJSON() as Record<string, unknown>;
  return { doc: json, text: docToText(json) };
}
