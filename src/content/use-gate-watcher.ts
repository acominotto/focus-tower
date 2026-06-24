import { useTowerEye } from "../blocked/use-tower-eye.js";
import { formatGateCounter } from "../lib/gate-counter.js";
import { domainFromUrl } from "../lib/domains.js";
import { initI18n, t } from "../lib/i18n/index.js";
import { sendMessage } from "../lib/messaging.js";
import { STORAGE_KEYS } from "../lib/constants.js";
import type { GateStatus, Response } from "../lib/types.js";
import { WATCHER_EYE_SVG } from "./watcher-eye.js";

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

function createShadowHost(): { shadow: ShadowRoot; host: HTMLElement } {
  const existing = document.getElementById(HOST_ID);
  if (existing?.shadowRoot) {
    return { shadow: existing.shadowRoot, host: existing };
  }

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.appendChild(host);
  return { shadow: host.attachShadow({ mode: "closed" }), host };
}

function mountWatcher(gate: GateStatus): () => void {
  const { shadow, host } = createShadowHost();
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
      <span class="gate-watcher-eye">${WATCHER_EYE_SVG}</span>
    </button>
    <div class="gate-watcher-menu" role="menu" hidden>
      <button type="button" role="menuitem">${t("gate.restartGate")}</button>
    </div>
  `;
  shadow.appendChild(root);

  const trigger = root.querySelector<HTMLButtonElement>(".gate-watcher-trigger")!;
  const counter = root.querySelector<HTMLElement>(".gate-watcher-counter")!;
  const menu = root.querySelector<HTMLElement>(".gate-watcher-menu")!;
  const restartButton = menu.querySelector<HTMLButtonElement>("button")!;
  const stopEye = useTowerEye(root);

  let gateState = gate;
  let menuOpen = false;

  function updateCounter(): void {
    if (gateState.expiresAt !== null && gateState.expiresAt <= Date.now()) {
      window.location.reload();
      return;
    }

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

  trigger.addEventListener("click", () => {
    setMenuOpen(!menuOpen);
  });

  restartButton.addEventListener("click", () => {
    void restartGate();
  });

  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  document.addEventListener("keydown", onDocumentKeyDown, true);

  updateCounter();
  const intervalId = window.setInterval(updateCounter, 1000);

  return () => {
    window.clearInterval(intervalId);
    stopEye();
    document.removeEventListener("pointerdown", onDocumentPointerDown, true);
    document.removeEventListener("keydown", onDocumentKeyDown, true);
    document.getElementById(HOST_ID)?.remove();
  };
}

export async function useGateWatcher(): Promise<void> {
  if (isExtensionPage()) {
    return;
  }

  const domain = domainFromUrl(window.location.href);
  if (!domain) {
    return;
  }

  await initI18n();

  let cleanup: (() => void) | null = null;

  async function sync(): Promise<void> {
    const gate = await fetchGateStatus(domain);
    if (!gate) {
      cleanup?.();
      cleanup = null;
      return;
    }

    if (cleanup) {
      return;
    }

    cleanup = mountWatcher(gate);
  }

  await sync();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" && areaName !== "session") {
      return;
    }
    if (!changes[STORAGE_KEYS.allowances] && !changes[STORAGE_KEYS.blockedSites]) {
      return;
    }
    void sync();
  });
}
