import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

const slashCmds = [
    new SlashCommandBuilder()
        .setName('artbot-refresh')
        .setDescription('Force event to run')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
        .setName('artbot-deletecontest')
        .setDescription('Delete contests for this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
        .setName('artbot-addcontest')
        .setDescription('Adds an event to the list of events')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageEvents)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the contest')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('frequency')
                .setDescription('How often the contest should run (in hours)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mention')
                .setDescription('Role to mention (optional)')
                .setRequired(false))
];

export { slashCmds };