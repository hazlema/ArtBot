import { EmbedBuilder } from "discord.js";

class BotMessages {
	constructor() { }

	static eventAdded = (name: string, frequency: number, channel: string) => {
		let msg = `📅 Event Added! 🎉\n\n` +
			`🔔 Name: ${name}\n` +
			`⏰ Frequency: Every ${frequency} hours\n` +
			`📢 Channel: ${channel}`;

		return new EmbedBuilder().setDescription(msg);
	}

	static eventPosted = (name: string, beginTime: Date, endTime: Date) => {
		let msg = `🎊 **${name}** 🎊\n\n` +
			`🕒 Began: ${beginTime.toUTCString()}\n` +
			`🏁 Ends: ${endTime.toUTCString()}\n\n` +
			`📜 Rules:\n` +
			`     1️⃣ Use whatever image model you like.\n` +
			`     2️⃣ No editing the image manually.\n` +
			`     3️⃣ No external images may be used.\n` +
			`     4️⃣ You can use a LLM to help you design a prompt.\n\n`;

		return new EmbedBuilder().setDescription(msg)
	}
}

export { BotMessages }
