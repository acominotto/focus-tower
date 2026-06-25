import { describe, expect, test } from "bun:test";
import {
  clampNormalized,
  clampPixels,
  normalizedToPixels,
  pixelsToNormalized,
} from "../gate-watcher-layout.js";

describe("gate-watcher-layout", () => {
  test("converts normalized coordinates to pixels and back", () => {
    const layout = { x: 0.5, y: 0.25 };
    const pixels = normalizedToPixels(layout, 1000, 800, 100, 40);
    expect(pixels).toEqual({ left: 450, top: 190 });

    const normalized = pixelsToNormalized(pixels.left, pixels.top, 1000, 800, 100, 40);
    expect(normalized.x).toBeCloseTo(0.5);
    expect(normalized.y).toBeCloseTo(0.25);
  });

  test("clamps normalized values", () => {
    expect(clampNormalized(-0.2)).toBe(0);
    expect(clampNormalized(1.5)).toBe(1);
  });

  test("clamps pixel positions inside the viewport", () => {
    expect(clampPixels(-20, 900, 400, 300, 80, 32)).toEqual({ left: 0, top: 268 });
    expect(clampPixels(500, -10, 400, 300, 80, 32)).toEqual({ left: 320, top: 0 });
  });
});
