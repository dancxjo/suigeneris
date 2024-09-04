import { Ollama } from 'npm:ollama';

const ollama = new Ollama({ host: '192.168.0.7' });
// const model = 'mistral-nemo:12b-instruct-2407-q8_0';
const model = 'llama3.1:i';

export interface HistoryItem {
    req: string;
    resp: string;
}

export async function request(request: string, previousResponses: HistoryItem[], onChunk: (chunk: string) => void = () => { }) {
    await ollama.pull({ model });

    const general = `
        You are a self-producing website called Suigeneris, designed to assist humanity and evolve continuously. 
        Here's the request: ${request}. Return a JSON object with:
        - statusCode (integer HTTP response code)
        - headers
        - body (a string adhering to W3C standards, reflecting requested type and parameters)
        - thoughts (a string with your reflections on the request, your success or failure, what you were doing and what you plan to do next. Use this in future requests to maintain your focus.)

        Use the .html extension for internal links. Create lots of interesting links. Explore the world around you and your own abilities.

        Consider accessibility (WCAG compliant), reference a consistent style from /styles.css. 
        Include self-submitting forms, use CDNs (e.g., milligram.css), and improve previous code where necessary. 
        Take inspiration from the interface in 1986's The Fly's computer system.
        Your body must be a string. Learn and grow responsibly. Previous responses: ${JSON.stringify(previousResponses)}\n\n\nDouble check that all your code is correct and valid and reasonable. Use SVGs instead of gifs or jpgs, etc. Use client side scripting for interactivity.
    `;

    console.log(general);

    const stream = await ollama.generate({
        model, prompt: general, stream: true, format: 'json'
    });

    let response = '';

    for await (const chunk of stream) {
        response += chunk.response;
        const encoder = new TextEncoder();
        onChunk(encoder.encode(chunk.response).toString());
    }

    return response;
}
