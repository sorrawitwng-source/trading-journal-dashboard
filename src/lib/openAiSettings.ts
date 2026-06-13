export const storedOpenAiApiKey = "trading-journal.openai-api-key.v1";

export function loadStoredOpenAiApiKey(storage: Storage = localStorage): string {
  try {
    return storage.getItem(storedOpenAiApiKey)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveStoredOpenAiApiKey(
  apiKey: string,
  storage: Storage = localStorage,
) {
  try {
    storage.setItem(storedOpenAiApiKey, apiKey.trim());
  } catch {
    // Storage can fail in private mode or when quota is full. The app should keep running.
  }
}

export function clearStoredOpenAiApiKey(storage: Storage = localStorage) {
  try {
    storage.removeItem(storedOpenAiApiKey);
  } catch {
    // Ignore storage failures so the UI remains usable.
  }
}
