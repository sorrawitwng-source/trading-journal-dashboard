import { beforeEach, describe, expect, it } from "vitest";
import {
  clearStoredOpenAiApiKey,
  loadStoredOpenAiApiKey,
  saveStoredOpenAiApiKey,
  storedOpenAiApiKey,
} from "./openAiSettings";

describe("openAiSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a trimmed OpenAI API key", () => {
    saveStoredOpenAiApiKey("  sk-test-key  ");

    expect(localStorage.getItem(storedOpenAiApiKey)).toBe("sk-test-key");
    expect(loadStoredOpenAiApiKey()).toBe("sk-test-key");
  });

  it("returns an empty string when storage is empty or unavailable", () => {
    expect(loadStoredOpenAiApiKey()).toBe("");
  });

  it("clears the stored OpenAI API key", () => {
    saveStoredOpenAiApiKey("sk-test-key");

    clearStoredOpenAiApiKey();

    expect(loadStoredOpenAiApiKey()).toBe("");
  });
});
