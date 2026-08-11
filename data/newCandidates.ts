import candidatesJson from './newCandidates.json';

export type NewCandidateReadiness =
  | 'ready'
  | 'missing-price'
  | 'missing-mockup'
  | 'missing-variant'
  | 'ambiguous';

export type NewCandidateVariant = {
  printfulSyncVariantId: number;
  printfulVariantId: number;
  sku?: string;
  size: string;
  color: string;
  active: boolean;
  retailPrice?: number;
};

export type NewCandidate = {
  printfulSyncProductId: number;
  externalProductId?: string;
  proposedSlug: string;
  title: string;
  variants: NewCandidateVariant[];
  mockups: {
    front?: string;
    back?: string;
    alternate?: string[];
  };
  importedAt: string;
  readiness: NewCandidateReadiness;
};

export const NEW_CANDIDATES = candidatesJson as NewCandidate[];
