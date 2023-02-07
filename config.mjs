// create data.json file if it doesn't exist and add {"event":{}, "player":{}} inside the file
// also create config.json file and ask if the user wants to add a token

import fs from 'node:fs';
import inquirer from 'inquirer';

if (!fs.existsSync('./data.json')) {
	fs.writeFileSync('./data.json', JSON.stringify({ player: {}, events: {} }));
}

if (!fs.existsSync('./config.json')) {
	let token, key, clientId, devGuildId;
	const questions = [
		{
			type: 'input',
			name: 'token',
			message: 'What is your bot token?',
		},
		{
			type: 'input',
			name: 'key',
			message: 'What is your RIOT API key?',
		},
		{
			type: 'input',
			name: 'clientId',
			message: 'What is your client id?',
		},
		{
			type: 'input',
			name: 'devGuildId',
			message: 'What is your dev guild id?',
		},
	];
	inquirer.prompt(questions).then(answers => {
		token = answers.token;
		key = answers.key;
		clientId = answers.clientId;
		devGuildId = answers.devGuildId;
		fs.writeFileSync('./config.json', JSON.stringify({ token: token, key: key, clientId: clientId, devGuildId: devGuildId }));
	});

	
}

