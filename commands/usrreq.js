const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const endpoint = "https://osu.ppy.sh/api/v2/";
const axios = require("axios");
const { getToken } = require("../modules/osu_login");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
    dsn: process.env.DSN,
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    op: "osu!dnp",
    name: "osu! Now Playing Bot",
});


async function osu_get_user(user_id, params) {
    const access_token = await getToken();
    try {
        const { data } = await axios.get(endpoint + "users/" + user_id, {
            headers: {
                Authorization: "Bearer " + access_token,
            },
            params,
        });
        return data;
    } catch (error) {
        if (error.response.status === 404) {
            console.log("User not found!, command usrreq osu_get_user");
            Sentry.captureException("User not found!, command usrreq osu_get_user, 404");
            return;
        } else if (error.response.status === 403) {
            console.log("Forbidden, osu!dnp osu_get_user_scores");
            Sentry.captureException("Forbidden, command usrreq osu_get_user, 403");
            return;
        } else if (error.response.status === 401) {
            console.log("Unauthorized, command usrreq osu_get_user");
            Sentry.captureException("Unauthorized, command usrreq osu_get_user, 401");
            return;
        } else if (error.response.status === 429) {
            console.log("Too many requests, blame osu!, command usrreq osu_get_user");
            Sentry.captureException("Too many requests, blame osu!, command usrreq osu_get_user, 429");
            return;
        } else if (error.response.status === 500) {
            console.log("Internal server error on osu!, command usrreq osu_get_user");
            Sentry.captureException("Internal server error on osu!, command usrreq osu_get_user, 500");
            return;
        } else if (error.response.status === 503) {
            console.log("Service unavailable on osu!, command usrreq osu_get_user");
            Sentry.captureException("Service unavailable on osu!, command usrreq osu_get_user, 503");
            return;
        } else if (error.response.status === 504) {
            console.log("Gateway timeout on osu!, command usrreq osu_get_user");
            Sentry.captureException("Gateway timeout on osu!, command usrreq osu_get_user, 504");
            return;
        } else if (error.response.status === 502) {
            console.log("Bad gateway on osu!, command usrreq osu_get_user");
            Sentry.captureException("Bad gateway on osu!, command usrreq osu_get_user, 502");
            return;
        } else if (error.response.status === 520) {
            console.log("Unknown error on osu!, command usrreq osu_get_user");
            Sentry.captureException("Unknown error on osu!, command usrreq osu_get_user, 520");
            return;
        } else {
            console.log("An unknown error has occured, command usrreq osu_get_user", error);
            Sentry.captureException("An unknown error has occured, command usrreq osu_get_user, " + error);
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userreq")
        .setDescription("Get a raw user data from osu!")
        .addStringOption((option) =>
            option.setName("osu_user_id").setDescription("The osu! user ID").setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(process.env.ROLE_ID)) {
            await interaction.deferReply({ content: "You don't have a permission to use this command!", ephemeral: true });
            return;
        }
        
        await interaction.deferReply();

        const not_id_embed = {
            color: 16711680,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            author: {
                name: "Invalid osu! user ID! The ID must be a number!",
            },
            description:
                "You can find the ID by copying final digits\n" +
                "(example: `https://osu.ppy.sh/users/2341251` -> `2341251`)",
        };

        if (isNaN(osu_id)) {
            return await interaction.followUp({ embeds: [not_id_embed] });
        }

        const osu_id = interaction.options.getString("osu_user_id");
        const usr = await osu_get_user(osu_id, {
            include_follower_count: true,
            include_following_count: true,
            include_kudosu: true,
            include_total_seconds_played: true
        }).finally(() => {
            console.log("Command executed: usrreq for " + osu_id);
        });

        const assign_embed = {
            color: 1501988,
            timestamp: new Date(),
            footer: {
                text: "osu!dnp",
            },
            thumbnail: {
                url: "https://a.ppy.sh/" + osu_id,
            },
            author: {
                name: "Raw score response for " + usr.username,
            },
            description: "```" + JSON.stringify(usr, null, 2) + "```",
        };
        await interaction.followUp({ embeds: [assign_embed] });
    },
};
