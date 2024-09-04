import { Message } from "npm:ollama";
import { HistoryItem, request } from "./ask.ts";
import { mkdirp } from "npm:mkdirp";
import { basename, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/exists.ts";


async function stringifyRequest(req: Request): Promise<string> {
  return JSON.stringify({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
    body: req.body ? await req.text() : null,
  }, null, 2);
}
if (import.meta.main) {
  const listener = Deno.listen({
    port: 9090
  });
  const previousResponses: HistoryItem[] = [];
  Deno.serve(async (req) => {
    const thoughts = await Deno.readTextFile('thoughts.txt') ?? '';
    const url = new URL(req.url);
    let path = url.pathname;
    let cachedFile = `static${path}`;
    const isDir = existsSync(cachedFile, { isDirectory: true })
    let statusCode = 200;

    if (isDir) {
      path += "/index.php";
      cachedFile += "/index.php";
    }
    let cached = '';
    try {
      if (await Deno.lstat(cachedFile)) {
        cached = await Deno.readTextFile(cachedFile);
      }
    } catch (e) {
      // console.error(e + ' ');
    }
    let reqDescription = await stringifyRequest(req)
    console.log(reqDescription);
    let code = cached;
    let headers = {};
    if (!cached) {
      // code = cached;
      // } else {

      reqDescription += ` (you previously thought: ${thoughts})`;
      const response = await request(reqDescription, previousResponses);
      try {
        const parsed = JSON.parse(response);
        statusCode = parsed.statusCode;
        headers = parsed.headers;
        previousResponses.push({
          req: reqDescription,
          resp: parsed.thoughts,
        });
        while (previousResponses.length > 1) {
          previousResponses.shift();
        }
        console.log(parsed.thoughts);
        const reqPath = dirname(new URL(req.url).pathname);
        await mkdirp("static" + reqPath);
        console.log(`Caching response for ${path}`);
        await Deno.writeTextFile(cachedFile, parsed.body);
        await Deno.writeTextFile('thoughts.txt', parsed.thoughts);
        code = parsed.body;
        headers = parsed.headers;
      } catch (e) {
        console.error(e);
      }
    }
    // Pipe PHP files through PHP
    // if (path.endsWith(".php")) {
    //   const php = Deno.run({
    //     cmd: ["php", cachedFile],
    //     stdout: "piped",
    //     stderr: "piped",
    //   });
    //   const status = await php.status();
    //   console.log(status)
    //   if (status.code === 0) {
    //     const body = await php.output();
    //     php.close();
    //     return new Response(body, {
    //       status: 200,
    //       headers: headers,
    //     });
    //   }
    //   const error = await php.stderrOutput();
    //   php.close();
    //   return new Response(error, { status: 500, headers: { "Content-Type": "text/plain" } });
    // }

    return new Response(code, {
      status: statusCode ?? 200,
      headers: headers,
    });
  });
  listener.close();
}

