const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-custom')
		.setDescription('Crée un événement personnalisé'),
	async execute(interaction) {
		await interaction.guild.roles.create({ name: 'Team 4' });
		await interaction.guild.roles.create({ name: 'Team 1' });
		await interaction.guild.roles.create({ name: 'Team 2' });
		await interaction.guild.roles.create({ name: 'Team 3' });

		// create an embed with a btn to delete the roles
		const embed = new EmbedBuilder()
			.setTitle('Événement personnalisé')
			.setDescription('Cliquez sur le bouton pour supprimer les rôles')
			.setColor('#6b418c')
			.setTimestamp();

		const btn = new ButtonBuilder()
			.setCustomId('delete-roles')
			.setLabel('Supprimer les rôles')
			.setStyle('Danger');

		const row = new ActionRowBuilder()
			.addComponents(btn);

		await interaction.reply({ embeds: [embed], components: [row] });
	},
};