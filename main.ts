import { Message } from "npm:ollama";
import { HistoryItem, request } from "./ask.ts";

async function stringifyRequest(req: Request): Promise<string> {
  return JSON.stringify({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.text() : null,
  }, null, 2);
}
if (import.meta.main) {
  const listener = Deno.listen({ port: 8082 });
  const previousResponses: HistoryItem[] = [];
  Deno.serve(async (req) => {
    const reqDescription = await stringifyRequest(req)
    console.log(reqDescription);
    const response = await request(reqDescription, previousResponses);
    try {
      const parsed = JSON.parse(response);
      previousResponses.push({
        req: reqDescription,
        resp: response
      });
      while (previousResponses.length > 5) {
        previousResponses.shift();
      }
      return new Response(parsed.body, {
        status: parsed.status,
        headers: parsed.headers,
      });
    } catch (e) {
      console.error(e);
    }
    return new Response(response);
  });
  listener.close();
}

