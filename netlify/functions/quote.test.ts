import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { _test } = require("./quote.cjs") as {
  _test: {
    parseFinnhubQuote: (payload: unknown, fallbackSymbol: string) => unknown;
    parseStooqCsvQuote: (payload: string, fallbackSymbol: string) => unknown;
    toFinnhubSymbol: (symbol: string) => string;
    toStooqSymbol: (symbol: string) => string;
  };
};

describe("quote provider helpers", () => {
  it("maps Yahoo-style US symbols to Finnhub symbols", () => {
    expect(_test.toFinnhubSymbol("AAPL")).toBe("AAPL");
    expect(_test.toFinnhubSymbol("BRK-B")).toBe("BRK.B");
  });

  it("maps app symbols to Stooq symbols", () => {
    expect(_test.toStooqSymbol("AAPL")).toBe("aapl.us");
    expect(_test.toStooqSymbol("BRK-B")).toBe("brk-b.us");
    expect(_test.toStooqSymbol("PTTGC.BK")).toBe("pttgc.th");
  });

  it("parses Finnhub quote payloads", () => {
    expect(
      _test.parseFinnhubQuote({ c: 261.74, h: 263, l: 260 }, "AAPL"),
    ).toEqual({
      currency: "USD",
      exchangeName: "Finnhub",
      price: 261.74,
      providerSymbol: "AAPL",
      source: "finnhub",
    });
  });

  it("parses Stooq quote CSV payloads", () => {
    const csv = [
      "Symbol,Date,Time,Open,High,Low,Close,Volume",
      "aapl.us,2026-05-28,22:00:00,260.00,263.00,259.50,261.74,100",
    ].join("\n");

    expect(_test.parseStooqCsvQuote(csv, "aapl.us")).toEqual({
      currency: "USD",
      exchangeName: "Stooq",
      price: 261.74,
      providerSymbol: "aapl.us",
      source: "stooq",
    });
  });
});
