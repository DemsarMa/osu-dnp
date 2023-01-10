const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require("discord.js");
const { watchModel } = require("../models/watch.model");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Status of the bot"),

    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        const uptime = interaction.client.uptime;
        const watchCount = await watchModel.countDocuments(); 
        const date = new Date();
        const uptimeSec = uptime / 1000;
        const uptimeMin = uptimeSec / 60;
        const uptimeHour = uptimeMin / 60;
        const uptimeDay = uptimeHour / 24;
        const dayCount = Math.floor(uptimeDay);
        const hourCount = Math.floor(uptimeHour - dayCount * 24);
        const minCount = Math.floor(uptimeMin - dayCount * 24 * 60 - hourCount * 60);
        const secCount = Math.floor(uptimeSec - dayCount * 24 * 60 * 60 - hourCount * 60 * 60 - minCount * 60);

        const status_embed = {
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            author: {
                name: "osu!dnp status",
            },
            thumbnail: {
                url: "https://cdn.discordapp.com/avatars/1043971997643853914/4f63097b29c0b42059d3b3218da356c6.webp?size=4096",
            },
            fields: [
                {
                    name: "Ping",
                    value: ping + "ms",
                },
                {
                    name: "Uptime",
                    value: dayCount + " days, " + hourCount + " hours, " + minCount + " minutes, " + secCount + " seconds",
                },
                {
                    name: "Server time (GMT+1)",
                    value: date.toLocaleString("en-GB", { timeZone: "Europe/London" }),
                },
                {
                    name: "Watch Count",
                    value: watchCount,
                },
                {
                    name: "Version",
                    value: "v1.1.5",
                }
            ],
        };

        await interaction.reply({ embeds: [status_embed] });
    },
};
