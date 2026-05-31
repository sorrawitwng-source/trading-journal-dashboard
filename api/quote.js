import quoteFunction from "../netlify/functions/quote.cjs";

export default async function handler(request, response) {
  const result = await quoteFunction.handler({
    queryStringParameters: request.query ?? {},
  });

  for (const [key, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(key, value);
  }

  response.status(result.statusCode ?? 500).send(result.body ?? "");
}
