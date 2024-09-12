
declare interface JsonTopicFile {
    topics: string[];
}

declare interface UniqueTopicResult {
    unique: string[];
	selected: string;
    source: JsonTopicFile;
    dupes: JsonTopicFile;
}