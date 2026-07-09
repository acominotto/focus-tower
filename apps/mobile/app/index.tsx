import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  getLocale,
  initI18n,
  LOCALES,
  setLocale,
  t,
  type Locale,
  type Quote,
} from "@focus-tower/core";
import {
  getSelectedApps,
  presentAppPicker,
  requestAuthorization,
  setShieldsEnabled,
} from "@focus-tower/native-screen-time";
import { mobileBlockService } from "../src/adapters/mobile-block-service";

const SUPPORT_URL = "https://www.patreon.com/";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [shieldsEnabled, setShieldsEnabledState] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [apps, setApps] = useState<string[]>([]);
  const [gateQuote, setGateQuote] = useState<Quote | null>(null);

  const refresh = useCallback(async () => {
    const resolvedLocale = await getLocale();
    await initI18n(resolvedLocale);
    setLocaleState(resolvedLocale);
    setQuotes(await mobileBlockService.getCustomQuotes());
    const selected = await getSelectedApps();
    setApps(selected.map((app) => app.label ?? app.id));
    setGateQuote(await mobileBlockService.getRandomQuote());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onAuthorize() {
    const ok = await requestAuthorization();
    if (ok) await refresh();
  }

  async function onPickApps() {
    await presentAppPicker();
    await refresh();
  }

  async function onToggleShields(value: boolean) {
    setShieldsEnabledState(value);
    await setShieldsEnabled(value);
  }

  async function onChangeLocale(next: Locale) {
    await setLocale(next);
    await refresh();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#c9a227" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("meta.extensionName")}</Text>
      <Text style={styles.subtitle}>{t("popup.blockedSites")}</Text>

      <View style={styles.card}>
        <Pressable style={styles.button} onPress={() => void onAuthorize()}>
          <Text style={styles.buttonText}>Enable Screen Time access</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => void onPickApps()}>
          <Text style={styles.buttonText}>Choose apps to block</Text>
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.label}>Shields active</Text>
          <Switch value={shieldsEnabled} onValueChange={(v) => void onToggleShields(v)} />
        </View>
        {apps.length > 0 ? (
          apps.map((app) => (
            <Text key={app} style={styles.appItem}>
              {app}
            </Text>
          ))
        ) : (
          <Text style={styles.muted}>No apps selected yet.</Text>
        )}
      </View>

      <Text style={styles.section}>{t("popup.customQuotes")}</Text>
      <View style={styles.card}>
        {quotes.length === 0 ? (
          <Text style={styles.muted}>No custom quotes yet.</Text>
        ) : (
          quotes.map((quote, index) => (
            <Text key={`${quote.text}-${index}`} style={styles.quote}>
              "{quote.text}" — {quote.author}
            </Text>
          ))
        )}
      </View>

      <Text style={styles.section}>Gate preview</Text>
      <View style={styles.card}>
        {gateQuote ? (
          <>
            <Text style={styles.quote}>"{gateQuote.text}"</Text>
            <Text style={styles.muted}>— {gateQuote.author}</Text>
          </>
        ) : null}
      </View>

      <Text style={styles.section}>Language</Text>
      <View style={styles.card}>
        {LOCALES.map((code) => (
          <Pressable key={code} style={styles.localeRow} onPress={() => void onChangeLocale(code)}>
            <Text style={[styles.label, locale === code && styles.localeActive]}>{code.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.support} onPress={() => void Linking.openURL(SUPPORT_URL)}>
        <Text style={styles.supportText}>Support development on Patreon</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f1a" },
  container: { padding: 20, gap: 12, backgroundColor: "#0f0f1a" },
  title: { color: "#f5e6c8", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "#a89f8f", fontSize: 16 },
  section: { color: "#c9a227", fontSize: 14, fontWeight: "600", marginTop: 8 },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#2d2d44",
  },
  button: {
    backgroundColor: "#2d2d44",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: { color: "#f5e6c8", fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: "#f5e6c8", fontSize: 16 },
  appItem: { color: "#d4c5a9" },
  muted: { color: "#7a7285" },
  quote: { color: "#f5e6c8", fontSize: 16, lineHeight: 22 },
  localeRow: { paddingVertical: 6 },
  localeActive: { color: "#c9a227" },
  support: { marginTop: 16, marginBottom: 32, alignItems: "center" },
  supportText: { color: "#c9a227", textDecorationLine: "underline" },
});
