import { existsSync, readFileSync, writeFileSync } from 'fs';
import { output } from "./output"
import { Ai } from "./ai"
import type {AiQuery} from "./ai"

const ai = new Ai()

interface TopicFile {
	topics: string[];
}

function getUnique(source: TopicFile, duplicates: TopicFile) {
	return source.topics.filter(topic => !duplicates.topics.includes(topic));
}

async function aiUpdate(sourcePath : string) : Promise<TopicFile | null> {
	output.console("[Info] Starting AI update")

	// Extract the text content from the message
	const query: AiQuery | null = await ai.askClaude(
			"Can you create a json file with 10 entries, these entries should be text fields and contain " +
			"a digital art topic. Something like: Neon underwater civilization, " +
			"impressionistic painting of woman eating an apple, or cartoon of a mouse being mischievous "+
			"try to keep the entries under 10 words in length. And please do not use any of the suggested topics. " +
			"randomize as much as possible. "
		)

	if (query?.response && query?.tokens) {
		output.console(`[Info] AI update complete, (Tokens Used = ${query.tokens})`)
		output.console(`[Info] Writing new projects file`)

		writeFileSync(sourcePath, JSON.stringify(query.response, null, 5));
		return query.response as TopicFile;
	}			

	return null;
}

async function selectRandomTopic(sourcePath: string, dupesPath: string) {
	if (!existsSync(dupesPath)) {
		writeFileSync(dupesPath, '{ "topics": [] }');
	}

	if (!existsSync(sourcePath)) {
		let data = await aiUpdate(sourcePath)
		if (!data) {
			output.console('[CRITICAL] Could not reach AI and no projects file')
			return null;
		}
	}

	try {
		let source = JSON.parse(readFileSync(sourcePath, 'utf-8')) as TopicFile;
		let dupes = JSON.parse(readFileSync(dupesPath, 'utf-8')) as TopicFile;
		let unique = getUnique(source, dupes);

		// Roll over
		if (unique.length === 0) {
			aiUpdate(sourcePath);
			//dupes = JSON.parse('{ "topics":[] }') as TopicFile;
			unique = getUnique(source, dupes);
		}

		// Randomly select a topic from the unique topics
		const random = Math.floor(Math.random() * unique.length);
		const selected = unique[random];

		dupes.topics.push(selected);
		writeFileSync(dupesPath, JSON.stringify(dupes, null, 2));

		return selected;
	} catch (err) {
		console.error(`Something went wrong: ${err}`);
		return null;
	}
}

export async function getTopic() {
	return await selectRandomTopic('projects.json', 'used.json');
}
