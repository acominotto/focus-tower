function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatCountdownMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`;
  }

  return `${minutes}:${padTwo(seconds)}`;
}

export function formatGateCounter(
  expiresAt: number | null,
  grantedAt: number,
  now = Date.now(),
): string {
  if (expiresAt !== null) {
    return formatCountdownMs(expiresAt - now);
  }

  return formatCountdownMs(now - grantedAt);
}
