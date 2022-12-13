const { SlashCommandBuilder, Collection } = require('discord.js');
const mongoose = require('../mongoose');
const endpoint = "https://osu.ppy.sh/api/v2/";
const accessToken = require('../osu!dnp');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watch')
		.setDescription('Start a new watch session')
        .addStringOption(option =>
            option.setName('osu_user_id')
                .setDescription('The osu! user ID to watch')
                .setRequired(true)),
	async execute(interaction) {
		const osu_id_temp_int = interaction.options.getString('osu_user_id');
		console.log(osu_id_temp_int);
		const osuid_schema = new mongoose.Schema({
			osu_id_temp_int: String,
		});
		const osu_db = mongoose.model('osu_id_temp_int', osuid_schema);
		const osu_id_existing = await osu_db.findOne({ osu_id_temp_int: osu_id_temp_int });
		const osu_id = new osu_db({ osu_id_temp_int: osu_id_temp_int });
		if (osu_id_existing) {
			return interaction.reply(`osu! user ID ${osu_id_temp_int} is already being watched`);
		}
		else {
			console.log(osu_id.osu_id_temp_int);
			osuid_schema.methods.speak = function () {
				const ids = this.osu_id_temp_int;
				console.log("IDs", ids);
			};
			await osu_id.save();
			const osu_id_display = await osu_db.find();
			const osu_id_username = await axios.get(endpoint + "users/" + osu_id_temp_int, {
				headers: {
					Authorization: 'Bearer ' + accessToken,
				},
				params
			});
			console.log(osu_id_username.username);
			const watch_channel = await interaction.guild.channels.create(osu_id_username, {
				type: 'text',
			});
			console.log(watch_channel);
			console.log("Displayed osu! ID", osu_id_display);
			await interaction.reply(`Watching osu! user ID ${osu_id_temp_int}`);
		}
	},
};