import { Ollama } from 'npm:ollama';
export const ollama = new Ollama({ host: '192.168.0.7' });
export let model = 'mistral-nemo:12b-instruct-2407-q8_0';
// export let model = 'codellama:13b';
// export let model = 'mistral-nemo';
// const model = 'mistral-nemo'
// export let model = 'llava:13b';
// export let model = 'openchat';
// export let model = 'mistral';
export async function listModels() {
    return await ollama.list();
}

export async function setModel(newModel: string) {
    model = newModel;
    await ollama.pull({ model });
}
