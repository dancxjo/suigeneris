import { Node, ScriptTarget, SyntaxKind, createSourceFile, SourceFile } from "npm:typescript";
import { model, ollama } from "./ollama_client.ts";
import { TerminalSpinner } from "https://deno.land/x/spinners/mod.ts";


const threshold = 128;

export interface NodeDescriptor {
    node: Node;
    summary: string;
}

// Helper to load and transform the current script into an AST
async function generateASTFromScript(filePath: string): Promise<SourceFile> {
    const sourceCode = await Deno.readTextFile(filePath);
    const sourceFile = createSourceFile(
        filePath,
        sourceCode,
        ScriptTarget.ESNext,
        true
    );
    return sourceFile;
}

// Helper function to extract relevant properties and avoid circular structures
function extractNodeSummary(node: Node): string {
    // Only include certain relevant properties
    const text = node.getText ? node.getText() : undefined ?? '';
    const relevantProperties = {
        kind: SyntaxKind[node.kind],
        text: text.length > threshold ? text.substring(0, threshold) + '...' : text,
    };
    return JSON.stringify(relevantProperties, null, 2);
}

// Function to summarize a node
async function summarizeNode(asString: string): Promise<string> {
    const prompt = `This is a node in an AST for a Typescript script: ${asString}. Explain what the node does in relation to the entire program. Respond only with a string to place inline with the text of the code. Describe the code in terms of what it does in the program, not in terms of the code itself. For example, "Handles click events on the User Submission button." Do not say "This node represents..." or such terminology. Be concise and clear and don't reference the AST directly, only the code lying beneath it. If it is just a token or other such trivial item, simply return the text of the node itself.`;
    const response = await ollama.generate({
        model,
        prompt,
        options: { temperature: 1 },
    });

    // console.log(response.response);
    Deno.stdout.write(new TextEncoder().encode('.'));
    return response.response;
}

function requiresSummary(node: Node): boolean {
    const textLength = node.getText().length;
    // console.log(`Node kind: ${SyntaxKind[node.kind]}, Length: ${textLength}`);
    return textLength > threshold;
}


// Recursive function to summarize nodes starting from terminal nodes upwards
async function summarizeUp(node: Node): Promise<NodeDescriptor[]> {
    const descriptors: NodeDescriptor[] = [];

    for (const child of node.getChildren()) {
        const childNodes = await summarizeUp(child);
        descriptors.push(...childNodes);
    }

    const childSummaries = descriptors.map((descriptor) => descriptor.summary).join(" ");
    const asString = childSummaries.length > 0 ? `${SyntaxKind[node.kind]}: ${childSummaries}` : extractNodeSummary(node);
    if (requiresSummary(node)) {
        const terminalSpinner = new TerminalSpinner(`${SyntaxKind[node.kind]}...`);
        terminalSpinner.start();
        const summary = await summarizeNode(asString);
        const result = `// ${SyntaxKind[node.kind]}: ${summary}`
        terminalSpinner.succeed(result)
        descriptors.push({ node, summary: result });
    } else {
        descriptors.push({ node, summary: node.getText() });
    }

    return descriptors;
}

export async function describeNodesInScript(filePath: string): Promise<NodeDescriptor[]> {
    const tree = await generateASTFromScript(filePath);
    const nodes: NodeDescriptor[] = await summarizeUp(tree);
    return nodes;
}

export async function summarizeDown(summarizedNode: NodeDescriptor): Promise<NodeDescriptor[]> {
    const descriptors: NodeDescriptor[] = [];
    const summary = summarizedNode.summary;
    if (summary.startsWith('//')) {
        for (const child of summarizedNode.node.getChildren()) {
            const childSummary = await summarizeNode(`${SyntaxKind[child.kind]}: Context: ${summary}\n\n${extractNodeSummary(child)}`);
            const childNodes = await summarizeDown({ node: child, summary: childSummary });
            descriptors.push(...childNodes);
        }
    }

    return descriptors;
}

if (import.meta.main) {
    const filePath = import.meta.url.replace('file://', '');
    const descriptors = await describeNodesInScript(filePath);

    descriptors.sort((a, b) => a.node.pos - b.node.pos);
    for (const descriptor of descriptors) {
        if (descriptor.summary.startsWith('//')) {
            console.log(descriptor.summary);
        }
    }

    const insights = await summarizeDown(descriptors.find((d) => !d.node.parent)!);
    console.log(insights.map((i) => i.summary).join('\n'));

}