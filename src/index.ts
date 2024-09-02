import 'dotenv/config'
import { DiscordEvents, DiscordEvent } from "./ts/events";
import { output } from "./ts/output";
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { getTopic } from "./ts/select";

// TODO: Add formatting to Messages
// TODO: Add way to set the channel
// TODO: Add pathing for the data files (./src/data)

let myEvents = new DiscordEvents()

const client = new Client({intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildMessages, 
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent 
]});

const contest = (channelID: string, msg:string) => {
	client.channels.fetch(channelID).then(channel => {
		if (channel) {
			let topic = getTopic();
			if (topic != null) {
				channel.send(topic)
			} else {
				output.console("[Error] Missing projects.json")
			}
		} else {
			output.console("[Error] Channel not found")
		}
	});
}

async function initEvents(){
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
				contest(e.channel, e.name);
			}
		})
	}, 1000);
}

client.once(Events.ClientReady, readyClient => {
	output.console(`[Ready] Logged in as ${readyClient.user.tag}`)
	initEvents();
});

client.login(process.env.TOKEN_ID);

