const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits } = require("discord.js");
const mongoose = require("../mongoose");
const dotenv = require("dotenv");
dotenv.config();
const endpoint = "https://osu.ppy.sh/api/v2/";
const axios = require("axios");
const { watchModel } = require("../models/watch.model");

const osuid = process.env.OSU_CLIENT_ID;
const osusecret = process.env.OSU_CLIENT_SECRET;

async function osu_authorize() {
    const response = await axios.post("https://osu.ppy.sh/oauth/token", {
        client_id: osuid,
        client_secret: osusecret,
        grant_type: "client_credentials",
        scope: "public",
    });
    return response.data.access_token;
}

async function osu_get_user(osu_id, params) {
    const access_token = await osu_authorize();
    try {
    const { data } = await axios.get(endpoint + "users/" + osu_id, {
        headers: {
            Authorization: "Bearer " + access_token,
        },
        params,
    });
    return data;
} catch (error) {
    if (error.response.status === 404) {
      console.log('User not found, watch.js osu_get_user');
    } else {
        console.log('An unknown error occurred, watch.js osu_get_user', error);
    }
} finally {
    console.log("osu!dnp osu_get_user has been executed");
}}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("watch")
        .setDescription("Start a new watch session")
        .addStringOption((option) =>
        option.setName("osu_user_id").setDescription("The osu! user ID to watch").setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const osu_id = interaction.options.getString("osu_user_id");
        const watch = await watchModel.findOne({ osu_id });
        if (watch) {
            return await interaction.followUp("You are already watching this user!");
        }
        
        const osu_user = await osu_get_user(osu_id);
        const watch_channel = await interaction.guild.channels.create({
            name: "osu-" + osu_user.username + "-np",
            type: ChannelType.GuildText,
            parent: process.env.DISCORD_CATEGORY_ID,
            topic: "osu! watch channel for user " + osu_user.username,
        });
        const dc_channel = '<#' + watch_channel + '>';

        const assign_embed = {
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            thumbnail: {
                url: "https://a.ppy.sh/" + osu_id,
            },
            author: {
                name: osu_user.username + " has been successfully added to watch list!",
            },
            description: "osu!dnp will now send a message to this channel every time " + dc_channel + " plays a new beatmap!",
        };
        await watchModel.create({ osu_id, watch_channel, osu_score_db: 0 });
        await interaction.followUp({ embeds: [assign_embed] });
    },
};
