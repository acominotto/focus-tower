import { describe, expect, it } from "bun:test";
import { isEventInsideGateWatcher } from "../use-gate-watcher.js";

describe("isEventInsideGateWatcher", () => {
  it("returns true when the shadow host is in the composed path", () => {
    const host = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true };
    const other = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true };
    const event = { composedPath: () => [host, other] };

    expect(isEventInsideGateWatcher(event as unknown as MouseEvent, host)).toBe(true);
  });

  it("returns false for outside clicks", () => {
    const host = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true };
    const other = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true };
    const event = { composedPath: () => [other, other] };

    expect(isEventInsideGateWatcher(event as unknown as MouseEvent, host)).toBe(false);
  });
});
