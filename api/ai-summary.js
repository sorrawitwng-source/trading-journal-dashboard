import aiSummaryFunction from "../netlify/functions/ai-summary.cjs";

export default async function handler(request, response) {
  const result = await aiSummaryFunction.handler({
    body:
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {}),
    httpMethod: request.method,
    queryStringParameters: request.query ?? {},
  });

  for (const [key, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(key, value);
  }

  response.status(result.statusCode ?? 500).send(result.body ?? "");
}
