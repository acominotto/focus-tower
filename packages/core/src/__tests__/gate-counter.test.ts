import { describe, expect, it } from "bun:test";
import { formatCountdownMs, formatGateCounter } from "../gate-counter.js";

describe("formatCountdownMs", () => {
  it("formats sub-hour durations as mm:ss", () => {
    expect(formatCountdownMs(125_000)).toBe("2:05");
  });

  it("formats hour-plus durations as h:mm:ss", () => {
    expect(formatCountdownMs(3_661_000)).toBe("1:01:01");
  });
});

describe("formatGateCounter", () => {
  it("counts down remaining allowance time", () => {
    expect(formatGateCounter(1_000_000, 0, 250_000)).toBe("12:30");
  });

  it("counts up elapsed session time", () => {
    expect(formatGateCounter(null, 500_000, 620_000)).toBe("2:00");
  });
});
