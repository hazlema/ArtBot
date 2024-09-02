// discord.d.ts

import { Client, CategoryChannel, TextChannel, DMChannel, NewsChannel, ThreadChannel, Collection, MessageCreateOptions, MessagePayload } from "discord.js";

declare module "discord.js" {
    interface Client {
        commands: Collection<string, any>;
    }

    interface BaseChannel {
        send(content: string | MessagePayload | MessageCreateOptions): Promise<Message>;
    }

    interface CategoryChannel extends BaseChannel {}
    interface TextChannel extends BaseChannel {}
    interface DMChannel extends BaseChannel {}
    interface NewsChannel extends BaseChannel {}
    interface ThreadChannel extends BaseChannel {}
}