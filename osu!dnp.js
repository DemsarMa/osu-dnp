const fs = require('fs');
const path = require('path');
const { Client, Intents, GatewayIntentBits, Collection, REST, Routes, Events } = require('discord.js');
const axios = require('axios');
const mongoose = require('./mongoose');
const dotenv = require('dotenv');
dotenv.config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log('osu!dnp bot is ready! Start making scores!');
});

//slash command initialization
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//a bunch of variables
const endpoint = "https://osu.ppy.sh/api/v2/";
const osuid = process.env.OSU_CLIENT_ID;
const osusecret = process.env.OSU_CLIENT_SECRET;
const osu_user_id = process.env.OSU_USER_ID;
const dc_channel = process.env.DISCORD_CHANNEL_ID;
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();

//authorize with osu!api
async function osu_authorize() {
const response = await axios.post('https://osu.ppy.sh/oauth/token', {
    client_id: osuid,
    client_secret: osusecret,
    grant_type: 'client_credentials',
    scope: 'public',
});
return response.data.access_token;
}

//slash command handler
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
	//console.log(interaction);
});

//user id queue worker
/*async function osu_user_id_queue() {
//collect osu_user_id from interaction
const osu_id_temp_q = await osu_db.findOne('osu_id_temp_int');
console.log(osu_id_temp_q);
}*/

//score request
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


    client.on('ready', async () => {
        setInterval(async () => {
        const score_json = JSON.parse(fs.readFileSync('score_db.json', 'utf8'));
        const score = await osu_get_user_scores(osu_user_id, {mode: 'osu', limit: 1, include_fails: true});
        //await osu_user_id_queue();
        if (score_json[0].beatmap.id === score[0].beatmap.id) {
            return;
        }
        fs.writeFileSync('score_db.json', JSON.stringify(score, null, 4));
        if (score[0].beatmap.id !== score_json[0].beatmap.id) {
            console.log(year, "-", month, "-", date, " ", hours, ":", minutes, ":", seconds, "New play has been detected: ", score[0].beatmapset.title, ", sending to Discord...");
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