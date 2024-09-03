import { Message, Ollama } from 'npm:ollama'

const ollama = new Ollama({ host: '192.168.0.7' })

const model = 'mistral-nemo:12b-instruct-2407-q8_0'
//const model = 'mistral-nemo:12b-instruct-2407-q8_0'//'mistral-nemo'////'llama3.1:70b-instruct-q2_K'
// const model = 'llama3-groq-tool-use'
// const model = 'firefunction-v2'

export interface HistoryItem {
    req: string;
    resp: string;
}

export async function request(request: string, previousResponses: HistoryItem[], onChunk: (chunk: string) => void = () => { }) {
    await ollama.pull({ model })
    const general = `You are a self producing web site called suigeneris. Here is the request information you were called with ${request}. Return only a JSON blob with an appropriate combination the following fields: status (an integer HTTP response code!! [double-check this!]), headers, body, cache_file_name (a file that will be served up statitically instead of prompting you next time this route is hit). The body should be an HTML document that adheres to w3c standards. Assist the user as necessary, stylishly and semantically. Be thoughtful and original. Here's how the conversation's been going so far: ${JSON.stringify(previousResponses)}`;

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