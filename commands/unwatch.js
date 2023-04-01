const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const { watchModel } = require("../models/watch.model");

module.exports = {
    data: new SlashCommandBuilder().setName("unwatch").setDescription("Stop a watch session for a user"),

    async execute(interaction) {
        const users = (await watchModel.find({ discord_id: interaction.user.id })).slice(0, 20);
        const choices = users.map((it) => ({ label: it.osu_user, value: it.osu_id }));
        const description = users.map((it) => `${it.osu_id} (${it.osu_user}), ${it.watch_channel}`).join('\n');

        const select_embed = {
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            fields: [
                {
                    name: "Select a user to unwatch",
                    value: description,
                },
            ],
        };

        const sel_menu = new StringSelectMenuBuilder().setCustomId('select_osu_id').setPlaceholder('Nothing selected').addOptions(choices);
        const row = new ActionRowBuilder().addComponents(sel_menu);

        await interaction.reply({ embeds: [select_embed], components: [row], ephemeral: true });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        collector.on("collect", async (i) => {
            if (i.customId === "select_osu_id") {
                const osu_id_del = i.values[0];
                console.log("osu_id_v: ", osu_id_del);
                const osu_data = await watchModel.findOne({ osu_id: osu_id_del }, { discord_id: 1, watch_channel: 1 });
                const watch_channel = osu_data.watch_channel
                const dc_channel_id = watch_channel.slice(2, -1);
                console.log("dc_channel_id: ", dc_channel_id);
                await interaction.guild.channels.delete(dc_channel_id);
                await watchModel.deleteOne({ osu_id: osu_id_del });
                await interaction.editReply({ content: `You are no longer watching **${osu_user}**`, components: [] });
            }
        });
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "You did not select a user to unwatch.", components: [] });
            }
        });
    },
};
