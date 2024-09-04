import { Ollama } from 'npm:ollama';
import { QdrantClient } from 'npm:@qdrant/js-client-rest';

// Initialize Ollama with the appropriate host
const ollama = new Ollama({ host: '192.168.0.7' });

// Specify the model you want to use
const model = 'mxbai-embed-large';

// Initialize Qdrant client
const client = new QdrantClient({ url: 'http://qdrant:6333' });

// Directory to scan for files
const directoryPath = '.';

// Define the maximum chunk size (in characters)
const maxChunkSize = 2048; // For example, 1000 characters per chunk

let globalIndex = 1; // Global counter for unique integer IDs

// Main function to scan, split, and embed files
async function processFiles(directoryPath = '.') {
    for await (const entry of Deno.readDir(directoryPath)) {
        if (entry.isFile) {
            console.log(`Processing file: ${entry.name}`);
            await processFile(`${directoryPath}/${entry.name}`);
        }
        if (entry.isDirectory) {
            console.log(`Processing directory: ${entry.name}`);
            await processFiles(`${directoryPath}/${entry.name}`);
        }
    }
}

// Function to process a single file using the Streams API
async function processFile(filePath: string) {
    let fileStream;
    try {
        fileStream = await Deno.open(filePath, { read: true });
        const readableStream = fileStream.readable;
        const reader = readableStream.getReader();
        let decoder = new TextDecoder();
        let chunkBuffer = '';
        let chunkIndex = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (chunkBuffer.length > 0) {
                    await embed(chunkBuffer, filePath, ++chunkIndex);
                }
                break;
            }

            chunkBuffer += decoder.decode(value, { stream: true });

            while (chunkBuffer.length >= maxChunkSize) {
                const chunk = chunkBuffer.slice(0, maxChunkSize);
                await embed(chunk, filePath, ++chunkIndex);
                chunkBuffer = chunkBuffer.slice(maxChunkSize);
            }
        }
    } catch (error) {
        console.error('Error processing file:', error);
    } finally {
        try {
            if (fileStream) {
                fileStream.close();
            }
        } catch (closeError) {
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
        console.log(`Collection '${collectionName}' already exists.`);
    } catch (error) {
        if (error?.status === 404) {
            // Create the collection if it does not exist
            await client.createCollection(collectionName, {
                vectors: {
                    size: vectorSize, // Set the vector size based on the embedding size
                    distance: 'Cosine', // Choose a distance metric like Cosine, Euclidean, etc.
                },
            });
            console.log(`Created collection '${collectionName}' in Qdrant.`);
        } else {
            throw error; // If it's another error, rethrow it
        }
    }
}

// Helper function to store embeddings in Qdrant
async function storeEmbeddingsInQdrant(collectionName: string, embeddings: number[][], filePath: string, chunkIndex: number, linkToRawDoc: string) {
    const points = embeddings.map((vector) => ({
        id: globalIndex++, // Use a global incrementing integer for IDs
        vector: vector,
        payload: {
            file_path: filePath, // Store the file path
            chunk_index: chunkIndex, // Store the chunk index
            link: decodeURIComponent(linkToRawDoc), // Store the link to the raw document
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
        return searchResults.map((result, index) => {
            console.log(`Result ${index + 1}:`);
            console.log(`ID: ${result.id}`);
            console.log(`Score: ${result.score}`);
            console.log(`Payload: ${JSON.stringify(result.payload)}`);
            console.log('---');
            return result.payload;
        })//.filter((result) => !!result && 'error'! in result); // Filter out low-scoring results
    } catch (error) {
        console.error('Error searching embeddings:', error);
    }
}

// Function to seek similar chunks based on a query string
export async function seek(query: string) {
    // Pull the model if it's not already available locally
    await ollama.pull({ model });

    // Generate embeddings for the query
    const response = await ollama.embed({
        model,
        input: query,
    });

    const queryVector = response.embeddings[0];

    // Search for similar embeddings in Qdrant
    const results = await searchEmbeddings(queryVector);
    return results?.map((result: any) => {
        try {
            const { file_path, chunk_index, link } = result;

            // Read the specific chunk from the original file
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
    // Start the processing
    return processFiles().catch(console.error);
}

replenish();