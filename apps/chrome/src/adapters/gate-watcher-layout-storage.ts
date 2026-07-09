import {
  DEFAULT_GATE_WATCHER_LAYOUT,
  normalizeDomain,
  STORAGE_KEYS,
  type GateWatcherLayout,
  type GateWatcherLayouts,
} from "@focus-tower/core";

function layoutsKey(site: string): string {
  return normalizeDomain(site);
}

export async function getGateWatcherLayouts(): Promise<GateWatcherLayouts> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.gateWatcherLayouts);
  return (data[STORAGE_KEYS.gateWatcherLayouts] as GateWatcherLayouts | undefined) ?? {};
}

export async function getGateWatcherLayout(site: string): Promise<GateWatcherLayout> {
  const layouts = await getGateWatcherLayouts();
  return layouts[layoutsKey(site)] ?? { ...DEFAULT_GATE_WATCHER_LAYOUT };
}

export async function patchGateWatcherLayout(
  site: string,
  patch: Partial<GateWatcherLayout>,
): Promise<GateWatcherLayout> {
  const key = layoutsKey(site);
  const layouts = await getGateWatcherLayouts();
  const next: GateWatcherLayout = {
    ...(layouts[key] ?? DEFAULT_GATE_WATCHER_LAYOUT),
    ...patch,
  };
  layouts[key] = next;
  await chrome.storage.local.set({ [STORAGE_KEYS.gateWatcherLayouts]: layouts });
  return next;
}
