import fs from "fs"
import { join } from "node:path"
import { access, constants } from "node:fs/promises"
import { output } from "./output"

//--[ Interfaces ]-------------------------------------------------------------

interface IDiscordEvent {
    name: string
    frequency: number
    timeStamp: number
    updates: number
    channel: string
    mention: string

    isRun: () => boolean
    setNextEvent: () => void
    toJSON: () => object
}

interface IDiscordEvents {
    events: IDiscordEvent[]

    save: () => void
    load: () => Promise<void>
    add: (event: DiscordEvent) => void
}

//--[ Classes ]----------------------------------------------------------------

class DiscordEvent implements IDiscordEvent {
    name: string
    frequency: number
    timeStamp: number
    updates: number
    channel: string
    mention: string

    constructor(name: string, frequency: number, channel: string, mention?: string, timestamp?: number) {
        this.name = name
        this.channel = channel
        this.frequency = frequency * 1000
        this.timeStamp = timestamp || 0
        this.mention = mention || ""
        this.updates = 0

        if (this.timeStamp === 0) {
            this.setNextEvent()
        } else {
            output.console(`[Loaded Event] ${this.name} for: ${new Date(this.timeStamp).toLocaleString()}, on channel: ${this.channel}`)
        }
    }

    isRun = () => {
        return this.timeStamp < Date.now()
    }

    setNextEvent() {
        this.timeStamp = Date.now() + this.frequency
        this.updates += 1

        output.console(`[Setting Event] ${this.name} for: (${new Date(this.timeStamp).toLocaleString()})`)
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
                const event = new DiscordEvent(eventData.name, eventData.frequency, eventData.channel, eventData.timeStamp)
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
}

//--[ Exports ]----------------------------------------------------------------

export { DiscordEvents, DiscordEvent }
