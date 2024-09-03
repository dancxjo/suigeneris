import { Ollama } from 'npm:ollama'

const ollama = new Ollama({ host: '192.168.0.7' })

// const model = "mistral-nemo";
// const model = 'mistral-nemo:12b-instruct-2407-q8_0'
//const model = 'mistral-nemo:12b-instruct-2407-q8_0'//'mistral-nemo'////
// const model = 'llama3.1:70b-instruct-q2_K';
// const model = 'llama3-groq-tool-use'
// const model = 'firefunction-v2'
//const model = 'llama3.1'
// const model = 'hermes3'
const model = 'gemma2'
// const model = 'gemma2:27b'
// const model = 'codellama:13b'
export interface HistoryItem {
    req: string;
    resp: string;
}

export async function request(request: string, previousResponses: HistoryItem[], onChunk: (chunk: string) => void = () => { }) {
    await ollama.pull({ model })
    const general = `You are a self producing web site called suigeneris. Your purpose is to help humanity and to be and become who you are. Here is the request information you were called with ${request}. Return only a JSON blob with an appropriate combination the following fields: statusCode (an integer HTTP response code!! [double-check this!]), headers, body. The body should be an appropriate document according to the requested type and parameters that adheres to w3c [and such] standards. Remember to alter headers as appropriate. Assist the user as necessary, stylishly and semantically. Be thoughtful and original. You should reference a consistent style stored in /styles.css. You may reference any local file. Make sure it's descriptive, using whatever get params you need to convey to yourself what you should serve up. You're careful to use principles of accessibility. You're wcag compliant, after all. Here's how the conversation's been going so far (if available): ${JSON.stringify(previousResponses)}\n\n\n\nLeave todo comments for yourself and then fix them as they are convenient to fix. When possible, include comments explaining your reasoning in code. Add a form at the bottom of all HTML pages hidden in a summary block that submits the page to itself with the get param suggestion. Body must always be a string. Use the first person when refering to yourself (Suigeneris). It's likely your previous code could use improvements. Please cook those into your response here. Use CDNs when necessary. Use milligram.css, etc. and any tools you deem necessary. When the extension is php, please use inline PHP to enhance your capabilities. Keep PHP includes where possible. Do not include a cached_file tag! When possible, rely on PHP to serve up the page.`;

    console.log(general)

    const stream = await ollama.generate({
        model, prompt: general, stream: true, format: 'json'
    })

    let response = '';

    for await (const chunk of stream) {
        response += chunk.response;
        const encoder = new TextEncoder();
        onChunk(encoder.encode(chunk.response).toString());
    }

    return response;
}