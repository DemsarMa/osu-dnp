const fs = require("fs");
const path = require("path");
const { Client, Intents, GatewayIntentBits, Collection, REST, Routes, Events, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ActivityType } = require("discord.js");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { watchModel } = require("./models/watch.model");
const { getToken } = require("./modules/osu_login");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});
client.login(process.env.DISCORD_TOKEN);

Sentry.init({
    dsn: process.env.DSN,
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    op: "osu!dnp",
    name: "osu! Now Playing Bot",
});

client.on("ready", async () => {
    console.log("osu!dnp bot is ready! Start making scores!");
    client.user.setActivity("players on osu!", { type: ActivityType.Watching });
    client.user.setStatus("online");
});

//slash command initialization
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

//a bunch of variables
const endpoint = "https://osu.ppy.sh/api/v2/";
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();

//slash command handler
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.isAutocomplete) return;
    if (!interaction.isStringSelectMenu()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        Sentry.captureException(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    
    try {
        await command.execute(interaction);
    } catch (error) {
        Sentry.captureException(error);
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

//score request
async function osu_get_user_scores(user_id, params) {
    const access_token = await getToken();
    try {
        const { data } = await axios.get(endpoint + "users/" + user_id + "/scores/recent", {
            headers: {
                Authorization: "Bearer " + access_token,
            },
            params,
        });
        return data;
    } catch (error) {
        if (error.response.status === 404) {
            console.log("User not found!, osu!dnp osu_get_user_scores");
            Sentry.captureException("User not found!, osu!dnp osu_get_user_scores, 404");
            return;
        } else if (error.response.status === 403) {
            console.log("Forbidden, osu!dnp osu_get_user_scores");
            Sentry.captureException("Forbidden, osu!dnp osu_get_user_scores, 403");
            return;
        } else if (error.response.status === 401) {
            console.log("Unauthorized, osu!dnp osu_get_user_scores");
            Sentry.captureException("Unauthorized, osu!dnp osu_get_user_scores, 401");
            return;
        } else if (error.response.status === 429) {
            console.log("Too many requests, blame osu!, osu!dnp osu_get_user_scores");
            Sentry.captureException("Too many requests, blame osu!, osu!dnp osu_get_user_scores, 429");
            return;
        } else if (error.response.status === 500) {
            console.log("Internal server error on osu!, osu!dnp osu_get_user_scores");
            Sentry.captureException("Internal server error on osu!, osu!dnp osu_get_user_scores, 500");
            return; 
        } else {
            console.log("An unknown error has occured, osu!dnp osu_get_user_scores", error);
            Sentry.captureException("An unknown error has occured, osu!dnp osu_get_user_scores, " + error);
        }
    }
}

client.on("ready", async () => {
    setInterval(async () => {
        watchModel.find().then(async (res) => {
        res.forEach(async (val) => {
        const dc_channel_id = val.watch_channel.slice(2, -1);
        const score = await osu_get_user_scores(val.osu_id, {
            mode: "osu",
            limit: 1,
            include_fails: true,
        }).finally(() => {
            console.log("osu!dnp osu_get_user_scores for ", val.osu_id, " has been executed");
        });

        if (score.length == 0) {
            return;
        }
        if (val.osu_id == score[0].beatmap.id) {
            return;
        }
        watchModel.updateOne({ osu_id: val.osu_id }, { osu_score_db: score[0].beatmap.id }, (err, res) => {
            if (err) {
                console.log(err);
            }
        });
        if (score[0].beatmap.id != val.osu_score_db) {
            console.log(year, "-", month, "-", date, " ", hours, ":", minutes, ":", seconds, "New play has been detected: ", score[0].beatmapset.title, ", sending to Discord...");
            const embed = {
                color: 16711680,
                timestamp: new Date(),
                footer: {
                    icon_url: "https://a.ppy.sh/" + score[0].user.id,
                    text: "osu!dnp",
                },
                thumbnail: {
                    url: "https://assets.ppy.sh/beatmaps/" + score[0].beatmapset.id + "/covers/list.jpg",
                },
                author: {
                    name: score[0].user.username + " was playing " + score[0].beatmapset.title + " [" + score[0].beatmap.version + "]",
                    url: "https://osu.ppy.sh/beatmaps/" + score[0].beatmap.id,
                    icon_url: "https://a.ppy.sh/" + score[0].user.id,
                },
                fields: [
                    {
                        name: "Beatmap title",
                        value: score[0].beatmapset.title,
                        inline: true,
                    },
                    {
                        name: "Difficulty",
                        value: score[0].beatmap.version,
                        inline: true,
                    },
                    {
                        name: "Star rating",
                        value: "" + score[0].beatmap.difficulty_rating + "*",
                        inline: true,
                    },
                    {
                        name: "PP count (if FC)",
                        value: score[0].pp == null ? "0pp" : "" + score[0].pp + "pp", 
                        inline: true,
                    },
                    {
                        name: "FC?",
                        value: score[0].score == score[0].beatmap.max_combo ? "Yes" : "No",
                        inline: true,
                    },
                    {
                        name: "Pass?",
                        value: score[0].passed == "true" ? "Yes" : "No",
                        inline: true,
                    },
                    {
                        name: "Mods",
                        value: score[0].mods.length == 0 ? "No mods" : score[0].mods.join(", "),
                        inline: true,
                    },
                    {
                        name: "Map type",
                        value: score[0].beatmap.ranked == 1 ? "Ranked" : score[0].beatmap.ranked == 2 ? "Approved" : score[0].beatmap.ranked == 3 ? "Qualified" : score[0].beatmap.ranked == 4 ? "Loved" : "Unranked",
                        inline: true,
                    }
                ],
            };
            client.channels.cache.get(dc_channel_id).send({ embeds: [embed] });
        } else if (!score) {
            const embed_no_score = {
                color: 16711680,
                timestamp: new Date(),
                author: {
                    name: "No score has been found",
                },
            };
            client.channels.cache.get(dc_channel_id).send({ embeds: [embed_no_score] });
        }
    })});
    }, 8000);
});
