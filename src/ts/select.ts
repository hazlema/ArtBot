import { existsSync, readFileSync, writeFileSync } from 'fs';

interface TopicFile {
	topics: string[];
}

function getUnique(source: TopicFile, duplicates: TopicFile) {
	return source.topics.filter(topic => !duplicates.topics.includes(topic));
}

function selectRandomTopic(sourcePath: string, dupesPath: string) {
	if (!existsSync(dupesPath)) {
		writeFileSync(dupesPath, '{ "topics": [] }');
	}

	if (!existsSync(sourcePath)) return null;

	try {
		let source = JSON.parse(readFileSync(sourcePath, 'utf-8')) as TopicFile;
		let dupes = JSON.parse(readFileSync(dupesPath, 'utf-8')) as TopicFile;
		let unique = getUnique(source, dupes);

		// Roll over
		if (unique.length === 0) {
			dupes = JSON.parse('{ "topics":[] }') as TopicFile;
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

export function getTopic() {
	return selectRandomTopic('projects.json', 'used.json');
}
