# Domain

## Glossary (ES → code)

| Spanish (UI)                 | Code                           | Meaning                                                                     |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Promotor                     | promoter                       | User who publishes opportunities. Any user can be one after adding a phone. |
| Inversor                     | investor                       | Any signed-in user browsing / showing interest.                             |
| Oportunidad / anuncio        | opportunity                    | A listing.                                                                  |
| Me interesa                  | interest                       | Investor shares name + email with the promoter of one opportunity.          |
| Denuncia                     | report                         | A user flags an opportunity for admin review.                               |
| Administrador                | admin                          | Email listed in `ADMIN_EMAILS` (verified in Clerk).                         |
| Destacada                    | featured                       | Opportunity published by an admin; shown first.                             |
| Comunidad autónoma (CCAA)    | community                      | INE 2-digit code.                                                           |
| Provincia                    | province                       | INE 2-digit code.                                                           |
| Municipio                    | municipality                   | INE 5-digit code (province + 3).                                            |
| Ticket mínimo                | minTicket                      | Minimum amount an investor can put in (optional).                           |
| Cantidad a levantar          | amountToRaise                  | Total capital sought.                                                       |
| Plazo                        | termMonths                     | Duration of the operation, in months.                                       |
| Fecha de cierre              | closesAt                       | Listing disappears after this date (optional).                              |
| Rentabilidad nominal / anual | returnNominal* / returnAnnual* | Total vs annualised return, %, fixed or range.                              |

## Opportunity types

| Code          | Label                            | Description                                                    |
| ------------- | -------------------------------- | -------------------------------------------------------------- |
| `CRV`         | CRV — Compra, Reforma y Venta    | Buy, renovate and sell (flip).                                 |
| `CRA`         | CRA — Compra, Reforma y Alquiler | Buy, renovate and rent.                                        |
| `OCUPACION`   | Ocupación                        | Properties with occupants / squatters, acquired at a discount. |
| `NPL`         | NPL                              | Non-performing loans (distressed debt).                        |
| `COINVERSION` | Coinversión                      | Co-investment in a project led by the promoter.                |

## Business rules

1. **Visibility.** An opportunity is listed iff `status = 'published'` AND (`closes_at` IS NULL OR
   `closes_at > now()`) AND its promoter is not banned. Checked in the query (no cron).
2. **Ordering.** Featured first, then most recently published.
3. **Publishing** requires a phone number stored in Clerk (`privateMetadata.contact.phone`).
4. **Contact visibility.** Anonymous visitors see the listing but not: promoter name/email/phone,
   booking link, documents. Signed-in users always see promoter **name + email**, plus either the
   **phone** (`phoneVisibility = 'public'`) or a **Google Calendar booking link** (`'hidden'`).
5. **Returns.** `fixed` ⇒ min = max. Annual return defaults to `nominal × 12 / termMonths`
   (simple, non-compounded) and the promoter may override it.
6. **Statuses.** `published` ⇄ `withdrawn` (by promoter). `removed` only by an admin, with a reason;
   only an admin can restore it. Promoters cannot edit a removed opportunity.
7. **Ban.** Banning a user (admin) bans them in Clerk (sessions revoked) and hides all their
   opportunities. Unbanning restores visibility.
8. **Deleted Clerk user.** If Clerk returns 404 for a promoter, their opportunities become `withdrawn`.
9. **Interest.** One per (opportunity, user). Promoters cannot show interest in their own listings.
   The promoter sees interested users' name + email (read from Clerk on demand).
10. **Reports.** One per (opportunity, user). Admins resolve or dismiss them.
11. **Featured.** Opportunities created by an admin are featured automatically; admins can toggle it.
