import { defineConfig } from "vitest/config";
import { createRequire } from "node:module";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const quoteFunction = require("./netlify/functions/quote.cjs") as {
  handler: (event: {
    queryStringParameters?: Record<string, string>;
  }) => Promise<{
    body?: string;
    headers?: Record<string, string>;
    statusCode?: number;
  }>;
};

export default defineConfig({
  base: "./",
  plugins: [react(), localQuoteApi()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});

function localQuoteApi(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url ?? "/", "http://localhost");

        if (
          requestUrl.pathname !== "/api/quote" &&
          requestUrl.pathname !== "/.netlify/functions/quote"
        ) {
          next();
          return;
        }

        try {
          const result = await quoteFunction.handler({
            queryStringParameters: Object.fromEntries(requestUrl.searchParams),
          });

          for (const [key, value] of Object.entries(result.headers ?? {})) {
            response.setHeader(key, value);
          }

          response.statusCode = result.statusCode ?? 500;
          response.end(result.body ?? "");
        } catch {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ error: "Quote unavailable" }));
        }
      });
    },
    name: "local-quote-api",
  };
}
