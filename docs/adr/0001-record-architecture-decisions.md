# 0001. Record architecture decisions

- Status: accepted
- Date: 2026-10-18

## Context

The codebase is developed mostly with AI coding agents. Agents (and humans) need to know _why_
things are the way they are, or they will "fix" deliberate choices.

## Decision

Keep lightweight ADRs (MADR-style) in `docs/adr/NNNN-kebab-title.md`, using `0000-template.md`.
Never edit the decision of an accepted ADR; supersede it with a new one and update the old one's
status line. Agents must check ADRs before changing architecture (see root `AGENTS.md`).

## Consequences

Decisions are discoverable by grep. Small cost per decision.
