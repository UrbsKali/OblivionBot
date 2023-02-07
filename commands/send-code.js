const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('send-code')
		.setDescription('envoie le code de tournoi dans le salon')
		.addChannelOption(option => option.setName('salon').setDescription('Le salon dans lequel envoyer le message').setRequired(true))
		.addStringOption(option => option.setName('tournament_id').setDescription('Le code tournoi à envoyer').setRequired(true))
		.addRoleOption(option => option.setName('equipe1').setDescription('pour la mention').setRequired(true))
		.addRoleOption(option => option.setName('equipe2').setDescription('pour la mention').setRequired(true)),
	async execute(interaction) {
		const channel = interaction.options.getChannel('salon');
		const tournament_id = interaction.options.getString('tournament_id');
		const embed = {
			'type': 'rich',
			'title': 'Bonjour !',
			'description': `Tenez vous prêt <@&${interaction.options.getRole('equipe1').id}> et <@&${interaction.options.getRole('equipe2').id}>, \n **Voici votre code de tournoi :**\n\n\`${tournament_id}\`\n\n🎉 Bonne partie 🎉`,
			'color': 0x6b418c,
			'thumbnail': {
				'url': 'https://cdn.discordapp.com/icons/858496881370202152/0c9a01f9529f7c57f3099b7779d2c86a.webp?size=128',
				'height': 0,
				'width': 0,
			},
		};


		channel.send({ embeds: [embed] });
		await interaction.reply('Le message a été envoyé !');
	},
};