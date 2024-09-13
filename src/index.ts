/* Discord */

import "dotenv/config"
import { Guild, REST, Routes, User } from "discord.js"
import { ChatInputCommandInteraction, Client, Events, GatewayIntentBits } from "discord.js"

/* ArtBot */
import { DiscordEvents, DiscordEvent } from "./ts/events"
import { output } from "./ts/output"
import { getTopic } from "./ts/select"
import { slashCmds } from "./ts/slashCmds"
import { BotMessages } from "./ts/botmessages"
import { Ai } from "./ts/ai"
import Global from "./ts/global"

const global = new Global()

const ai = new Ai()

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN_ID as string)

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
})

let myEvents = new DiscordEvents()


/*
 * Channel Messages / Broadcasts
 */
async function broadcast(channelID: string, name: string, mention: string, start: Date, end: Date) {
	if (client.channels.cache.has(channelID)) {
		let channel = client.channels.cache.get(channelID)
		
		if (channel) {
			let topic = await getTopic(ai.isAi ? "ai-topics.json" : "topics.json", "used.json");

			if (topic != null) {
				channel.send({ embeds: [BotMessages.eventPosted(name, topic as string, mention, start, end)] })
				return true
			} else {
				output.console("[Error] Updating Topics (will retry)")
				return false
			}
		}

	}

	output.console(`[Error] Channel (${channelID}), for Event (${name}) not found`)
	output.console(`[Error] Removing channel from events`)
	myEvents.removeByChannel(channelID)
	return true
}

/*
 * applicationCommand: /artbot-addcontest
 */
function addContest(intr: ChatInputCommandInteraction) {
    let optName: string | null = intr.options.getString("name")
    let optFrequency: number | null = intr.options.getInteger("frequency")
    let optMention: string = ""
    let channel: string = intr.channelId

    if (optName && optFrequency && channel) {
        let mentionOpt: string | null = intr.options.getString("mention")
        if (mentionOpt) optMention = mentionOpt

        output.console(`[Add Event] ${optName} (Every ${optFrequency} hours, for channel ${channel})`)
        intr.reply({ embeds: [BotMessages.eventAdded(optName, optFrequency, channel)], ephemeral: true })

        myEvents.add(new DiscordEvent(optName, 60 * 60 * optFrequency, channel, optMention, Date.now()))
    }
}

/*
 * applicationCommand: /artbot-deletecontest
 */
function delContest(intr: ChatInputCommandInteraction) {
    let channel: string = intr.channelId

    if (channel) {
        myEvents.removeByChannel(channel)
        intr.reply({ embeds: [BotMessages.eventRemoved()], ephemeral: true })
		myEvents.save()
    }
}

/*
 * applicationCommand: /artbot-refresh
 */
async function artBotRefresh(intr: ChatInputCommandInteraction) {
	let channels = myEvents.events.filter(e => e.channel == intr.channelId.toString())
	let text     = channels.map(e => e.name).join(", ")

	output.console(`[Refresh] ${text}`)
	myEvents.events.filter(e => e.channel == intr.channelId.toString()).forEach(e => e.setRetryEvent())
	myEvents.save()
	intr.reply({ embeds: [BotMessages.eventReset(text)], ephemeral: true })
}

/*
 * Initialization of the ArtBot's timers
 */
async function initEvents() {
    await myEvents.load()

    // Start timer
    setInterval(() => {
        myEvents.events.forEach(async (e) => {
            if (e.isRun()) {
                e.setNextEvent()
                myEvents.save()
                output.console(`[Executing] ${e.name}`)

                let start: Date = new Date()
                let end: Date = new Date(new Date().getTime() + e.frequency)

                if ((await broadcast(e.channel, e.name, e.mention, start, end)) == false) {
                    e.setRetryEvent()
                    myEvents.save()
                }
            }
        })
    }, 1000)
}

//---[ Discord Functions ]-----------------------------------------------------

async function registerSlash() {
    let data: any

    try {
        data = await rest.put(Routes.applicationCommands(process.env.APP_ID as string), { body: slashCmds })
        output.console(`[Info] Registered ${data.length} application (/) commands.`)
    } catch (error: any) {
        output.console(`[Registering] ${error}`)
        throw error
    }
}

//---[ Discord Events ]--------------------------------------------------------

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return
    output.console(`[Interaction] ${interaction.commandName} (${interaction.user.tag})`)
	
    if (interaction.commandName === "artbot-addcontest") addContest(interaction)
    if (interaction.commandName === "artbot-deletecontest") delContest(interaction)
    if (interaction.commandName === "artbot-refresh") artBotRefresh(interaction)
})


client.once(Events.ClientReady, (readyClient) => {
	output.console(`[Info] AI Mode: ${ai.isAi ? 'Enabled' : 'Disabled'}`)
    output.console(`[Info] Logged in as ${readyClient.user.tag}`)
    client.guilds.cache.each((guild) => output.console(`[Info] ${guild.name} (${guild.id})`))
	global.data["client"] = client;
    initEvents()
})


registerSlash().then(() => {
    client.login(process.env.TOKEN_ID)
})

// TODO: Multiple Servers
