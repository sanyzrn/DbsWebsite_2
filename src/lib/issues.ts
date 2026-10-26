/** Problem-report form (/issues): field types, caps and query prefill (pure, unit-testable). */

import { ISSUE_KIND_IDS, ISSUE_PRODUCT_IDS, type IssueKindId, type IssueProductId } from "./i18n";

export type IssueFields = {
  name: string;
  email: string;
  product: IssueProductId;
  kind: IssueKindId;
  version: string;
  environment: string;
  message: string;
};

/** Client/server field length caps — keep in sync with public/api/issue.php. */
export const ISSUE_FIELD_MAX = {
  name: 100,
  email: 254,
  version: 40,
  environment: 200,
  message: 3000,
} as const;

export const emptyIssueFields: IssueFields = {
  name: "",
  email: "",
  product: ISSUE_PRODUCT_IDS[0],
  kind: ISSUE_KIND_IDS[0],
  version: "",
  environment: "",
  message: "",
};

/**
 * Links from the products open the form already filled in, e.g.
 * /issues?product=nexachatai&version=1.7.8&kind=bug. Unknown or oversized values are ignored.
 */
export function issuePrefillFromQuery(params: URLSearchParams): Partial<IssueFields> {
  const out: Partial<IssueFields> = {};
  const product = params.get("product")?.trim().toLowerCase();
  if (product && (ISSUE_PRODUCT_IDS as readonly string[]).includes(product)) {
    out.product = product as IssueProductId;
  }
  const kind = params.get("kind")?.trim().toLowerCase();
  if (kind && (ISSUE_KIND_IDS as readonly string[]).includes(kind)) {
    out.kind = kind as IssueKindId;
  }
  const version = params.get("version")?.trim();
  if (version && version.length <= ISSUE_FIELD_MAX.version && /^[\w.+\- ]+$/.test(version)) {
    out.version = version;
  }
  return out;
}
