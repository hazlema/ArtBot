import { promises as fs } from "fs"
import "dotenv/config"
import Anthropic from "@anthropic-ai/sdk"
import { join } from "node:path"
import { output } from "./output"
interface AiQuery {
    response: { topics: string[] }
    tokens: number
}

class Ai {
    private client: Anthropic
    private memoryFile: string = join(process.cwd(), ".", "memory.ai")

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
			output.console(`[CRITICAL] ANTHROPIC_API_KEY is not set in the .env file`);
        }
        this.client = new Anthropic({ apiKey })
    }

    private formatResults(topics: string[]): string {
        return topics.map(entry => `[${entry}]`).join(' ')
    }

    private async loadMemory(message: string): Promise<string> {
        output.console("[Info] Loading Memory")
        try {
            await fs.access(this.memoryFile, fs.constants.R_OK)
            const data = await fs.readFile(this.memoryFile, "utf8")
            return `${message}. Please do not use any of the previous results: ${data}`
        } catch (err) {
            output.console("[Info] No memory found")
            return message
        }
    }

    private async saveMemory(data: string): Promise<void> {
        output.console("[Info] Saving Memory")
        await fs.appendFile(this.memoryFile, data)
    }

    async askClaude(message: string): Promise<AiQuery | null> {
        message = await this.loadMemory(message)

        output.console("[Info] Querying Server")

        try {
            const completion = await this.client.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1000,
                system: 'You are a developer. Respond only with JSON data in the format { "topics": [] }',
                messages: [{ role: "user", content: message }],
            })

            const textContent = completion.content
                .filter((block): block is { type: "text"; text: string } => block.type === "text")
                .map(block => block.text)
                .join("\n")

            if (textContent) {
                const data = JSON.parse(textContent) as { topics: string[] }
                await this.saveMemory(this.formatResults(data.topics))

                return { 
                    response: data, 
                    tokens: completion.usage.input_tokens +  completion.usage.output_tokens 
                }
            }
        } catch (error) {
			output.console(`[CRITICAL] can not access the AI, ${error instanceof Error ? error.message : String(error)})`);
        }

        return null
    }
}

// const ai = new Ai()
// output.console("[Info] Starting AI update")
// // Extract the text content from the message
// const query: AiQuery | null = await ai.askClaude(
//         "Can you create a json file with 10 entries, these entries should be text fields and contain " +
//         "a digital art topic. Something like: Neon underwater civilization, " +
//         "impressionistic painting of woman eating an apple, or cartoon of a mouse being mischievous "+
//         "try to keep the entries under 10 words in length. And please do not use any of the suggested topics. " +
//         "randomize as much as possible. "
//     )
// if (query?.response && query?.tokens) {
//     output.console(`[Info] AI update complete, (Tokens Used = ${query.tokens})`)
//     output.console(JSON.stringify(query, null, 5))
// }

export { Ai }
export type { AiQuery }

