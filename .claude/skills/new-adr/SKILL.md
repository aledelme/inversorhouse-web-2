---
name: new-adr
description: Record an architecture decision as a new ADR in docs/adr (or supersede an existing one). Use whenever a change introduces a library, pattern, infrastructure or rule that future contributors must respect.
---

# New ADR

1. `ls docs/adr` → next number `NNNN`.
2. Copy `docs/adr/0000-template.md` to `docs/adr/NNNN-<kebab-title>.md`.
3. Fill in context (facts, constraints), decision (concrete: libs, paths, rules), consequences,
   alternatives. Today's date. Status `accepted` only if the user approved it; else `proposed`.
4. If it replaces an older ADR, set the old one's status to `superseded by [NNNN](NNNN-....md)`.
5. If agents must follow a new rule, add it to the relevant `AGENTS.md` (root or folder).
6. Commit with `docs(adr): NNNN <title>`.
