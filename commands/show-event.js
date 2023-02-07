const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { events } = require('../data.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show-event')
		.setDescription('Affiche les évenements')
		.addIntegerOption(option => option.setName('offset').setDescription('Décalage par rapport à aujourd\'hui')),
	async execute(interaction) {
		const { embed, btns } = this.createEmbed(0 + interaction.options.getInteger('offset'));
		// send the embed
		await interaction.reply({ embeds: [embed], components: [btns] });
	},

	createEmbed(offset) {
		const date = new Date();
		const today = date.getDate() + offset;
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
		// sort events by hour
		let embed = {};
		try {
			const events_now = events[year][month][today];
			events_now.sort((a, b) => {
				if (a.hour < b.hour) {
					return -1;
				}
				if (a.hour > b.hour) {
					return 1;
				}
				return 0;
			});
			embed = {
				'type': 'rich',
				'title': 'Evenements',
				'description': `Voici les événements de ${jours[(date.getDay() + offset) % 7]} :`,
				'color': 0x6b418c,
				'thumbnail': {
					'url': 'https://cdn.discordapp.com/icons/858496881370202152/0c9a01f9529f7c57f3099b7779d2c86a.webp?size=128',
					'height': 0,
					'width': 0,
				},
				'fields': [],
				'timestamp': new Date(year, month - 1, today, 0, 0, 0, 0),
			};
			for (const event of events_now) {
				embed.fields.push({
					'name': event.name,
					'value': `Le ${today}/${month}/${year} à ${event.hour}:${event.minute}, <@&${event.role1.id}> contre <@&${event.role2.id}>`,
				});
			}
		} catch (e) {
			embed = {
				'type': 'rich',
				'title': 'Evenements',
				'description': `Aucun événement prévu pour ${jours[(date.getDay() + offset) % 7]}`,
				'color': 0x6b418c,
				'thumbnail': {
					'url': 'https://cdn.discordapp.com/icons/858496881370202152/0c9a01f9529f7c57f3099b7779d2c86a.webp?size=128',
					'height': 0,
					'width': 0,
				},
				'fields': [],
				'timestamp': new Date(year, month - 1, today),
			};
		}


		const btns = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('prev_' + offset)
					.setLabel('👈')
					.setStyle('Primary'),


				new ButtonBuilder()
					.setCustomId('next_' + offset)
					.setLabel('👉')
					.setStyle('Primary'),

			);
		return { 'embed' : embed, 'btns' : btns };
	},

};