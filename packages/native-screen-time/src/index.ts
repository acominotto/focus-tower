import type { BlockTarget } from "@focus-tower/core";
import { requireNativeModule } from "expo-modules-core";

export interface NativeScreenTimeModule {
  requestAuthorization(): Promise<boolean>;
  presentAppPicker(): Promise<void>;
  getSelectedApps(): Promise<BlockTarget[]>;
  setShieldsEnabled(enabled: boolean): Promise<void>;
  grantAllowance(targetId: string, durationMs: number | null): Promise<void>;
  revokeAllowance(targetId: string): Promise<void>;
  syncEnforcement(): Promise<void>;
}

const NativeModule = requireNativeModule<NativeScreenTimeModule>("FocusTowerScreenTime");

export async function requestAuthorization(): Promise<boolean> {
  return NativeModule.requestAuthorization();
}

export async function presentAppPicker(): Promise<void> {
  return NativeModule.presentAppPicker();
}

export async function getSelectedApps(): Promise<BlockTarget[]> {
  return NativeModule.getSelectedApps();
}

export async function setShieldsEnabled(enabled: boolean): Promise<void> {
  return NativeModule.setShieldsEnabled(enabled);
}

export async function grantAllowance(targetId: string, durationMs: number | null): Promise<void> {
  return NativeModule.grantAllowance(targetId, durationMs);
}

export async function revokeAllowance(targetId: string): Promise<void> {
  return NativeModule.revokeAllowance(targetId);
}

export async function syncEnforcement(): Promise<void> {
  return NativeModule.syncEnforcement();
}
