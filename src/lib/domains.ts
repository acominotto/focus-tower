export function normalizeDomain(input: string): string {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/^www\./, "");
  value = value.split("/")[0] ?? "";
  value = value.split("?")[0] ?? "";
  return value;
}

export function domainFromUrl(url: string): string {
  try {
    return normalizeDomain(new URL(url).hostname);
  } catch {
    return normalizeDomain(url);
  }
}

export function hostMatchesBlockedDomain(host: string, blockedDomain: string): boolean {
  const normalizedHost = normalizeDomain(host);
  const normalizedBlocked = normalizeDomain(blockedDomain);
  return (
    normalizedHost === normalizedBlocked ||
    normalizedHost.endsWith(`.${normalizedBlocked}`)
  );
}
