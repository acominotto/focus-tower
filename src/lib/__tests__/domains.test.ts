import { describe, expect, test } from "bun:test";
import { domainFromUrl, hostMatchesBlockedDomain, normalizeDomain } from "../domains.js";

describe("hostMatchesBlockedDomain", () => {
  test("matches the exact blocked domain", () => {
    expect(hostMatchesBlockedDomain("youtube.com", "youtube.com")).toBe(true);
    expect(hostMatchesBlockedDomain("www.youtube.com", "youtube.com")).toBe(true);
  });

  test("matches subdomains of the blocked domain", () => {
    expect(hostMatchesBlockedDomain("m.youtube.com", "youtube.com")).toBe(true);
    expect(hostMatchesBlockedDomain("music.youtube.com", "youtube.com")).toBe(true);
  });

  test("does not match unrelated domains", () => {
    expect(hostMatchesBlockedDomain("notyoutube.com", "youtube.com")).toBe(false);
    expect(hostMatchesBlockedDomain("youtube.com.evil.com", "youtube.com")).toBe(false);
  });
});

describe("domainFromUrl", () => {
  test("normalizes common YouTube hosts to youtube.com", () => {
    expect(domainFromUrl("https://www.youtube.com/watch?v=abc")).toBe("youtube.com");
    expect(domainFromUrl("https://m.youtube.com/feed")).toBe("m.youtube.com");
  });

  test("normalizes bare hosts", () => {
    expect(normalizeDomain("www.example.com")).toBe("example.com");
  });
});
