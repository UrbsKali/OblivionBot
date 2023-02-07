const { SlashCommandBuilder } = require('discord.js');
let { player } = require('../data.json');
const { events } = require('../data.json');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlink')
		.setDescription('Délie un compte discord à un compte LoL'),
	async execute(interaction) {
		const user = interaction.user;
		if (player === undefined) {
			player = {};
		}
		if (player[user.id] === undefined) {
			await interaction.reply('Vous n\'avez pas de compte lié');
			return;
		} else {
			// delete player[user.id];
			delete player[user.id];
		}
		fs.writeFile('./data.json', JSON.stringify({ player: player, events: events }), (err) => {
			if (err) console.error(err);
		});
		await interaction.reply('Votre compte a bien été délié !');
	},
};