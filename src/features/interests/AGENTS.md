# interests — "Me interesa"

- One row per (opportunity, user) in `opportunity_interests` (business rule #9). Only visible
  opportunities, never your own.
- Pressing the button = consent to share name + email with that promoter; the UI must always show
  the `interest.consent` notice next to the button.
- Promoters see interested investors via `getInterestedInvestors` — names/emails are read from Clerk
  at request time and never stored or cached (ADR-0003). Check ownership before calling it.
- Interests are per-user data: don't put them in `'use cache'` scopes.
