import { EmbedBuilder } from "discord.js"

class BotMessages {
    constructor() {}

    static eventAdded = (name: string, frequency: number, channel: string) => {
        let msg = `📅 Event Added! 🎉\n\n` + `🔔 Name: ${name}\n` + `⏰ Frequency: Every ${frequency} hours\n` + `📢 Channel: ${channel}`

        return new EmbedBuilder().setDescription(msg)
    }

    static eventPosted = (name: string, subject: string, mention: string, beginTime: Date, endTime: Date) => {
        let msg =
            `🎊 ${name}: **${subject}**\n\n` +
            `🕒 Began: ${beginTime.toUTCString()}\n` +
            `🏁 Ends: ${endTime.toUTCString()}\n\n` +
            `📜 Rules:\n` +
            `1️⃣ Use whatever image model you like.\n` +
            `2️⃣ No editing the image manually.\n` +
            `3️⃣ No external images may be used.\n` +
            `4️⃣ You can use a LLM to help you design a prompt.\n\n`

        if (mention != "") {
            msg += `${mention}`
        }

        return new EmbedBuilder().setDescription(msg)
    }

    static eventReset = (eventNames: string) => {
        return new EmbedBuilder().setDescription(`☠️ ArtBot will reset ${eventNames} in 1 minute`)
    }

    static eventRemoved = () => {
        return new EmbedBuilder().setDescription(`⏹️ Events Removed`)
    }
}

export { BotMessages }
