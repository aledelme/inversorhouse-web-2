@AGENTS.md

## Claude Code specifics

- Project skills live in `.claude/skills/` (`verify`, `new-feature`, `new-adr`, `db-change`). Use them.
- The Next.js MCP server (`.mcp.json` → `next-devtools`) exposes the running dev server's errors,
  routes and compilation issues. Start `pnpm dev` first.
- After every implementation run the `verify` skill (`pnpm verify:full`) and report the outcome.
