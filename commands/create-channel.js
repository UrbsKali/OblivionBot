const { SlashCommandBuilder } = require('discord.js');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-channel')
		.setDescription('Créer un salon vocal et un salon textuel visible par deux rôles, et supprimé après une durée donnée')
		.addStringOption(option => option.setName('nom').setDescription('Le nom du salon').setRequired(true))
		.addRoleOption(option => option.setName('rôle_1').setDescription('Le premier role qui pourra accéder au salon').setRequired(true))
		.addRoleOption(option => option.setName('rôle_2').setDescription('Le second role qui pourra accéder au salon').setRequired(true))
		.addIntegerOption(option => option.setName('durée').setDescription('La durée avant la supression, en minutes').setRequired(true)),
	async execute(interaction) {
		const name = interaction.options.getString('nom');
		const role1 = interaction.options.getRole('rôle_1');
		const role2 = interaction.options.getRole('rôle_2');
		const duration = interaction.options.getInteger('durée');

		await this.createChannel(interaction, name, role1, role2, duration);

		await interaction.reply('Le salon a été créé !');
	},
	async createChannel(interaction, name, role1, role2, duration) {
		const category = await interaction.guild.channels.create({ type: ChannelType.GuildCategory, name: name });
		const channel_txt = await interaction.guild.channels.create({
			parent: category,
			name: name,
			type: ChannelType.GuildText,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: role1,
					allow: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: role2,
					allow: [PermissionsBitField.Flags.ViewChannel],
				},
			],
		});
		const channel_vc = await interaction.guild.channels.create({
			parent: category,
			name: name,
			type: ChannelType.GuildVoice,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: role1,
					allow: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: role2,
					allow: [PermissionsBitField.Flags.ViewChannel],
				},
			],
		});
		setTimeout(() => {
			category.delete();
			channel_txt.delete();
			channel_vc.delete();
		}, duration * 60 * 1000);
	},
};