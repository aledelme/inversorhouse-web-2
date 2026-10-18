import { pgEnum } from "drizzle-orm/pg-core";

// Values are stable identifiers stored in the DB. UI labels live in messages/es.json.
export const OPPORTUNITY_TYPES = ["CRV", "CRA", "OCUPACION", "NPL", "COINVERSION"] as const;
export const opportunityTypeEnum = pgEnum("opportunity_type", OPPORTUNITY_TYPES);

/**
 * published: visible (unless closed or promoter banned).
 * withdrawn: retired by its promoter (can be republished).
 * removed: taken down by an admin (only an admin can restore it).
 */
export const OPPORTUNITY_STATUSES = ["published", "withdrawn", "removed"] as const;
export const opportunityStatusEnum = pgEnum("opportunity_status", OPPORTUNITY_STATUSES);

export const RETURN_KINDS = ["fixed", "range"] as const;
export const returnKindEnum = pgEnum("return_kind", RETURN_KINDS);

export const USER_STATUSES = ["active", "banned"] as const;
export const userStatusEnum = pgEnum("user_status", USER_STATUSES);

export const REPORT_REASONS = [
  "fraud",
  "misleading",
  "inappropriate",
  "duplicate",
  "other",
] as const;
export const reportReasonEnum = pgEnum("report_reason", REPORT_REASONS);

export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
export const reportStatusEnum = pgEnum("report_status", REPORT_STATUSES);
