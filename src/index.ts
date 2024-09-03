import 'dotenv/config'
import { DiscordEvents, DiscordEvent } from "./ts/events";
import { output } from "./ts/output";
import { ChatInputCommandInteraction, BaseInteraction, Client, Events, GatewayIntentBits, type CacheType, type Interaction, EmbedBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { getTopic } from "./ts/select";
import { BotMessages } from "./ts/botmessages";

// TODO: Add formatting to Messages
// TODO: Add way to set the channel
// TODO: Add pathing for the data files (./src/data)

let myEvents = new DiscordEvents()

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_ID as string);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	]
});

async function registerSlash() {
	try {
		output.console(`[Info] Registering slash commands with Discord.. Please wait..`)
		await rest.put(Routes.applicationCommands(process.env.APP_ID as string), {
			body:
				[
					{
						name: 'addcontest',
						description: 'Adds an event to the list of events',
						options: [
							{
								name: 'name',
								description: 'Name of the event',
								required: true,
								type: 3
							},
							{
								name: 'frequency',
								description: 'Frequency of the event in hours',
								required: true,
								type: 4
							}
						]
					}
				]
		});
	} catch (error) {
		output.console(`[Registering] ${error}`)
		throw new Error(`[Registering] ${error}`)
	}
}
const contest = (channelID: string, msg: string, start: Date, end: Date) => {
	client.channels.fetch(channelID).then(channel => {
		if (channel) {
			let topic = getTopic();
			if (topic != null) {
				channel.send({ embeds: [BotMessages.eventPosted(msg, start, end)] });
			} else {
				output.console("[Error] Missing projects.json")
			}
		} else {
			output.console("[Error] Channel not found")
		}
	});
}

async function initEvents() {
	await myEvents.load()

	if (myEvents.events.length === 0) {
		myEvents.add(
			new DiscordEvent("Hourly Event", 60 * 60, "393577466452508684", Date.now())
		)

		myEvents.add(
			new DiscordEvent("Daily Event", 60 * 60 * 24, "1092176267979272273", Date.now())
		)
	}

	setInterval(() => {

		myEvents.events.forEach((e) => {
			if (e.isRun()) {
				e.setNextEvent()
				myEvents.save()
				output.console(`[Exec Event] ${e.name}`)

				let start: Date = new Date()
				let end: Date = new Date(new Date().getTime() + e.frequency);

				contest(e.channel, e.name, start, end);
			}
		})
	}, 1000);
}

const addContest = (intr: ChatInputCommandInteraction) => {
	let optName: string | null = intr.options.getString('name')
	let optFrequency: number | null = intr.options.getInteger('frequency')
	let channel: string = intr.channelId

	if (optName && optFrequency && channel) {
		output.console(`[Add Event] ${optName} (Every ${optFrequency} hours, for channel ${channel})`)
		intr.reply({ embeds: [BotMessages.eventAdded(optName, optFrequency, channel)], ephemeral: true });
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	output.console(`[Interaction] ${interaction.commandName} (${interaction.user.tag})`)

	if (interaction.commandName === 'addcontest') addContest(interaction)
});

client.once(Events.ClientReady, readyClient => {
	output.console(`[Ready] Logged in as ${readyClient.user.tag}`)
	initEvents();
});

await registerSlash();
client.login(process.env.TOKEN_ID);

