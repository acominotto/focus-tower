import { useHighresTowerEye } from "../blocked/use-highres-tower-eye.js";
import { formatGateCounter } from "../lib/gate-counter.js";
import { domainFromUrl, normalizeDomain } from "../lib/domains.js";
import {
  getGateWatcherLayout,
  patchGateWatcherLayout,
  type GateWatcherLayout,
} from "../lib/gate-watcher-layout.js";
import { initI18n, t } from "../lib/i18n/index.js";
import { sendMessage } from "../lib/messaging.js";
import { STORAGE_KEYS } from "../lib/constants.js";
import type { GateStatus, Response } from "../lib/types.js";
import { useGateExpiry } from "./use-gate-expiry.js";
import { useGateWatcherDrag } from "./use-gate-watcher-drag.js";
import { mountWatcherEye } from "./watcher-eye.js";

const HOST_ID = "focus-tower-gate-watcher";

function isExtensionPage(): boolean {
  return window.location.protocol === "chrome-extension:";
}

export function isEventInsideGateWatcher(
  event: Pick<MouseEvent, "composedPath">,
  host: EventTarget,
): boolean {
  return event.composedPath().includes(host);
}

async function fetchGateStatus(domain: string): Promise<GateStatus | null> {
  const response = await sendMessage<Response & { gate?: GateStatus | null }>({
    type: "GET_GATE_STATUS",
    domain,
  });
  return response.ok ? (response.gate ?? null) : null;
}

function mountShadowHost(): { shadow: ShadowRoot; host: HTMLElement } {
  const existing = document.getElementById(HOST_ID);
  if (existing?.shadowRoot) {
    return { shadow: existing.shadowRoot, host: existing };
  }

  const host = document.createElement("div");
  host.id = HOST_ID;
  (document.body ?? document.documentElement).appendChild(host);
  return { shadow: host.attachShadow({ mode: "closed" }), host };
}

function requestExpireGate(domain: string): void {
  void sendMessage({ type: "EXPIRE_GATE", domain });
}

async function mountWatcher(
  gate: GateStatus,
  siteKey: string,
  layout: GateWatcherLayout,
): Promise<() => void> {
  const stopExpiry = useGateExpiry(gate, () => {
    requestExpireGate(gate.domain);
  });

  if (layout.hidden) {
    return stopExpiry;
  }

  const { shadow, host } = mountShadowHost();
  host.hidden = false;
  shadow.innerHTML = "";

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = chrome.runtime.getURL("content/gate-watcher.css");
  shadow.appendChild(style);

  const root = document.createElement("div");
  root.className = "gate-watcher";
  root.innerHTML = `
    <button
      class="gate-watcher-trigger"
      type="button"
      aria-expanded="false"
      aria-haspopup="menu"
      aria-label="${t("gate.controlsLabel")}"
    >
      <span class="gate-watcher-counter" aria-live="polite"></span>
      <span class="gate-watcher-eye" aria-hidden="true"></span>
    </button>
    <div class="gate-watcher-menu" role="menu" hidden>
      <button type="button" role="menuitem" data-action="restart">${t("gate.restartGate")}</button>
      <button type="button" role="menuitem" data-action="hide">${t("gate.hideEye")}</button>
    </div>
  `;
  shadow.appendChild(root);

  const trigger = root.querySelector<HTMLButtonElement>(".gate-watcher-trigger")!;
  const counter = root.querySelector<HTMLElement>(".gate-watcher-counter")!;
  const menu = root.querySelector<HTMLElement>(".gate-watcher-menu")!;
  const restartButton = menu.querySelector<HTMLButtonElement>('[data-action="restart"]')!;
  const hideButton = menu.querySelector<HTMLButtonElement>('[data-action="hide"]')!;
  const eyeMount = root.querySelector<HTMLElement>(".gate-watcher-eye")!;

  const mounted = await mountWatcherEye(eyeMount);
  const stopEye = mounted ? useHighresTowerEye(eyeMount) : () => {};

  let gateState = gate;
  let menuOpen = false;

  function updateCounter(): void {
    if (gateState.expiresAt === null) {
      counter.textContent = `${t("gate.sessionBreak")} ${formatGateCounter(null, gateState.grantedAt)}`;
      return;
    }

    counter.textContent = formatGateCounter(gateState.expiresAt, gateState.grantedAt);
  }

  function setMenuOpen(open: boolean): void {
    menuOpen = open;
    trigger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("open", open);
    menu.hidden = !open;
  }

  async function restartGate(): Promise<void> {
    setMenuOpen(false);
    try {
      const response = await sendMessage({ type: "REVOKE_ALLOWANCE", domain: gateState.domain });
      if (!response.ok) {
        return;
      }
    } catch {
      return;
    }
    window.location.reload();
  }

  async function hideEye(): Promise<void> {
    setMenuOpen(false);
    await patchGateWatcherLayout(siteKey, { hidden: true });
  }

  function onDocumentPointerDown(event: MouseEvent): void {
    if (!menuOpen) {
      return;
    }
    if (!isEventInsideGateWatcher(event, host)) {
      setMenuOpen(false);
    }
  }

  function onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  }

  const stopDrag = useGateWatcherDrag({
    shell: root,
    siteKey,
    trigger,
    layout,
    onTap: () => {
      setMenuOpen(!menuOpen);
    },
  });

  restartButton.addEventListener("click", () => {
    void restartGate();
  });

  hideButton.addEventListener("click", () => {
    void hideEye();
  });

  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  document.addEventListener("keydown", onDocumentKeyDown, true);

  const intervalId = window.setInterval(updateCounter, 1000);
  updateCounter();

  return () => {
    window.clearInterval(intervalId);
    stopDrag();
    stopEye();
    stopExpiry();
    document.removeEventListener("pointerdown", onDocumentPointerDown, true);
    document.removeEventListener("keydown", onDocumentKeyDown, true);
    document.getElementById(HOST_ID)?.remove();
  };
}

export async function useGateWatcher(): Promise<void> {
  if (isExtensionPage()) {
    return;
  }

  const siteKey = domainFromUrl(window.location.href);
  if (!siteKey) {
    return;
  }

  await initI18n();

  let cleanup: (() => void) | null = null;
  let trackedGate: GateStatus | null = null;

  async function remountWatcher(): Promise<void> {
    if (!trackedGate) {
      return;
    }

    cleanup?.();
    cleanup = null;
    const layout = await getGateWatcherLayout(siteKey);
    cleanup = await mountWatcher(trackedGate, siteKey, layout);
  }

  async function sync(): Promise<void> {
    const gate = await fetchGateStatus(siteKey);
    if (!gate) {
      if (
        trackedGate?.expiresAt !== null &&
        trackedGate?.expiresAt !== undefined &&
        trackedGate.expiresAt <= Date.now()
      ) {
        requestExpireGate(trackedGate.domain);
      }
      cleanup?.();
      cleanup = null;
      trackedGate = null;
      return;
    }

    trackedGate = gate;

    if (cleanup) {
      return;
    }

    const layout = await getGateWatcherLayout(siteKey);
    cleanup = await mountWatcher(gate, siteKey, layout);
  }

  await sync();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" && areaName !== "session") {
      return;
    }

    if (changes[STORAGE_KEYS.gateWatcherLayouts] && trackedGate) {
      const key = normalizeDomain(siteKey);
      const change = changes[STORAGE_KEYS.gateWatcherLayouts];
      const oldLayout = (change.oldValue as Record<string, GateWatcherLayout> | undefined)?.[key];
      const newLayout = (change.newValue as Record<string, GateWatcherLayout> | undefined)?.[key];
      if (oldLayout?.hidden !== newLayout?.hidden) {
        void remountWatcher();
      }
      return;
    }

    if (!changes[STORAGE_KEYS.allowances] && !changes[STORAGE_KEYS.blockedSites]) {
      return;
    }
    void sync();
  });
}
