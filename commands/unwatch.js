const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, Events, EmbedBuilder, } = require("discord.js");
const mongoose = require("../mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { watchModel } = require("../models/watch.model");

/*pseudo code
user types /unwatch
bot sends a message with a dropdown menu with all the users they are watching
user selects a user
bot fetches the user_id from the database
bot deletes the user from the database
bot modifies the embed to say "You are no longer watching this user"
*/

module.exports = {
    data: new SlashCommandBuilder().setName("unwatch").setDescription("Stop a watch session for a user"),

    async execute(interaction) {
        const dc_id = interaction.user.id;
        const osu_data = await watchModel.findOne({ discord_id: dc_id }, { osu_id: 1, watch_channel: 1, osu_user: 1 });
        const osu_id = osu_data.osu_id;
        const osu_user = osu_data.osu_user;
        const watch_channel = osu_data.watch_channel;
        console.log("osu_id: ", osu_id);
        console.log("watch_channel: ", watch_channel);
        console.log("dc_id: ", dc_id);
        console.log("osu_user: ", osu_user);

        const select_embed = {
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            fields: [
                {
                    name: "Select a user to unwatch",
                    value: osu_id + " (" + osu_user + "), " + watch_channel,
                },
            ],
        };

        const sel_menu = new StringSelectMenuBuilder()
            .setCustomId("select_osu_id")
            .setPlaceholder("Nothing selected")
            .addOptions([
                {
                    label: "MtkoGaming",
                    value: osu_id,
                },
            ]);
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
                await interaction.editReply({ content: `You are no longer watching ${osu_id_del}`, components: [] });
            }
        });
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "You did not select a user to unwatch.", components: [] });
            }
        });
    },
};
