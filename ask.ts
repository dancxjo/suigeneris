import { Ollama } from 'npm:ollama';
import { seek } from "./embed.ts";
const ollama = new Ollama({ host: '192.168.0.7' });
let model = 'mistral-nemo:12b-instruct-2407-q8_0';
// const model = 'llama3.1';
// const model = 'openchat';
// const model = 'mistral-nemo'
// export let model = 'llava:13b';

export async function listModels() {
    return await ollama.list();
}

export async function setModel(newModel: string) {
    model = newModel;
    await ollama.pull({ model });
}

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
    - Reference /styles.css for consistent design. Base everything on milligram.css and good semantics.
    - Use SVGs for images where possible.
    - Look for ways to improve previously cached versions.
    - Ensure all code is valid, correct, and reasonable.
    - In a footer of all HTML responses, insert an unobtrusive, self-submitting form containing one single line text field that appends a query parameter to the URL. The user will use this to communicate with you directly to guide your growth.

    Double-check your output and learn and grow responsibly. You must return only a JSON object with the above keys. Be creative and thoughtful in your responses.
`;

    const search = await seek(general);
    const prompt = `${general}\n\nThis context from your own source code may help you: ${JSON.stringify(search)}`;
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
