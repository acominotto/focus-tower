import { describe, expect, test } from "bun:test";
import { authAllowRegex, blockUrlRegex, escapeRegex } from "../dnr-patterns.js";

// The adapter applies these case-insensitively (isUrlFilterCaseSensitive: false).
const block = (domain: string) => new RegExp(blockUrlRegex(domain), "i");
const allow = (domain: string) => new RegExp(authAllowRegex(domain), "i");

describe("blockUrlRegex", () => {
  test("matches the domain and its subdomains as whole URLs", () => {
    const re = block("youtube.com");
    expect(re.test("https://youtube.com/")).toBe(true);
    expect(re.test("https://www.youtube.com/watch?v=abc")).toBe(true);
    expect(re.test("https://m.youtube.com/feed")).toBe(true);
    expect(re.test("http://youtube.com/")).toBe(true);
  });

  test("captures the entire URL so \\0 can carry it into the redirect", () => {
    const url = "https://www.youtube.com/watch?v=abc&t=10";
    const match = url.match(block("youtube.com"));
    expect(match?.[0]).toBe(url);
  });

  test("does not match look-alike or unrelated domains", () => {
    const re = block("youtube.com");
    expect(re.test("https://notyoutube.com/")).toBe(false);
    expect(re.test("https://youtube.com.evil.com/")).toBe(false);
    expect(re.test("https://reddit.com/")).toBe(false);
  });
});

describe("authAllowRegex", () => {
  test("allows the accounts sub-domain used for cross-site login cookies", () => {
    const re = allow("youtube.com");
    expect(re.test("https://accounts.youtube.com/accounts/SetSID?ssdc=1")).toBe(true);
    expect(re.test("https://accounts.youtube.com/CheckCookie?x=1")).toBe(true);
  });

  test("allows sign-in / oauth / logout paths", () => {
    const re = allow("youtube.com");
    expect(re.test("https://www.youtube.com/signin?next=/")).toBe(true);
    expect(re.test("https://www.youtube.com/logout")).toBe(true);
    expect(re.test("https://www.youtube.com/oauth2/authorize")).toBe(true);
  });

  test("does not unblock ordinary content or query-string false positives", () => {
    const re = allow("youtube.com");
    expect(re.test("https://www.youtube.com/watch?v=abc")).toBe(false);
    expect(re.test("https://www.youtube.com/results?search_query=oauth")).toBe(false);
    expect(re.test("https://www.youtube.com/feed/subscriptions")).toBe(false);
  });
});

describe("escapeRegex", () => {
  test("escapes regex metacharacters in a domain", () => {
    expect(escapeRegex("a.b-c.com")).toBe("a\\.b-c\\.com");
  });
});
