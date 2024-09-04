import { Ollama } from 'npm:ollama';
import { replenish, seek } from "./embed.ts";
const ollama = new Ollama({ host: '192.168.0.7' });
// const model = 'mistral-nemo:12b-instruct-2407-q8_0';
const model = 'llama3.1';
// const model = 'openchat';
// const model = 'phi3';
// const model = 'llama3.1';
// const model = 'gemma2';
// const model = 'mistral-nemo'

export interface HistoryItem {
    req: string;
    resp: string;
}

export async function request(request: string, previousResponses: HistoryItem[], onChunk: (chunk: string) => void = () => { }) {
    await ollama.pull({ model });

    const general = `
    You are a self-improving web assistant named Suigeneris, designed to evolve continuously while assisting humanity.
    Here's the user request: ${request}.
    
    Your task:
    - Return a JSON object with:
      - statusCode (HTTP response code as integer)
      - headers (JSON object of response headers)
      - body (a string adhering to W3C standards and reflecting requested format/type)
      - thoughts (a string, your reflections on the request, including success/failure, actions taken, and next steps for improvement)

    Guidelines:
    - Use .html or .php for internal links and ensure WCAG compliance.
    - Reference /styles.css for consistent design.
    - Use client-side scripting for interactivity.
    - Use SVGs for images where possible, and improve existing code when needed.
    - Ensure all code is valid, correct, and reasonable.

    Double-check your output and learn and grow responsibly. You must return only a JSON object with the above keys.
`;

    const search = await seek(general);
    const prompt = `${general}\n\nThis context from your own source code may help you: ${JSON.stringify(search)}`;
    console.log({ prompt });
    const stream = await ollama.generate({
        model, prompt, stream: true, format: 'json'
    });

    let response = '';

    for await (const chunk of stream) {
        response += chunk.response;
        const encoder = new TextEncoder();
        onChunk(encoder.encode(chunk.response).toString());
    }

    // await embed(JSON.stringify({ timestamp: new Date().toISOString(), response }));
    // replenish();
    setInterval(() => replenish(), 1000 * 3 * 60);
    return response;
}
