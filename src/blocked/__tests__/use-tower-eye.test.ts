import { describe, expect, it } from "bun:test";
import {
  buildSphericalEyePose,
  clampIrisOffset,
  directionToEyeRotation,
  foreshorteningScale,
  pivotTransform,
  screenGazeDelta,
} from "../use-tower-eye.js";

describe("clampIrisOffset", () => {
  it("passes through offsets inside the clamp ellipse", () => {
    expect(clampIrisOffset(3, 2, 10, 7)).toEqual({ x: 3, y: 2 });
  });

  it("clamps offsets outside the ellipse", () => {
    const offset = clampIrisOffset(20, 0, 10, 7);
    expect(offset.x).toBeCloseTo(10, 5);
    expect(offset.y).toBe(0);
  });
});

describe("directionToEyeRotation", () => {
  it("yaws toward horizontal cursor offset", () => {
    const rotation = directionToEyeRotation(20, 0, 16);
    expect(rotation.rotY).toBe(44);
    expect(rotation.rotX).toBeCloseTo(0, 5);
  });

  it("pitches toward vertical cursor offset", () => {
    const rotation = directionToEyeRotation(0, 12, 16);
    expect(rotation.rotX).toBeGreaterThan(0);
  });
});

describe("buildSphericalEyePose", () => {
  it("derives rotation from pointer direction without translating the sphere", () => {
    const pose = buildSphericalEyePose(10, 0, 16);
    expect(pose.x).toBe(0);
    expect(pose.y).toBe(0);
    expect(pose.rotY).toBeGreaterThan(0);
  });

  it("returns a neutral pose at center", () => {
    const pose = buildSphericalEyePose(0, 0, 16);
    expect(pose.x).toBe(0);
    expect(pose.y).toBe(0);
    expect(pose.rotX).toBeCloseTo(0, 5);
    expect(pose.rotY).toBe(0);
  });
});

describe("foreshorteningScale", () => {
  it("squashes the eye when it turns away from the viewer", () => {
    const headOn = foreshorteningScale(0, 0);
    const turned = foreshorteningScale(0, 40);
    expect(turned.scaleX).toBeLessThan(headOn.scaleX);
  });
});

describe("screenGazeDelta", () => {
  it("returns positive x when the pointer is to the right of the eye", () => {
    const svg = {
      getBoundingClientRect: () => ({ width: 96, left: 0, top: 0 }),
      viewBox: { baseVal: { width: 96 } },
    } as SVGSVGElement;
    const eyeTrack = {
      querySelector: () => null,
      getBoundingClientRect: () => ({ left: 40, top: 10, width: 16, height: 12 }),
    } as unknown as SVGGraphicsElement;

    const delta = screenGazeDelta(eyeTrack, svg, 64, 16);
    expect(delta.x).toBeGreaterThan(0);
  });
});

describe("pivotTransform", () => {
  it("keeps the pivot fixed by ending on the negated center translate", () => {
    const transform = pivotTransform(48, 24, 15, 0.9, 0.95);
    expect(transform).toContain("translate(48.00 24.00)");
    expect(transform).toContain("translate(-48.00 -24.00)");
    expect(transform).not.toContain("skew");
  });
});
