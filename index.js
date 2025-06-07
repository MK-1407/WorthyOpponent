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

const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require('@distube/spotify');

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
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
    ]
});

const distube = new DisTube(client, {
  plugins: [new SpotifyPlugin({
    api: {
      clientId: "790a58fc05a8483a9d8191d0496b698e",
      clientSecret: "846af1aa96464a6aa636bb31d1f10e3b",
    }
  }),
  new YtDlpPlugin()
  ]
});

distube
    .on('playSong', (queue, song) =>
        queue.textChannel.send(`🎶 Now playing: \`${song.name}\` - \`${song.formattedDuration}\``))
    .on('addSong', (queue, song) =>
        queue.textChannel.send(`✅ Added to queue: \`${song.name}\``));


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
            Routes.applicationCommands(process.env.clientId),
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
