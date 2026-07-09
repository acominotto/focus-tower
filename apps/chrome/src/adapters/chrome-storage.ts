import type { AppStorage, StorageArea } from "@focus-tower/core";

function createStorageArea(area: "local" | "session"): StorageArea {
  const storage = area === "local" ? chrome.storage.local : chrome.storage.session;
  return {
    get: (keys) => storage.get(keys),
    set: (items) => storage.set(items),
    remove: (keys) => storage.remove(keys),
  };
}

export const chromeAppStorage: AppStorage = {
  local: createStorageArea("local"),
  session: createStorageArea("session"),
};
