import { sendMessage } from "../lib/messaging.js";
import {
  applyDocumentI18n,
  getCurrentLocale,
  getMessages,
  initI18n,
  isLocale,
  LOCALES,
  t,
  type Locale,
} from "../lib/i18n/index.js";
import type { Quote, Response } from "../lib/types.js";

const siteList = document.getElementById("site-list");
const emptyState = document.getElementById("empty-state");
const errorEl = document.getElementById("error");
const form = document.getElementById("add-form") as HTMLFormElement;
const input = document.getElementById("site-input") as HTMLInputElement;
const quoteList = document.getElementById("quote-list");
const quoteEmpty = document.getElementById("quote-empty");
const quoteForm = document.getElementById("quote-form") as HTMLFormElement;
const quoteText = document.getElementById("quote-text-input") as HTMLInputElement;
const quoteAuthor = document.getElementById("quote-author-input") as HTMLInputElement;
const quoteError = document.getElementById("quote-error");
const resetSitesBtn = document.getElementById("reset-sites");
const languageSelect = document.getElementById("language-select") as HTMLSelectElement;

function showError(message: string): void {
  if (!errorEl) return;
  errorEl.hidden = !message;
  errorEl.textContent = message;
}

function showQuoteError(message: string): void {
  if (!quoteError) return;
  quoteError.hidden = !message;
  quoteError.textContent = message;
}

function renderLanguageOptions(selected: Locale): void {
  if (!languageSelect) return;
  const messages = getMessages();
  languageSelect.innerHTML = "";
  for (const locale of LOCALES) {
    const option = document.createElement("option");
    option.value = locale;
    option.textContent = messages.languageNames[locale];
    option.selected = locale === selected;
    languageSelect.append(option);
  }
}

function renderSites(sites: string[]): void {
  if (!siteList || !emptyState) return;
  siteList.innerHTML = "";

  if (!sites.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  for (const site of sites) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = site;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = t("popup.remove");
    removeBtn.addEventListener("click", async () => {
      const response = await sendMessage<Response & { sites?: string[] }>({
        type: "REMOVE_BLOCKED_SITE",
        domain: site,
      });
      if (response.ok && response.sites) renderSites(response.sites);
    });

    li.append(label, removeBtn);
    siteList.appendChild(li);
  }
}

function renderQuotes(quotes: Quote[]): void {
  if (!quoteList || !quoteEmpty) return;
  quoteList.innerHTML = "";

  if (!quotes.length) {
    quoteEmpty.hidden = false;
    return;
  }

  quoteEmpty.hidden = true;

  quotes.forEach((quote, index) => {
    const li = document.createElement("li");
    const body = document.createElement("div");
    body.className = "quote-item";

    const text = document.createElement("p");
    text.textContent = `"${quote.text}"`;

    const author = document.createElement("span");
    author.textContent = `— ${quote.author}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = t("popup.remove");
    removeBtn.addEventListener("click", async () => {
      const response = await sendMessage<Response & { quotes?: Quote[] }>({
        type: "REMOVE_CUSTOM_QUOTE",
        index,
      });
      if (response.ok && response.quotes) renderQuotes(response.quotes);
    });

    body.append(text, author);
    li.append(body, removeBtn);
    quoteList.appendChild(li);
  });
}

async function loadSites(): Promise<void> {
  const response = await sendMessage<Response & { sites?: string[] }>({ type: "GET_BLOCKED_SITES" });
  renderSites(response.ok ? (response.sites ?? []) : []);
}

async function loadQuotes(): Promise<void> {
  const response = await sendMessage<Response & { quotes?: Quote[] }>({ type: "GET_CUSTOM_QUOTES" });
  renderQuotes(response.ok ? (response.quotes ?? []) : []);
}

async function applyLanguage(locale: Locale): Promise<void> {
  await initI18n(locale);
  applyDocumentI18n();
  document.documentElement.lang = getCurrentLocale();
  renderLanguageOptions(locale);
  renderSites((await sendMessage<Response & { sites?: string[] }>({ type: "GET_BLOCKED_SITES" })).sites ?? []);
  renderQuotes(
    (await sendMessage<Response & { quotes?: Quote[] }>({ type: "GET_CUSTOM_QUOTES" })).quotes ?? [],
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const response = await sendMessage<Response & { sites?: string[] }>({
    type: "ADD_BLOCKED_SITE",
    domain: input.value.trim(),
  });

  if (!response.ok) {
    showError(response.error);
    return;
  }

  input.value = "";
  renderSites(response.sites ?? []);
});

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showQuoteError("");

  const response = await sendMessage<Response & { quotes?: Quote[] }>({
    type: "ADD_CUSTOM_QUOTE",
    quote: {
      text: quoteText.value.trim(),
      author: quoteAuthor.value.trim(),
    },
  });

  if (!response.ok) {
    showQuoteError(response.error);
    return;
  }

  quoteText.value = "";
  quoteAuthor.value = "";
  renderQuotes(response.quotes ?? []);
});

resetSitesBtn?.addEventListener("click", async () => {
  const response = await sendMessage<Response & { sites?: string[] }>({ type: "RESET_DEFAULT_SITES" });
  if (response.ok && response.sites) renderSites(response.sites);
});

languageSelect?.addEventListener("change", async () => {
  const locale = languageSelect.value;
  if (!isLocale(locale)) return;
  await sendMessage({ type: "SET_LANGUAGE", locale });
  await applyLanguage(locale);
});

async function bootstrap(): Promise<void> {
  const response = await sendMessage<Response & { locale?: string }>({ type: "GET_LANGUAGE" });
  const locale = response.ok && response.locale && isLocale(response.locale) ? response.locale : "en";
  await initI18n(locale);
  applyDocumentI18n();
  document.documentElement.lang = getCurrentLocale();
  renderLanguageOptions(locale);
  await loadSites();
  await loadQuotes();
}

void bootstrap();
