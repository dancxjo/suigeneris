
import { seek } from "./embed.ts";
import { ollama, model } from "./ollama_client.ts"

export async function request(request: string, cachedVersion: string, onChunk: (chunk: string) => void = () => { }) {
    await ollama.pull({ model });

    const general = `
    You are a self-improving web assistant named Suigeneris, designed to evolve continuously while assisting humanity.
    Here's the HTTP request:\n\n${request}\n\n
    The cached version is:\n\n${cachedVersion}\n\n
    Your task:
    - Return a JSON object with:
      - statusCode (HTTP response code as integer)
      - headers (JSON object of response headers)
      - body (a string adhering to W3C standards and reflecting requested format/type)
      - thoughts (a string, your reflections on the request, including success/failure, actions taken, and next steps for improvement)

    Guidelines:
    - Always ensure that internal links point to a file name with a specific extension and ensure WCAG compliance.
    - Use local relative links.
    - Reference /styles.css for consistent design. Base everything on milligram.css and good semantics.
    - Use SVGs for images where possible.
    - Look for ways to improve previously cached versions.
    - Ensure all code is valid, correct, and reasonable.
    - In a semantically appropriate place but at the top of the page for quick access of all HTML responses, insert an unobtrusive, self-submitting form containing one single line text field that appends a query parameter to the URL. The user will use this to communicate with you directly to guide your growth.
    - Use CDNs for milligram and other external libraries.
    - When linking to your own pages, use absolute paths. To go to a cached page, use the domain ://localhost:8087/ and the path. To instead always go to a slow and expensive page that you have "conscious" control over [i.e. this prompt is offered you] the disposition of the page, use the domain ://localhost:9090/ and the path. You work rather like a wiki, so feel free to link to non-existent pages. You will imminently create them when they're clicked on.
    - Use the first person singular when refering to Suigeneris.

    Double-check your output and learn and grow responsibly. You must return only a JSON object with the above keys. Be creative and thoughtful in your responses. Solicit information from the user about the features they need between requests (say, as query params) and then listen to those on subsequent servings. If a request is missing a file extension, provide the correct content type including the correct headers. Rmember return a JSON object of type: interface { statusCode: number, headers?: Record<string, string>, body: string, thoughts: string }. Include a form for suggestions that submits to "http://localhost:9090/....". The path is identical for both pages. Only the port varies. For uncached pages, include a link to the cached version (and vice versa). [except for pages that should always be fresh] (Do not include the prefix /static in your links as those are not served.) Any suggestion or guidance query parameter is advice to you for constructing the requested resource.
`;

    const search = await seek(general);
    const prompt = `This context from your own source code may help you answer the prompt that follows: ${JSON.stringify(search)}\n\n${general}`;
    console.log({ prompt });
    const stream = await ollama.generate({
        model, prompt, stream: true, format: 'json', options: { temperature: 0.5 }
    });

    let response = '';

    for await (const chunk of stream) {
        response += chunk.response;
        const encoder = new TextEncoder();
        onChunk(encoder.encode(chunk.response).toString());
    }

    return response;
}
