import { Ollama } from 'npm:ollama';
import { QdrantClient } from 'npm:@qdrant/js-client-rest';

// Initialize Ollama with the appropriate host
const ollama = new Ollama({ host: '192.168.0.7' });

// Specify the model you want to use
const model = 'mxbai-embed-large';

// Initialize Qdrant client
const client = new QdrantClient({ url: 'http://qdrant:6333' });

// Define the maximum chunk size (in characters)
const maxChunkSize = Math.floor(65535 / 2 / 2);

let globalIndex = 1; // Global counter for unique integer IDs

// Main function to scan, split, and embed files
async function processFiles(directoryPath = '.') {
    for await (const entry of Deno.readDir(directoryPath)) {
        if (entry.isFile) {
            console.log(`Processing file: ${entry.name}`);
            await embedFileInChunks(`${directoryPath}/${entry.name}`);
        } else if (entry.isDirectory) {
            console.log(`Processing directory: ${entry.name}`);
            await processFiles(`${directoryPath}/${entry.name}`);
        }
    }
}

// Function to process a single file using the Streams API
export async function embedFileInChunks(filePath: string) {
    console.log(`Processing file: ${filePath}`);
    const fileInfo = await Deno.stat(filePath);
    if (fileInfo.isDirectory) {
        console.error(`Error: ${filePath} is a directory, not a file.`);
        return; // Exit early if it's a directory
    }
    let fileStream;
    try {
        fileStream = await Deno.open(filePath, { read: true });
        const readableStream = fileStream.readable;
        const reader = readableStream.getReader();
        const decoder = new TextDecoder();
        let chunkBuffer = '';
        let chunkIndex = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (chunkBuffer.length > 0) {
                    await embed(chunkBuffer, filePath, ++chunkIndex); // Process any leftover buffer
                }
                break;
            }

            chunkBuffer += decoder.decode(value, { stream: true });

            // Process full chunks
            while (chunkBuffer.length >= maxChunkSize) {
                const chunk = chunkBuffer.slice(0, maxChunkSize);
                await embed(chunk, filePath, ++chunkIndex);
                chunkBuffer = chunkBuffer.slice(maxChunkSize); // Remove the processed chunk
            }
        }
    } catch (error) {
        console.error('Error processing file:', error);
    } finally {
        try {
            if (fileStream) {
                fileStream.close();
            }
        } catch (_closeError) {
            // console.error('Error closing file:', closeError);
        }
    }
}

// Function to embed a chunk and store it in Qdrant with a link back to the raw document
export async function embed(chunk: string, filePath: string, chunkIndex: number) {
    // Pull the model if it's not already available locally
    await ollama.pull({ model });

    // Generate embeddings for the chunk
    const response = await ollama.embed({
        model,
        input: chunk,
    });

    const embeddings = response.embeddings;

    // Define the collection name
    const collectionName = 'code_chunks';

    // Ensure the collection exists in Qdrant
    await ensureCollectionExists(collectionName, embeddings[0].length);

    // Construct the link back to the raw document
    const linkToRawDoc = `${encodeURIComponent(filePath)}#chunk-${chunkIndex}`;

    // Store the embeddings in Qdrant
    await storeEmbeddingsInQdrant(collectionName, embeddings, filePath, chunkIndex, linkToRawDoc);
}

// Helper function to ensure a Qdrant collection exists
async function ensureCollectionExists(collectionName: string, vectorSize: number) {
    try {
        await client.getCollection(collectionName);
    } catch (error) {
        if (error?.status === 404) {
            await client.createCollection(collectionName, {
                vectors: {
                    size: vectorSize,
                    distance: 'Cosine',
                },
            });
        } else {
            throw error;
        }
    }
}

// Helper function to store embeddings in Qdrant
async function storeEmbeddingsInQdrant(collectionName: string, embeddings: number[][], filePath: string, chunkIndex: number, linkToRawDoc: string) {
    const points = embeddings.map((vector) => ({
        id: globalIndex++,
        vector: vector,
        payload: {
            file_path: filePath,
            chunk_index: chunkIndex,
            link: decodeURIComponent(linkToRawDoc),
            created_at: new Date().toISOString(),
        },
    }));

    await client.upsert(collectionName, { points });
    console.log(`Stored ${points.length} embeddings in Qdrant collection '${collectionName}' from file ${filePath}, chunk ${chunkIndex}.`);
}

// Function to search for similar embeddings in Qdrant
async function searchEmbeddings(queryVector: number[], limit = 50) {
    const collectionName = 'code_chunks';

    try {
        const searchResults = await client.search(collectionName, {
            vector: queryVector,
            limit: limit,
        });

        console.log(`Found ${searchResults.length} similar embeddings:`);
        return searchResults.map((result) => {
            try {
                const filePath = decodeURIComponent(result?.payload?.file_path as string ?? '');
                const chunkIndex = result?.payload?.chunk_index as number;

                // Read the specific chunk from the original file
                const data = Deno.readTextFileSync(filePath);
                const chunks = data.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || [];
                const chunk = chunks[chunkIndex - 1];  // Get the appropriate chunk by index

                console.log(`- ${filePath} (chunk ${chunkIndex})`);

                return { ...result, chunk }; // Return only the chunk
            } catch (error) {
                return { error: error?.message ?? error };
            }
        });
    } catch (error) {
        console.error('Error searching embeddings:', error);
    }
}

// Function to seek similar chunks based on a query string
export async function seek(query: string) {
    await ollama.pull({ model });

    const response = await ollama.embed({
        model,
        input: query,
    });

    const queryVector = response.embeddings[0];

    const results = await searchEmbeddings(queryVector);
    return results?.map((result: any) => {
        try {
            const { file_path, chunk_index, link } = result;
            const data = Deno.readTextFileSync(file_path);
            const chunks = data.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || [];
            const chunk = chunks[chunk_index - 1];
            return { ...result, data: chunk, link };
        } catch (error) {
            return { ...result, error: error?.message ?? error };
        }
    });
}

export async function replenish() {
    return processFiles().catch(console.error);
}

await replenish();
