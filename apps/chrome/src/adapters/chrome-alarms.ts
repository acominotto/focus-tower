import type { AllowanceScheduler } from "@focus-tower/core";

export const chromeAllowanceScheduler: AllowanceScheduler = {
  schedule(id, whenMs) {
    return chrome.alarms.create(id, { when: whenMs });
  },
  cancel(id) {
    return chrome.alarms.clear(id);
  },
};
