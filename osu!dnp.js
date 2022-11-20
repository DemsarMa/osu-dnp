const fs = require('fs');
const fsPromises = fs.promises;
const express = require('express');
const path = require('path');
const { Client, Intents, GatewayIntentBits, Collection } = require('discord.js');
const axios = require('axios');
const dotenv = require('dotenv');
const { resourceLimits } = require('worker_threads');
const { finished } = require('stream');
dotenv.config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
client.login(process.env.DISCORD_TOKEN);
const prefix = '$';

client.on('ready', () => {
    console.log('I am ready!');
});

const osutoken = process.env.OSU_TOKEN;
const endpoint = "https://osu.ppy.sh/api/v2/";
const osuid = process.env.OSU_CLIENT_ID;
const osusecret = process.env.OSU_CLIENT_SECRET;
const osuredirect = "http://localhost:3000";
const osu_url = "https://osu.ppy.sh/"
const osu_user_id = process.env.OSU_USER_ID;
const dc_channel = process.env.DISCORD_CHANNEL_ID;

async function osu_authorize() {
const response = await axios.post('https://osu.ppy.sh/oauth/token', {
    client_id: osuid,
    client_secret: osusecret,
    grant_type: 'client_credentials',
    scope: 'public',
});
return response.data.access_token;
}

async function osu_get_user_scores(user_id, params) {
    const access_token = await osu_authorize();
    const { data } = await axios.get(endpoint + 'users/' + user_id + '/scores/recent', {
        headers: {
            Authorization: 'Bearer ' + access_token,
        },
        params
    }); 
    return data;
}

osu_get_user_scores(osu_user_id, {mode: 'osu', limit: 1, include_fails: true}).then((data) => {
        console.log(data);
    })  
    .catch((error) => {
        console.log(error);
    });


    client.on('ready', async () => {
        setInterval(async () => {
        const score_json = JSON.parse(fs.readFileSync('score_db.json', 'utf8'));
        const score = await osu_get_user_scores(osu_user_id, {mode: 'osu', limit: 1, include_fails: true});
        if (score_json.beatmap_id === score.beatmap_id) {
            console.log("Same play");
            return;
        }
        fs.writeFileSync('score_db.json', JSON.stringify(score, null, 4));
        if (score.beatmap_id !== score_json.beatmap_id) {
            console.log("New play");
            const embed = {
                "color": 16711680,
                "timestamp": new Date(),
                "footer": {
                    "icon_url": "https://a.ppy.sh/" + score[0].user.id,
                    "text": "osu!dnp"
                },
                "thumbnail": {
                    "url": "https://assets.ppy.sh/beatmaps/" + score[0].beatmapset.id + "/covers/cover.jpg"
                },
                "author": {
                    "name": score[0].user.username + " was playing " + score[0].beatmapset.title + " [" + score[0].beatmap.version + "]",
                    "url": "https://osu.ppy.sh/beatmaps/" + score[0].beatmap.id,
                    "icon_url": "https://a.ppy.sh/" + score[0].user.id
                },
                "fields": [
                    {
                        "name": "Beatmap title",
                        "value": score[0].beatmapset.title,
                        "inline": true
                    },
                    {
                        "name": "Difficulty",
                        "value": score[0].beatmap.version,
                        "inline": true
                    },
                    {
                        "name": "Star rating",
                        "value": '' + score[0].beatmap.difficulty_rating,
                        "inline": true
                    },
                ]
            };
            client.channels.cache.get(dc_channel).send({ embeds: [embed] });
        } else if (!score) {
            const embed_no_score = {
                "color": 16711680,
                "timestamp": new Date(),
                "author": {
                    "name": "No score has been found",
                },
            };
            client.channels.cache.get(dc_channel).send({ embeds: [embed_no_score] });
        }
    }, 5000);
    });