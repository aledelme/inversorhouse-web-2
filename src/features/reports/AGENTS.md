# reports — "Denunciar anuncio"

- One report per (opportunity, reporter); re-reporting updates reason/details and reopens it.
- Reporters are never shown to promoters. Admins resolve/dismiss from `/admin/denuncias`
  (actions live in `features/admin`, which also writes the audit log).
- Reasons are the `report_reason` enum (`REPORT_REASONS`); labels in `messages/es.json` → `report.reasons`.
