import { beforeEach, describe, expect, it } from "vitest";
import {
  clearStoredGeminiApiKey,
  loadStoredGeminiApiKey,
  saveStoredGeminiApiKey,
  storedGeminiApiKey,
} from "./geminiSettings";

describe("geminiSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a trimmed Gemini API key", () => {
    saveStoredGeminiApiKey("  gemini-test-key  ");

    expect(localStorage.getItem(storedGeminiApiKey)).toBe("gemini-test-key");
    expect(loadStoredGeminiApiKey()).toBe("gemini-test-key");
  });

  it("returns an empty string when storage is empty or unavailable", () => {
    expect(loadStoredGeminiApiKey()).toBe("");
  });

  it("clears the stored Gemini API key", () => {
    saveStoredGeminiApiKey("gemini-test-key");

    clearStoredGeminiApiKey();

    expect(loadStoredGeminiApiKey()).toBe("");
  });
});
