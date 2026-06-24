import type { AchievementId } from "./types.js";
import {
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  MINUTES_PER_SIX_MONTHS,
  MINUTES_PER_WEEK,
  MINUTES_PER_YEAR,
} from "./time.js";

export const ACHIEVEMENT_DURATIONS: Record<AchievementId, number> = {
  "usain-finals": 0.5,
  "rubiks-cube": 1,
  sonnet: 15,
  "guernica-sketch": 30,
  "picasso-portrait": 60,
  "dumas-chapter": 45,
  "mozart-don-giovanni": 90,
  "beethoven-moonlight": 120,
  "hemingway-macomber": 240,
  "austen-pride": 180,
  "pilot-atlantic": 480,
  "rowling-harry": 720,
  "apollo-moon": MINUTES_PER_DAY,
  "darwin-finches": MINUTES_PER_WEEK,
  "nanowrimo-novel": MINUTES_PER_MONTH,
  "valley-forge": MINUTES_PER_SIX_MONTHS,
  "einstein-1905": MINUTES_PER_YEAR,
};
