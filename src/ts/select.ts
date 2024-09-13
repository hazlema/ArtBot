import { existsSync, readFileSync, writeFileSync } from "fs"
import type { AiQuery } from "./ai"
import { output } from "./output"
import { Ai } from "./ai"

const ai = new Ai()

// AI Stuff
async function fetchNewTopics(sourcePath: string, dupesPath: string): Promise<Boolean> {
    if (ai.isAi == true && ai.isAiRunning == false) {
        // Create new source file
        output.console(`[Info] Starting AI Topics update, this could take a minute... Events deferred for 1 minute...`)

        const query: AiQuery | null = await ai.askClaude(
            "Can you create a json file with 10 entries, these entries should be text fields and contain " +
            "a digital art topic. Something like: Neon underwater civilization, " +
            "impressionistic painting of woman eating an apple, or cartoon of a mouse being mischievous " +
            "try to keep the entries under 10 words in length. And please do not use any of the suggested topics. " +
            "randomize as much as possible. "
        )

        if (query?.response && query?.tokens) {
            output.console(`[Info] AI update complete, (Tokens Used = ${query.tokens})`)

            writeFileSync(sourcePath, JSON.stringify(query.response, null, 5))
            return true
        }

        return false
    }

    if (ai.isAi == false) {
        writeFileSync(dupesPath, '{ "topics": [] }')
        return true
    }

    // AI is Busy
    return false
}

// Load a topic file
function jsonTopicLoader(path: string): JsonTopicFile {
    if (existsSync(path)) {
        try {
            return JSON.parse(readFileSync(path, "utf-8")) as JsonTopicFile
        } catch (err) {
            console.error(`[CRITICAL] Could not load topics file. Error: ${err}`)
        }
    }

    return { topics: [] }
}

// Check if there is a unique topic
function getUniqueTopic(sourcePath: string, dupesPath: string): UniqueTopicResult {
    let src: JsonTopicFile = jsonTopicLoader(sourcePath)
    let dup: JsonTopicFile = jsonTopicLoader(dupesPath)
    let uni: string[] = src.topics.filter((topic) => !dup.topics.includes(topic))
    let sel: string = ""

    // Choose Randomly
    if (uni.length !== 0) {
        let random = Math.floor(Math.random() * uni.length)
        sel = uni[random]
    }

    return {
        unique: src.topics.filter((topic) => !dup.topics.includes(topic)),
        selected: sel,
        source: src,
        dupes: dup,
    }
}

// Entry point
async function getTopic(sourcePath: string, dupesPath: string): Promise<string> {
    let result: UniqueTopicResult = getUniqueTopic(sourcePath, dupesPath)

    if (ai.isAiRunning == false) {
        if (result.selected === "") {
            await fetchNewTopics(sourcePath, dupesPath).then(() => {
                result = getUniqueTopic(sourcePath, dupesPath)

                if (result.selected === "") {
                    output.console("[CRITICAL] Could not get new topics")
                    return null
                }
            })
        }
    }

	output.console(`[Info] Unique topics left: ${result.unique.length}`)
    result.dupes.topics.push(result.selected)
    writeFileSync(dupesPath, JSON.stringify(result.dupes, null, 5))

    return result.selected
}

export { getTopic }
