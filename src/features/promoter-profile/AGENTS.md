# promoter-profile — promoter contact settings (Clerk)

- Data lives ONLY in Clerk `privateMetadata.contact` = `{ phone (E.164), phoneVisibility, bookingUrl? }`
  (ADR-0003). Nothing here touches our database.
- `phoneVisibility: "hidden"` requires a Google Calendar booking URL (`BOOKING_HOSTS`).
- `getPromoterContact` is for signed-in viewers only; it returns `"deleted"` when Clerk answers 404
  (callers must then withdraw the promoter's opportunities — business rule #8).
- Never wrap these functions in `'use cache'`: they return personal data.
- Users whose `clerk_user_id` starts with `seed_` are local fake data (no Clerk call).
