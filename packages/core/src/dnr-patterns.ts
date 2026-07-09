/**
 * Regex builders for declarativeNetRequest rules.
 *
 * These are pure string helpers so they can be unit-tested without the
 * chrome.* APIs. The chrome adapter turns them into actual DNR rules.
 */

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Optional subdomain prefix. Written as a single `*` quantifier rather than the
 * more obvious `([a-z0-9-]+\.)*`: the nested quantifier compiles to a large RE2
 * program and blows past Chrome's 2KB-per-rule memory limit. `[^/]*\.` matches
 * any depth of subdomain (dots are allowed inside `[^/]`) at a fraction of the
 * size.
 */
const SUBDOMAIN_PREFIX = "([^/]*\\.)?";

/**
 * Matches the *entire* URL of a main-frame navigation to `domain` (and any
 * subdomain). Anchoring both ends means a `regexSubstitution` redirect can
 * reference the whole original URL via `\0`, so the tower can offer to send
 * the user back to exactly where they were.
 */
export function blockUrlRegex(domain: string): string {
  return `^https?://${SUBDOMAIN_PREFIX}${escapeRegex(domain)}(/.*)?$`;
}

/**
 * Auth / identity endpoints that must stay reachable even while the domain is
 * blocked, otherwise cross-domain sign-in flows break — most notably Google
 * syncing its login cookie onto youtube.com (accounts.youtube.com/SetSID, the
 * /signin and /ServiceLogin hops, OAuth callbacks, logout).
 *
 * Keywords are matched only within the path (before any query string) and the
 * rule is applied case-insensitively by the adapter, so a search query like
 * `?q=login` does not accidentally unblock the site.
 */
const AUTH_PATH_KEYWORDS = [
  "signin",
  "servicelogin",
  "setsid",
  "checkcookie",
  "logout",
  "oauth",
  // Covers the `accounts.<domain>/accounts/...` cookie-sync endpoints too.
  "accounts",
] as const;

export function authAllowRegex(domain: string): string {
  const d = escapeRegex(domain);
  const keywords = AUTH_PATH_KEYWORDS.join("|");
  // Any path (on the domain or a sub-domain such as accounts.<domain>) whose
  // path portion — before any query string — contains an auth keyword.
  return `^https?://${SUBDOMAIN_PREFIX}${d}/[^?#]*(${keywords})`;
}
