const { SlashCommandBuilder, Collection } = require('discord.js');
const mongoose = require('../mongoose');

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
		const osu_id = new osu_db({ osu_id_temp_int: osu_id_temp_int });
		console.log(osu_id.osu_id_temp_int);
		osuid_schema.methods.speak = function () {
			const ids = this.osu_id_temp_int;
			console.log("IDs", ids);
		};
		await osu_id.save();
		const osu_id_display = await osu_db.find();
		console.log("Displayed osu! ID", osu_id_display);
		await interaction.reply(`Watching osu! user ID ${osu_id_temp_int}`);
	},
};