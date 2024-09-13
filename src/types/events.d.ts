declare interface IDiscordEvent {
    name: string
    frequency: number
    timeStamp: number
    updates: number
    channel: string
    mention: string

    getChannelNameFromId: (channelId: string) => string
	isRun: () => boolean
    setNextEvent: () => void
    toJSON: () => object
}

declare interface IDiscordEvents {
    events: IDiscordEvent[]

    save: () => void
    load: () => Promise<void>
    add: (event: DiscordEvent) => void
	removeByChannel: (channel: string) => void
}
	

