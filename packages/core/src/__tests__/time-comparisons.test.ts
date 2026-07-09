import { describe, expect, test } from "bun:test";
import { ACHIEVEMENT_DURATIONS } from "../i18n/achievements.js";
import { buildSiteTimeInsight, formatDuration } from "../i18n/index.js";
import { en } from "../i18n/locales/en.js";
import {
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  MINUTES_PER_SIX_MONTHS,
  MINUTES_PER_WEEK,
  MINUTES_PER_YEAR,
} from "../i18n/time.js";

describe("formatDuration", () => {
  test("formats sub-minute durations", () => {
    expect(formatDuration(0, en.duration)).toBe("less than a minute");
    expect(formatDuration(0.4, en.duration)).toBe("24 seconds");
    expect(formatDuration(0.5, en.duration)).toBe("30 seconds");
  });

  test("formats minutes and hours", () => {
    expect(formatDuration(1, en.duration)).toBe("1 minute");
    expect(formatDuration(45, en.duration)).toBe("45 minutes");
    expect(formatDuration(60, en.duration)).toBe("1 hour");
    expect(formatDuration(127, en.duration)).toBe("2 hours 7 minutes");
  });

  test("formats day-through-year buckets", () => {
    expect(formatDuration(MINUTES_PER_DAY, en.duration)).toBe("1 day");
    expect(formatDuration(MINUTES_PER_WEEK, en.duration)).toBe("7 days");
    expect(formatDuration(MINUTES_PER_MONTH, en.duration)).toBe("1 month");
    expect(formatDuration(MINUTES_PER_SIX_MONTHS, en.duration)).toBe("6 months");
    expect(formatDuration(MINUTES_PER_YEAR, en.duration)).toBe("1 year");
  });
});

describe("buildSiteTimeInsight", () => {
  test("returns no comparison for fresh sites", () => {
    const insight = buildSiteTimeInsight(0, "seed", en);
    expect(insight.comparison).toBeNull();
  });

  test("uses repeat wording with a realistic multiple for long sessions", () => {
    const insight = buildSiteTimeInsight(120, "reddit-2026-06-24", en);
    expect(insight.totalLabel).toBe("2 hours");
    expect(insight.comparison).toContain("you could have done it");
    expect(insight.comparison).not.toContain("in half the time you've spent here");
  });

  test("uses repeat wording for short achievements on moderate sessions", () => {
    const insight = buildSiteTimeInsight(36, "youtube-2026-06-24", en);
    expect(insight.comparison).toContain("you could have done it");
    expect(insight.comparison).toMatch(/[2-9]\d*× over/);
    expect(insight.comparison).not.toContain("in half the time you've spent here");
  });

  test("uses a realistic duration for Usain Bolt", () => {
    const insight = buildSiteTimeInsight(1, "usain-bolt-check", en);
    expect(insight.comparison).toContain("Usain Bolt");
    expect(insight.comparison).toContain("30 seconds");
    expect(insight.comparison).toContain("2× over");
  });

  test("falls back to repeat wording for shorter sessions", () => {
    const insight = buildSiteTimeInsight(1.5, "twitter-2026-06-24", en);
    expect(insight.comparison).toContain("you could have done it");
  });

  test("anchors achievements at each time scale", () => {
    expect(ACHIEVEMENT_DURATIONS["usain-finals"]).toBe(0.5);
    expect(ACHIEVEMENT_DURATIONS["rubiks-cube"]).toBe(1);
    expect(ACHIEVEMENT_DURATIONS.sonnet).toBe(15);
    expect(ACHIEVEMENT_DURATIONS["guernica-sketch"]).toBe(30);
    expect(ACHIEVEMENT_DURATIONS["picasso-portrait"]).toBe(60);
    expect(ACHIEVEMENT_DURATIONS["austen-pride"]).toBe(180);
    expect(ACHIEVEMENT_DURATIONS["apollo-moon"]).toBe(MINUTES_PER_DAY);
    expect(ACHIEVEMENT_DURATIONS["darwin-finches"]).toBe(MINUTES_PER_WEEK);
    expect(ACHIEVEMENT_DURATIONS["nanowrimo-novel"]).toBe(MINUTES_PER_MONTH);
    expect(ACHIEVEMENT_DURATIONS["valley-forge"]).toBe(MINUTES_PER_SIX_MONTHS);
    expect(ACHIEVEMENT_DURATIONS["einstein-1905"]).toBe(MINUTES_PER_YEAR);
  });
});
