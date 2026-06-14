export const storedGeminiApiKey = "trading-journal.gemini-api-key.v1";

export function loadStoredGeminiApiKey(storage: Storage = localStorage): string {
  try {
    return storage.getItem(storedGeminiApiKey)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveStoredGeminiApiKey(
  apiKey: string,
  storage: Storage = localStorage,
) {
  try {
    storage.setItem(storedGeminiApiKey, apiKey.trim());
  } catch {
    // Storage can fail in private mode or when quota is full. The app should keep running.
  }
}

export function clearStoredGeminiApiKey(storage: Storage = localStorage) {
  try {
    storage.removeItem(storedGeminiApiKey);
  } catch {
    // Ignore storage failures so the UI remains usable.
  }
}
