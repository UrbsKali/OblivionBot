// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const { createEmbed } = require('./commands/show-event');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.utils = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		try {
			if (interaction.customId === 'delete-roles') {
				const roles = await interaction.guild.roles.fetch();
				roles.forEach(async role => {
					if (role.name.startsWith('Team')) {
						await role.delete();
					}
				});
				// update the embed

				const embed_ = new EmbedBuilder()
					.setTitle('Événement personnalisé')
					.setDescription('Les rôles ont bien été supprimés')
					.setColor('#6b418c')
					.setTimestamp();

				await interaction.update({ embeds: [embed_], components: [] });
			}
			if (interaction.customId.split('_')[0] === 'next') {
				const { embed, btns } = createEmbed(parseInt(interaction.customId.split('_')[1]) + 1, false) ;
				await interaction.update({ embeds: [embed], components: [btns] });
			} else if (interaction.customId.split('_')[0] === 'prev') {
				const { embed, btns } = createEmbed(parseInt(interaction.customId.split('_')[1]) - 1, false);
				await interaction.update({ embeds: [embed], components: [btns] });
			}
		} catch (error) {
			console.error(error);
			await interaction.update({ content: 'Désolé, mais j\'ai eu un problème dans l\'exécution de cette commande 😅', ephemeral: true });
		}
	}
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Je n'ai pas trouvé ${interaction.commandName} dans mes commandes.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Désolé, mais j\'ai eu un problème dans l\'exécution de cette commande 😅', ephemeral: true });
	}
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`C'est prêt, je suis enregistré en tant que ${c.user.tag}`);
});


// Log in to Discord with your client's token
client.login(token);