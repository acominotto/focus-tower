import {
  configureI18n,
  createBlockService,
  type BlockEnforcement,
  type AllowanceScheduler,
} from "@focus-tower/core";
import {
  grantAllowance as nativeGrantAllowance,
  revokeAllowance as nativeRevokeAllowance,
  syncEnforcement as nativeSyncEnforcement,
} from "@focus-tower/native-screen-time";
import { mobileAppStorage, mobileLocaleStore } from "./mobile-storage";

const mobileScheduler: AllowanceScheduler = {
  async schedule(id, whenMs) {
    const targetId = id.replace("allowance-", "");
    const durationMs = whenMs - Date.now();
    await nativeGrantAllowance(targetId, durationMs);
  },
  async cancel(id) {
    const targetId = id.replace("allowance-", "");
    await nativeRevokeAllowance(targetId);
    return true;
  },
};

const mobileEnforcement: BlockEnforcement = {
  async syncBlockedTargets() {
    await nativeSyncEnforcement();
  },
  async grantTemporaryAccess(targetId) {
    await nativeRevokeAllowance(targetId);
  },
  async revokeAccess(targetId) {
    await nativeRevokeAllowance(targetId);
  },
};

export const mobileBlockService = createBlockService({
  storage: mobileAppStorage,
  scheduler: mobileScheduler,
  enforcement: mobileEnforcement,
});

configureI18n({
  localeStore: mobileLocaleStore,
  localeDetector: {
    detect() {
      return Intl.DateTimeFormat().resolvedOptions().locale;
    },
  },
});
