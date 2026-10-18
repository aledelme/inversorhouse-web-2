// Dependency-free enum values, importable from client code.
// Stable identifiers stored in the DB. UI labels live in messages/es.json.
export const OPPORTUNITY_TYPES = ["CRV", "CRA", "OCUPACION", "NPL", "COINVERSION"] as const;

/**
 * published: visible (unless closed or promoter banned).
 * withdrawn: retired by its promoter (can be republished).
 * removed: taken down by an admin (only an admin can restore it).
 */
export const OPPORTUNITY_STATUSES = ["published", "withdrawn", "removed"] as const;
export const RETURN_KINDS = ["fixed", "range"] as const;
export const USER_STATUSES = ["active", "banned"] as const;
export const REPORT_REASONS = [
  "fraud",
  "misleading",
  "inappropriate",
  "duplicate",
  "other",
] as const;
export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
