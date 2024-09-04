import { HistoryItem, request } from "./ask.ts";
import { mkdirp } from "npm:mkdirp";
import { dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/exists.ts";

// Convert request object to string
async function stringifyRequest(req: Request): Promise<string> {
  return JSON.stringify({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.text() : null,
  }, null, 2);
}

// Check if the path is a directory and handle directory index
function resolveCachedFilePath(url: URL): { path: string, cachedFile: string } {
  let path = url.pathname;
  let cachedFile = `static${path}`;
  const isDir = existsSync(cachedFile, { isDirectory: true });

  if (isDir) {
    path += "/index.php";
    cachedFile += "/index.php";
  }
  return { path, cachedFile };
}

// Retrieve cached content from the file system
async function getCachedContent(cachedFile: string): Promise<string> {
  try {
    if (await Deno.lstat(cachedFile)) {
      return await Deno.readTextFile(cachedFile);
    }
  } catch (e) {
    //console.error("Error reading cached file:", e);
  }
  return '';
}

// Main handler for incoming requests
async function handleRequest(req: Request, previousResponses: HistoryItem[]): Promise<Response> {
  const url = new URL(req.url);
  const { path, cachedFile } = resolveCachedFilePath(url);

  // let cachedContent = await getCachedContent(cachedFile);
  let statusCode = 200;
  let headers = {};
  // let code = cachedContent;

  // If no cached content, generate a response from the AI model
  // if (!cachedContent) {
  const thoughts = await Deno.readTextFile('thoughts.txt').catch(() => '') || '';
  const reqDescription = await stringifyRequest(req);
  const fullRequestDescription = `${reqDescription} (you previously thought: ${thoughts})`;

  // Generate new response from the model
  const r = await demandResponse(fullRequestDescription, previousResponses, cachedFile, path);
  // }

  return new Response(r.body, {
    status: r.statusCode || 200,
    headers: r.headers ?? { "Content-Type": "text/html" },
  });
}

// Demand a response from the AI model
async function demandResponse(prompt: string, previousResponses: HistoryItem[], cachedFile: string, path: string): Promise<Partial<{ statusCode: number, headers: any, body: string, thoughts: string }>> {
  const response = await request(prompt, previousResponses);

  try {
    const parsed = JSON.parse(response);
    const { body, thoughts } = parsed;

    console.log({ parsed });

    // previousResponses.push({ req: response, resp: body });
    // if (previousResponses.length > 1) previousResponses.shift();

    // Cache the new response and thoughts
    await cacheResponse(body, thoughts, path, cachedFile);
    return parsed;
  } catch (e) {
    console.error("Error processing AI response:", e);
    return {};
  }
}

// Cache the generated response and thoughts
async function cacheResponse(body: string, thoughts: string, path: string, cachedFile: string) {
  await mkdirp("static" + dirname(path));
  console.log(`Caching response for ${path}`);
  await Deno.writeTextFile(cachedFile, body);
  await Deno.writeTextFile('thoughts.txt', thoughts);
}

// Entry point for the application
if (import.meta.main) {
  const listener = Deno.listen({ port: 9090 });
  const previousResponses: HistoryItem[] = [];

  Deno.serve(async (req) => await handleRequest(req, previousResponses));

  listener.close();
}
