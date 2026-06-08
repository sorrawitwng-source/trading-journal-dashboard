import newsScanFunction from "../netlify/functions/news-scan.cjs";

export default async function handler(request, response) {
  const result = await newsScanFunction.handler({
    queryStringParameters: request.query ?? {},
  });

  for (const [key, value] of Object.entries(result.headers ?? {})) {
    response.setHeader(key, value);
  }

  response.status(result.statusCode ?? 500).send(result.body ?? "");
}
