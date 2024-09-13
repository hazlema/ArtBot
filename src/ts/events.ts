import fs from "fs"
import { join } from "node:path"
import { access, constants } from "node:fs/promises"
import { output } from "./output"
import Global from "./global"
import { type Channel, TextChannel } from "discord.js"

class DiscordEvent implements IDiscordEvent {
    name: string
    frequency: number
    timeStamp: number
    updates: number
    channel: string
    mention: string
    global: SingletonData;

    constructor(name: string, frequency: number, channel: string, mention?: string, timestamp?: number) {
        this.global = Global.getInstance();
        this.name = name
        this.channel = channel
        this.frequency = frequency * 1000
        this.timeStamp = timestamp || 0
        this.mention = mention || ""
        this.updates = 0

        if (this.timeStamp === 0) {
            this.setNextEvent()
        } else {
			let channelName = this.getChannelNameFromId(this.channel)
			output.console(`[Loaded Event] ${this.name} for (${new Date(this.timeStamp).toLocaleString()}), on channel: (${channelName})`)
		}
    }

	getChannelNameFromId(channelName: string) {
		if (this.global.client.channels.cache.has(this.channel)) {
			let channel : Channel | undefined = this.global.client.channels.cache.get(this.channel)
			if (channel instanceof TextChannel) {
				channelName = channel.name
			}
		}
	
		return channelName
	}

	isRun = () => {
        return this.timeStamp < Date.now()
    }

    setNextEvent() {
        this.timeStamp = Date.now() + this.frequency
        this.updates += 1

        output.console(`[Setting] ${this.name} for (${new Date(this.timeStamp).toLocaleString()})`)
    }

    setRetryEvent() {
        this.timeStamp = Date.now() + 60 * 1000
        this.updates -= 1

        output.console(`[Deferred] ${this.name} will run in 1m`)
    }

    toJSON() {
        return {
            name: this.name,
            channel: this.channel,
            frequency: this.frequency / 1000,
            timeStamp: this.timeStamp,
            updates: this.updates,
            mention: this.mention,
        }
    }
}

//===========================================================================

class DiscordEvents implements IDiscordEvents {
    events: DiscordEvent[]

    constructor() {
        this.events = []
	}

    save() {
        let path = join(process.cwd(), ".", "events.json")
        fs.writeFileSync(path, JSON.stringify(this.events, null, 5))

        output.console(`[Saving Data] ${path}`)
    }

    async load() {
        const path = join(process.cwd(), ".", "events.json")

        output.console(`[Loading Data] ${path}`)
        try {
            await access(path, constants.R_OK)
            const data = await fs.promises.readFile(path, "utf8")
            const parsed = JSON.parse(data)

            this.events = parsed.map((eventData: any) => {
                const event = new DiscordEvent(eventData.name, eventData.frequency, eventData.channel, eventData.mention, eventData.timeStamp)
                event.updates = eventData.updates
                return event
            })
        } catch (err: any) {
            if (err.code === "ENOENT") {
                output.console("[Notice] No previous events to load")
            } else if (err instanceof SyntaxError) {
                throw new Error(`Invalid JSON: ${err}`)
            } else {
                console.log(err.code)
                throw err
            }
        }
    }

    add(event: DiscordEvent) {
        this.events.push(event)
    }

    removeByChannel(channel: string) {
        this.events = this.events.filter((event) => event.channel !== channel)
        this.save()
    }
}

//--[ Exports ]----------------------------------------------------------------

export { DiscordEvents, DiscordEvent }
