import { sendMessage } from "../lib/messaging.js";
import {
  applyDocumentI18n,
  formatBreakLabel,
  getCurrentLocale,
  initI18n,
  t,
} from "../lib/i18n/index.js";
import type { Quote, Response, SiteTimeStats } from "../lib/types.js";
import { loadBaradDur } from "./load-barad-dur.js";
import { useHighresTowerEye } from "./use-highres-tower-eye.js";

const params = new URLSearchParams(window.location.search);
const rawDomain = params.get("domain");

const domainEl = document.getElementById("domain");
const quoteTextEl = document.getElementById("quote-text");
const quoteAuthorEl = document.getElementById("quote-author");
const siteTimeEl = document.getElementById("site-time");
const siteTimeTotalEl = document.getElementById("site-time-total");
const siteTimeComparisonEl = document.getElementById("site-time-comparison");

let domain = "";

function applyBreakLabels(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-minutes]").forEach((button) => {
    const minutes = Number(button.dataset.minutes);
    button.textContent = formatBreakLabel(minutes);
  });
}

async function loadQuote(): Promise<void> {
  const response = await sendMessage<Response & { quote?: Quote }>({ type: "GET_RANDOM_QUOTE" });
  if (!response.ok || !response.quote || !quoteTextEl || !quoteAuthorEl) return;
  quoteTextEl.textContent = `"${response.quote.text}"`;
  quoteAuthorEl.textContent = response.quote.author;
}

async function loadSiteTime(): Promise<void> {
  const response = await sendMessage<Response & { siteTime?: SiteTimeStats }>({
    type: "GET_SITE_TIME",
    domain,
  });

  if (!response.ok || !response.siteTime || !siteTimeEl || !siteTimeTotalEl || !siteTimeComparisonEl) {
    return;
  }

  const { totalMinutes, totalLabel, comparison } = response.siteTime;
  if (totalMinutes < 1) return;

  siteTimeTotalEl.textContent = t("siteTime.spentOn", { duration: totalLabel, domain });
  siteTimeComparisonEl.textContent = comparison ?? "";
  siteTimeComparisonEl.hidden = !comparison;
  siteTimeEl.hidden = false;
}

function setButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll(".btn").forEach((button) => {
    (button as HTMLButtonElement).disabled = disabled;
  });
}

async function grantAccess(durationMs: number | null, label: string): Promise<void> {
  setButtonsDisabled(true);
  const response = await sendMessage({
    type: "GRANT_ALLOWANCE",
    domain,
    durationMs,
    label,
  });

  if (!response.ok) {
    setButtonsDisabled(false);
    return;
  }

  window.location.href = `https://${domain}`;
}

function requestGrant(durationMs: number | null, label: string): void {
  void grantAccess(durationMs, label);
}

document.querySelectorAll<HTMLButtonElement>("[data-minutes]").forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    requestGrant(minutes * 60 * 1000, `${minutes} min`);
  });
});

document.querySelector<HTMLButtonElement>("[data-session]")?.addEventListener("click", () => {
  requestGrant(null, "session");
});

document.getElementById("go-back")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "chrome://newtab";
  }
});

async function bootstrap(): Promise<void> {
  await initI18n();
  domain = rawDomain ?? t("blocked.thisSite");
  if (domainEl) domainEl.textContent = domain;
  applyDocumentI18n();
  applyBreakLabels();
  document.documentElement.lang = getCurrentLocale();

  await loadQuote();
  await loadSiteTime();

  const darkTower = document.getElementById("dark-tower");
  if (darkTower) {
    await loadBaradDur(darkTower);
    useHighresTowerEye(darkTower);
  }
}

void bootstrap();
