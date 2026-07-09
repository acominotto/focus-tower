import { describe, expect, test } from "bun:test";
import {
  computeActiveBlocks,
  filterActiveAllowances,
  mergeAllowances,
  pruneExpiredAllowances,
} from "../services/allowances.js";

describe("allowance helpers", () => {
  test("mergeAllowances prefers session over local", () => {
    const merged = mergeAllowances(
      { "a.com": { expiresAt: 100, label: "local", grantedAt: 0 } },
      { "a.com": { expiresAt: 200, label: "session", grantedAt: 0 } },
    );
    expect(merged["a.com"]?.label).toBe("session");
  });

  test("filterActiveAllowances drops expired timed allowances", () => {
    const now = 1000;
    const active = filterActiveAllowances(
      {
        expired: { expiresAt: 500, label: "x", grantedAt: 0 },
        active: { expiresAt: 1500, label: "y", grantedAt: 0 },
        session: { expiresAt: null, label: "z", grantedAt: 0 },
      },
      now,
    );
    expect(Object.keys(active)).toEqual(["active", "session"]);
  });

  test("computeActiveBlocks excludes targets with allowances", () => {
    expect(
      computeActiveBlocks(["a.com", "b.com"], {
        "a.com": { expiresAt: null, label: "break", grantedAt: 0 },
      }),
    ).toEqual(["b.com"]);
  });

  test("pruneExpiredAllowances removes expired entries", () => {
    const { pruned, changed } = pruneExpiredAllowances(
      {
        expired: { expiresAt: 1, label: "x", grantedAt: 0 },
        active: { expiresAt: 9999, label: "y", grantedAt: 0 },
      },
      100,
    );
    expect(changed).toBe(true);
    expect(pruned).toEqual({
      active: { expiresAt: 9999, label: "y", grantedAt: 0 },
    });
  });
});
