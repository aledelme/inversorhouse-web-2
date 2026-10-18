import { pgEnum } from "drizzle-orm/pg-core";

import {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_TYPES,
  REPORT_REASONS,
  REPORT_STATUSES,
  RETURN_KINDS,
  USER_STATUSES,
} from "../enum-values";

export {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_TYPES,
  REPORT_REASONS,
  REPORT_STATUSES,
  RETURN_KINDS,
  USER_STATUSES,
};

export const opportunityTypeEnum = pgEnum("opportunity_type", OPPORTUNITY_TYPES);
export const opportunityStatusEnum = pgEnum("opportunity_status", OPPORTUNITY_STATUSES);
export const returnKindEnum = pgEnum("return_kind", RETURN_KINDS);
export const userStatusEnum = pgEnum("user_status", USER_STATUSES);
export const reportReasonEnum = pgEnum("report_reason", REPORT_REASONS);
export const reportStatusEnum = pgEnum("report_status", REPORT_STATUSES);
