const { SlashCommandBuilder } = require('discord.js');
let { player } = require('../data.json');
const { events } = require('../data.json');
const { key } = require('../config.json');
const fs = require('node:fs');
const https = require('https');
const dea = require('deasync');

// todo : promisify

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Associe un compte discord à un compte LoL')
		.addStringOption(option => option.setName('id').setDescription('LoL ID').setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString('id');
		const user = interaction.user;
		const tmp = this.get_rank(username);
		const status = tmp.status;
		if (status === 404) {
			await interaction.reply('Le compte n\'existe pas');
			return;
		}
		if (player === undefined) {
			player = {};
		}
		if (player[user.id] === undefined) {
			player[user.id] = {};
		} else {
			await interaction.reply('Vous êtes déjà lié au compte ' + player[user.id].username + ' !');
			return;
		}
		player[user.id].username = username;
		player[user.id].tier = tmp.tier;
		player[user.id].rank = tmp.rank;
		player[user.id].leaguePoints = tmp.leaguePoints;
		player[user.id].pid = tmp.pid;
		fs.writeFile('./data.json', JSON.stringify({ player: player, events: events }), (err) => {
			if (err) console.error(err);
		});
		await interaction.reply('Votre compte a bien été lié !\nVotre rang est ' + tmp.tier + ' ' + tmp.rank + ', Vous avez ' + tmp.leaguePoints + ' LP');
	},
	get_rank(username) {
		// get the rank of the player with the username from RIOT API
		let ret = {};
		https.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + username + '?api_key=' + key, (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				const player_ = JSON.parse(data);
				let pid;
				try {
					pid = player_.id;
				} catch (e) {
					ret = { 'status': 404 };
				}
				https.get('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + pid + '?api_key=' + key, (resp_) => {
					let data_ = '';
					resp_.on('data', (chunk) => {
						data_ += chunk;
					});
					resp_.on('end', () => {
						const rank = JSON.parse(data_);
						ret = { tier: rank[0]['tier'], rank: rank[0]['rank'], leaguePoints: rank[0]['leaguePoints'], pid: pid, status: 200 };
					});
				}).on('error', (err) => {
					console.log('Error: ' + err.message);
				});
			});
		});
		while (ret.status === undefined) {
			dea.sleep(100);
		}
		return ret;
	},
};