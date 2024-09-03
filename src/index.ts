/* Discord */
import "dotenv/config"
import { REST, Routes } from "discord.js"
import { ChatInputCommandInteraction, Client, Events, GatewayIntentBits } from "discord.js"

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN_ID as string)
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
})

/* ArtBot */
import { DiscordEvents, DiscordEvent } from "./ts/events"
import { output } from "./ts/output"
import { getTopic } from "./ts/select"
import { slashCmds } from "./ts/slashCmds"
import { BotMessages } from "./ts/botmessages"

let myEvents = new DiscordEvents()

/*
 * Channel Messages / Broadcasts
 */
function broadcast(channelID: string, msg: string, start: Date, end: Date) {
    client.channels.fetch(channelID).then((channel) => {
        if (channel) {
            let topic = getTopic()
            if (topic != null) {
                channel.send({ embeds: [BotMessages.eventPosted(msg, topic, start, end)] })
            } else {
                output.console("[Error] Missing projects.json")
            }
        } else {
            output.console("[Error] Channel not found")
        }
    })
}

/*
 * applicationCommand: /addcontest
 */
function addContest(intr: ChatInputCommandInteraction) {
    let optName: string | null = intr.options.getString("name")
    let optFrequency: number | null = intr.options.getInteger("frequency")
    let channel: string = intr.channelId

    if (optName && optFrequency && channel) {
        output.console(`[Add Event] ${optName} (Every ${optFrequency} hours, for channel ${channel})`)
        intr.reply({ embeds: [BotMessages.eventAdded(optName, optFrequency, channel)], ephemeral: true })

        myEvents.add(new DiscordEvent(optName, 60 * 60 * optFrequency, channel, Date.now()))
    }
}

/*
 * Initialization of the ArtBot's timers
 */
async function initEvents() {
    await myEvents.load()

    // Start timer
    setInterval(() => {
        myEvents.events.forEach((e) => {
            if (e.isRun()) {
                e.setNextEvent()
                myEvents.save()
                output.console(`[Exec Event] ${e.name}`)

                let start: Date = new Date()
                let end: Date = new Date(new Date().getTime() + e.frequency)

                broadcast(e.channel, e.name, start, end)
            }
        })
    }, 1000)
}

//---[ Discord Functions ]-----------------------------------------------------

async function registerSlash() {
    try {
        output.console(`[Info] Registering slash commands with Discord.. Please wait..`)
        await rest.put(Routes.applicationCommands(process.env.APP_ID as string), slashCmds)
    } catch (error: any) {
        output.console(`[Registering] ${error}`)
        throw new Error(JSON.stringify(error))
    }
}

//---[ Discord Events ]--------------------------------------------------------

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    output.console(`[Interaction] ${interaction.commandName} (${interaction.user.tag})`)

    if (interaction.commandName === "addcontest") addContest(interaction)
})

client.once(Events.ClientReady, (readyClient) => {
    output.console(`[Ready] Logged in as ${readyClient.user.tag}`)
    initEvents()
})

registerSlash().then(() => {
    client.login(process.env.TOKEN_ID)
})

// TODO: Add a way to delete the events for a channel
// TODO: Add a role mention to the posted Message
