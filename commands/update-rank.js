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
		.setName('update-rank')
		.setDescription('Met à jour le rang du joueur'),
	async execute(interaction) {
		const user = interaction.user;
		if (player === undefined) {
			player = {};
		}
		if (player[user.id] === undefined) {
			await interaction.reply('Vous n\'avez pas de compte lié');
			return;
		} else {
			const tmp = this.get_rank(player[user.id].username);
			player[user.id].tier = tmp.tier;
			player[user.id].rank = tmp.rank;
			player[user.id].leaguePoints = tmp.leaguePoints;
			fs.writeFile('./data.json', JSON.stringify({ player: player, events: events }), (err) => {
				if (err) console.error(err);
			});
			await interaction.reply('Votre rang a bien été mis à jour !\nVotre rang est ' + tmp.tier + ' ' + tmp.rank + ', Vous avez ' + tmp.leaguePoints + ' LP');
		}
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