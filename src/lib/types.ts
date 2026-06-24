export interface Quote {
  text: string;
  author: string;
}

export interface Allowance {
  expiresAt: number | null;
  label: string;
  grantedAt: number;
}

export type Allowances = Record<string, Allowance>;

export type Message =
  | { type: "GET_BLOCKED_SITES" }
  | { type: "ADD_BLOCKED_SITE"; domain: string }
  | { type: "REMOVE_BLOCKED_SITE"; domain: string }
  | { type: "RESET_DEFAULT_SITES" }
  | { type: "GRANT_ALLOWANCE"; domain: string; durationMs: number | null; label: string }
  | { type: "GET_RANDOM_QUOTE" }
  | { type: "GET_CUSTOM_QUOTES" }
  | { type: "ADD_CUSTOM_QUOTE"; quote: Quote }
  | { type: "REMOVE_CUSTOM_QUOTE"; index: number }
  | { type: "REFRESH_RULES" }
  | { type: "GET_SITE_TIME"; domain: string }
  | { type: "GET_LANGUAGE" }
  | { type: "SET_LANGUAGE"; locale: string }
  | { type: "GET_GATE_STATUS"; domain: string }
  | { type: "REVOKE_ALLOWANCE"; domain: string };

export interface GateStatus {
  domain: string;
  expiresAt: number | null;
  grantedAt: number;
  label: string;
}

export interface SiteTimeStats {
  totalMinutes: number;
  totalLabel: string;
  comparison: string | null;
}

export type Response =
  | { ok: true }
  | { ok: true; sites: string[] }
  | { ok: true; quote: Quote }
  | { ok: true; quotes: Quote[] }
  | { ok: true; siteTime: SiteTimeStats }
  | { ok: true; locale: string }
  | { ok: true; gate: GateStatus | null }
  | { ok: false; error: string };
