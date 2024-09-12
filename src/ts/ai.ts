import "dotenv/config"
import Anthropic from "@anthropic-ai/sdk"
import { promises as fs } from "fs"
import { join } from "node:path"
import { output } from "./output"

interface AiQuery {
    response: { topics: string[] }
    tokens: number
}

class Ai {
    private client?: Anthropic
    private memoryFile: string = join(process.cwd(), ".", "memory.ai")

	public isAi: boolean = false
	public isAiRunning: boolean = false

    constructor() {
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY != "") {
            let apiKey = process.env.ANTHROPIC_API_KEY as string
            this.client = new Anthropic({ apiKey })
            this.isAi = true
        }
    }

    private formatResults(topics: string[]): string {
        return topics.map((entry) => `[${entry}]`).join(" ")
    }

    private async loadMemory(message: string): Promise<string> {
        try {
            await fs.access(this.memoryFile, fs.constants.R_OK)
            const data = await fs.readFile(this.memoryFile, "utf8")
            return `${message}. Please do not use any of the previous results: ${data}`
        } catch (err) {
            // [Info] No memory found
            return message
        }
    }

    private async saveMemory(data: string): Promise<void> {
        await fs.appendFile(this.memoryFile, data)
    }

    async askClaude(message: string): Promise<AiQuery | null> {
        if (this.isAi && this.isAiRunning == false) {
			this.isAiRunning = true

            message = await this.loadMemory(message)

            try {
                const completion = await this.client?.messages.create({
                    model: "claude-3-opus-20240229",
                    max_tokens: 1000,
                    system: 'You are a developer. Respond only with JSON data in the format { "topics": [] }',
                    messages: [{ role: "user", content: message }],
                })

				if (completion) {
					const textContent = completion.content
						.filter((block): block is { type: "text"; text: string } => block.type === "text")
						.map((block) => block.text)
						.join("\n")

					if (textContent) {
						const data = JSON.parse(textContent) as { topics: string[] }
						await this.saveMemory(this.formatResults(data.topics))
						this.isAiRunning = false

						return {
							response: data,
							tokens: completion.usage.input_tokens + completion.usage.output_tokens,
						}
					}
                }
            } catch (error) {
				this.isAiRunning = false
                output.console(`[CRITICAL] can not access the AI, ${error instanceof Error ? error.message : String(error)})`)
            }
        }

		this.isAiRunning = false
        return null
    }
}

export { Ai }
export type { AiQuery }
