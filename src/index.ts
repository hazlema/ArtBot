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

const ai = new Ai()

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN_ID as string)

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
})

let myEvents = new DiscordEvents()

/*
 * Channel Messages / Broadcasts
 */
async function broadcast(channelID: string, msg: string, mention: string, start: Date, end: Date) {
    return client.channels.fetch(channelID).then(async (channel) => {
        if (channel) {
            // TODO: Multiple topic files
			let topic;
			topic = await getTopic(ai.isAi ? "projects.json" : "topics.json", "used.json");
		
            if (topic != null) {
                channel.send({ embeds: [BotMessages.eventPosted(msg, topic as string, mention, start, end)] })
                return true
            } else {
                output.console("[Error] Updating Topics (will retry)")
            }
        } else {
            output.console("[Error] Channel not found")
        }

        return false
    })
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
    }
}

/*
 * applicationCommand: /artbot-refresh
 */
async function artBotRefresh(intr: ChatInputCommandInteraction) {
	let channels = myEvents.events.filter(e => e.channel == intr.channelId.toString())
	let text     = channels.map(e => e.name).join(", ")

	output.console(`[Reset Events] (${text})`)
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
                output.console(`[Exec Event] ${e.name}`)

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
        //output.console(`[Info] Resetting Slash Commands...`)
        //data = await rest.put(Routes.applicationCommands(process.env.APP_ID as string), { body: [] })
        output.console(`[Info] Registering slash commands with Discord.. Please wait..`)
		//console.log(JSON.stringify(slashCmds, null, 5))
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
    output.console(`[Ready] Logged in as ${readyClient.user.tag}`)
    client.guilds.cache.each((guild) => output.console(`[Info] ${guild.name} (${guild.id})`))
    initEvents()
})


registerSlash().then(() => {
    client.login(process.env.TOKEN_ID)
})

// TODO: Multiple Servers
