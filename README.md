# 🎨 Art Contest Discord Bot, v0.1
![logo](./assets/logo.png)

## Overview

This Discord bot brings excitement to your server by automatically hosting art contests! It's designed to be flexible, reliable, and easy to customize.

### Key Features

- 🚀 **Automated Contests**: Spits out ArtContest messages at configurable intervals.
- 📚 **Diverse Topics**: Draws from a JSON file of 100 prepared topics.
- 🔄 **No Repeats**: Never draws duplicate topics until all have been used.
- ✏️ **Customizable**: Easily add your own topics by editing `src/projects.json`.
- 💡 **Smart Event Handling**: 
  - Remembers the next contest time even if offline.
  - Adjusts contest times if offline during a scheduled event.
  - Displays notices upon coming back online if contests were missed.

## Setup and Configuration

1. Clone the repository
2. Install dependencies
3. Configure your Discord bot token
4. Create the src/.env file with your bot authentication info
5. Set your desired contest frequency in the configuration file
6. Run the bot!

## Customizing Topics

To add or modify contest topics:

1. Open `src/projects.json`
2. Edit the JSON array of topics
3. Save the file
4. Restart the bot (if it's running)

### Generate new topics easily

Go to your favorite LLM and use a prompt like:
```
can you create a json file with 100 entries, these entries should be text fields and contain a digital art topic.  
Something like: "Neon underwater civilization", try to keep the entries under 10 words in length
```

## Usage

Once set up, the bot will automatically:

- Announce new art contests in your designated Discord channel
- Provide a unique topic for each contest
- Manage the contest schedule, even through downtime

Sit back and watch as your community engages in creative challenges!

## Setting up the src/.env file
Open a text editor and copy and paste the information from the discord bot page
```
TOKEN_ID=[Your bots token]
APP_ID=[Your application ID]
```

---

Enjoy fostering creativity in your Discord community with the Art Contest Bot! 🎭🖌️

---

## To install:

```bash
bun install
```

To run:

```bash
bun run bot
```

This project was created using `bun init` in bun v1.1.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript / TypeScript runtime.
