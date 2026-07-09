import type { StorageArea, AppStorage, LocalePreferenceStore } from "@focus-tower/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sessionStore = new Map<string, string>();

function asyncStorageArea(prefix: string): StorageArea {
  return {
    async get(keys) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      const result: Record<string, unknown> = {};
      await Promise.all(
        keyList.map(async (key) => {
          const raw = await AsyncStorage.getItem(`${prefix}:${key}`);
          if (raw !== null) result[key] = JSON.parse(raw);
        }),
      );
      return result;
    },
    async set(items) {
      await Promise.all(
        Object.entries(items).map(([key, value]) =>
          AsyncStorage.setItem(`${prefix}:${key}`, JSON.stringify(value)),
        ),
      );
    },
    async remove(keys) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      await Promise.all(keyList.map((key) => AsyncStorage.removeItem(`${prefix}:${key}`)));
    },
  };
}

const memorySessionArea: StorageArea = {
  async get(keys) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const result: Record<string, unknown> = {};
    for (const key of keyList) {
      const raw = sessionStore.get(key);
      if (raw !== undefined) result[key] = JSON.parse(raw);
    }
    return result;
  },
  async set(items) {
    for (const [key, value] of Object.entries(items)) {
      sessionStore.set(key, JSON.stringify(value));
    }
  },
  async remove(keys) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) sessionStore.delete(key);
  },
};

export const mobileAppStorage: AppStorage = {
  local: asyncStorageArea("local"),
  session: memorySessionArea,
};

export const mobileLocaleStore: LocalePreferenceStore = {
  async get() {
    return AsyncStorage.getItem("locale");
  },
  async set(locale) {
    await AsyncStorage.setItem("locale", locale);
  },
};
