const { SlashCommandBuilder } = require('discord.js');
let { events } = require('../data.json');
const { player } = require('../data.json');
const { createChannel } = require('./create-channel');
const scheduler = require('node-schedule');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-event')
		.setDescription('Enregistre un évenement')
		.addStringOption(option => option.setName('nom').setDescription('Le nom de l\'évenement').setRequired(true))
		.addRoleOption(option => option.setName('rôle_1').setDescription('Le premier role qui participe à l\'évenement').setRequired(true))
		.addRoleOption(option => option.setName('rôle_2').setDescription('Le second role qui participe à l\'évenement').setRequired(true))
		.addStringOption(option => option.setName('date').setDescription('La Date de l\'évenement').setRequired(true))
		.addStringOption(option => option.setName('heure').setDescription('L\'Heure de l\'évenement').setRequired(true))
		.addIntegerOption(option => option.setName('durée').setDescription('La durée avant la supression, en minutes').setRequired(true)),
	async execute(interaction) {
		const heure = interaction.options.getString('heure');
		const date = interaction.options.getString('date');
		if (!date.includes('/') || !heure.includes(':')) {
			await interaction.reply('La date et l\'heure doivent être au format jj/mm/aaaa hh:mm');
			return;
		}
		let day = date.split('/')[0];
		let month = date.split('/')[1];
		const year = date.split('/')[2];
		const hour = heure.split(':')[0];
		const minute = heure.split(':')[1];
		if (month != '10') {
			month = month.replace('0', '');
		}
		if (day != '10' || day != '20' || day != '30') {
			day = day.replace('0', '');
		}
		if (events === undefined) {
			events = {};
		}
		if (events[year] === undefined) {
			events[year] = {};
		}
		if (events[year][month] === undefined) {
			events[year][month] = {};
		}
		if (events[year][month][day] === undefined) {
			events[year][month][day] = [];
		}
		if (events[year][month][day].find(event => event.name === interaction.options.getString('nom'))) {
			await interaction.reply('Il y a déjà un évenement du même nom pour cette date');
			return;
		}
		events[year][month][day].push({
			name: interaction.options.getString('nom'),
			hour: hour,
			minute: minute,
			duration: interaction.options.getInteger('durée'),
			role1: interaction.options.getRole('rôle_1'),
			role2: interaction.options.getRole('rôle_2'),
		});
		scheduler.scheduleJob(`${minute} ${hour} ${day} ${month} *`, async () => {
			createChannel(interaction, interaction.options.getString('nom'), interaction.options.getRole('rôle_1'), interaction.options.getRole('rôle_2'), interaction.options.getInteger('durée'));
		});
		fs.writeFile('./data.json', JSON.stringify({ events: events, player: player }), (err) => {
			if (err) console.error(err);
		});
		await interaction.reply('L\'évenement a été enregistré !');
	},
};