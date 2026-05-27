import { beforeEach, describe, expect, it } from "vitest";
import { createPosition } from "./portfolio";
import {
  loadStoredPositions,
  saveStoredPositions,
  storedPositionsKey,
} from "./positionsStorage";
import { stockUniverse } from "../data/stocks";

describe("positionsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads portfolio positions", () => {
    const positions = [
      createPosition("AAPL", 150, stockUniverse),
      createPosition("PTTGC", 36, stockUniverse),
    ];

    saveStoredPositions(positions);

    expect(loadStoredPositions()).toEqual(positions);
  });

  it("returns an empty list when storage is empty or invalid", () => {
    expect(loadStoredPositions()).toEqual([]);

    localStorage.setItem(storedPositionsKey, "{bad json");

    expect(loadStoredPositions()).toEqual([]);
  });
});
