import type { OpportunityType, ReturnKind } from "./constants";

export type ReturnFigures = {
  kind: ReturnKind;
  nominalMin: number;
  nominalMax: number;
  annualMin: number;
  annualMax: number;
};

/** Data for a listing card. Public: contains no promoter information. */
export type OpportunitySummary = {
  id: string;
  slug: string;
  type: OpportunityType;
  title: string;
  excerpt: string;
  amountToRaise: number;
  minTicket: number | null;
  termMonths: number;
  returns: ReturnFigures;
  municipality: string;
  province: string;
  coverImageUrl: string | null;
  isFeatured: boolean;
  publishedAt: Date;
  closesAt: Date | null;
};

/** Public detail. `promoterUserId` is internal (never render it). */
export type OpportunityDetail = OpportunitySummary & {
  description: Record<string, unknown>;
  community: string;
  municipalityCode: string;
  images: { id: string; url: string; width: number | null; height: number | null }[];
  documentCount: number;
  promoterUserId: string;
};

export type OpportunityFilters = {
  types?: OpportunityType[];
  community?: string;
  province?: string;
  municipality?: string;
  /** Investor budget: show opportunities whose minimum ticket is ≤ this (or none). */
  maxTicket?: number;
  page?: number;
};

export type OpportunityPage = {
  items: OpportunitySummary[];
  total: number;
  page: number;
  pageCount: number;
};
