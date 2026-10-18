# 0010. Spanish-only UI, i18n-ready from day one

- Status: accepted
- Date: 2026-10-18

## Context

The site launches only in Spanish, but English is likely later. Retro-fitting i18n into hardcoded
copy is expensive.

## Decision

- **next-intl** without i18n routing for now: a single locale `es` (`src/i18n/request.ts`), with
  messages in `messages/es.json` namespaced by feature or page.
- Components never contain user-facing literals: they use `useTranslations` / `getTranslations`.
  Enum labels (opportunity types, statuses) are messages too.
- Numbers, currency and dates go through the formatters in `@/lib/format` (Intl, locale-aware).
- Route segments stay in Spanish (`/oportunidades`). Adding English later: `messages/en.json`, a
  `[locale]` segment with next-intl routing and `pathnames` for translated URLs, and Clerk
  localization per locale.
- User-generated content is not translated.

## Consequences

Slight overhead per string. An ESLint rule against literal strings in JSX may be added later.
