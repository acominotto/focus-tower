import type { GateStatus } from "../lib/types.js";

export function useGateExpiry(gate: GateStatus, onExpire: () => void): () => void {
  let expiring = false;

  const expire = (): void => {
    if (expiring) {
      return;
    }
    expiring = true;
    onExpire();
  };

  const tick = (): void => {
    if (gate.expiresAt !== null && gate.expiresAt <= Date.now()) {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      expire();
    }
  };

  let intervalId = window.setInterval(tick, 1000);
  let timeoutId = 0;
  if (gate.expiresAt !== null) {
    timeoutId = window.setTimeout(expire, Math.max(0, gate.expiresAt - Date.now()));
  }

  return () => {
    window.clearInterval(intervalId);
    window.clearTimeout(timeoutId);
  };
}
