/** "A@x.com, b@y.com ,a@x.com" → ["a@x.com", "b@y.com"] (trimmed, lower-cased, deduplicated). */
export function parseEmailList(raw: string | undefined): string[] {
  return [
    ...new Set(
      (raw ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}
