import { de } from "./de.js";
import { en } from "./en.js";
import { es } from "./es.js";
import { fr } from "./fr.js";
import { it } from "./it.js";
import type { Locale, MessageCatalog } from "../types.js";

export const catalogs: Record<Locale, MessageCatalog> = {
  en,
  fr,
  it,
  de,
  es,
};

export function getCatalog(locale: Locale): MessageCatalog {
  return catalogs[locale];
}
