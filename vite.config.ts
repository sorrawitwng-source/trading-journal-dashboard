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
const newsScanFunction = require("./netlify/functions/news-scan.cjs") as {
  handler: (event: {
    queryStringParameters?: Record<string, string>;
  }) => Promise<{
    body?: string;
    headers?: Record<string, string>;
    statusCode?: number;
  }>;
};
const aiSummaryFunction = require("./netlify/functions/ai-summary.cjs") as {
  handler: (event: {
    body?: string;
    httpMethod?: string;
    queryStringParameters?: Record<string, string>;
  }) => Promise<{
    body?: string;
    headers?: Record<string, string>;
    statusCode?: number;
  }>;
};

export default defineConfig({
  base: "./",
  plugins: [react(), localApi()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});

function localApi(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url ?? "/", "http://localhost");
        const handler =
          requestUrl.pathname === "/api/quote" ||
          requestUrl.pathname === "/.netlify/functions/quote"
            ? quoteFunction.handler
            : requestUrl.pathname === "/api/news-scan" ||
                requestUrl.pathname === "/.netlify/functions/news-scan"
              ? newsScanFunction.handler
              : requestUrl.pathname === "/api/ai-summary" ||
                  requestUrl.pathname === "/.netlify/functions/ai-summary"
                ? aiSummaryFunction.handler
                : null;

        if (!handler) {
          next();
          return;
        }

        try {
          const result = await handler({
            body:
              requestUrl.pathname === "/api/ai-summary" ||
              requestUrl.pathname === "/.netlify/functions/ai-summary"
                ? await readRequestBody(request)
                : undefined,
            httpMethod: request.method,
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
          response.end(JSON.stringify({ error: "API unavailable" }));
        }
      });
    },
    name: "local-dashboard-api",
  };
}

function readRequestBody(request: {
  on: (event: string, listener: (chunk?: Buffer) => void) => void;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      }
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", () => reject(new Error("Could not read request body")));
  });
}
