export interface StorageArea {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

export interface AppStorage {
  local: StorageArea;
  session: StorageArea;
}

export interface LocalePreferenceStore {
  get(): Promise<string | null>;
  set(locale: string): Promise<void>;
}

export interface LocaleDetector {
  detect(): string;
}
