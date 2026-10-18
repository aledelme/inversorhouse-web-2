# docs/adr — architecture decision records

- One decision per file: `NNNN-kebab-title.md`, next free number, copied from `0000-template.md`.
- Status starts as `accepted` when the user approved the decision in the conversation, otherwise
  `proposed`. Never rewrite an accepted decision; supersede it with a new ADR and update the old
  one's status to `superseded by [NNNN](...)`.
- Keep it short: context (facts), decision (concrete), consequences, alternatives.
- When a decision changes a rule agents must follow, also update the relevant `AGENTS.md`.
