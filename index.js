require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// === Dummy Express Server for Render ===
const express = require('express');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Worthy Opponent Bot is running!');
});

app.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
});

// === Ping Google every 3 minutes to stay awake ===
setInterval(() => {
    https.get('https://www.google.com', (res) => {
        console.log(`[PING] Google responded with status code: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error('[PING] Error pinging Google:', err.message);
    });
}, 180000);


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Dynamically load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Registering the commands with Discord Globally (optional, but recommended for slash commands)
const rest = new REST({ version: '9' }).setToken(process.env.token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
            { body: client.commands.map(command => command.data) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
// Dynamically load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.token);
