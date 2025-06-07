const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require("@distube/spotify");
const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Add this to .env
});

async function searchYouTube(query) {
  const res = await youtube.search.list({
    part: 'snippet',
    q: query,
    maxResults: 1,
    type: 'video',
  });

  const video = res.data.items[0];
  if (video) return `https://www.youtube.com/watch?v=${video.id.videoId}`;
  else return null;
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
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



// Register slash commands
const commands = [
  new SlashCommandBuilder().setName('play').setDescription('Play a song').addStringOption(opt =>
    opt.setName('query').setDescription('YouTube URL or song name').setRequired(true)),
  new SlashCommandBuilder().setName('skip').setDescription('Skip the current song'),
  new SlashCommandBuilder().setName('stop').setDescription('Stop the music'),
  new SlashCommandBuilder().setName('queue').setDescription('Show the queue'),
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), {
      body: commands.map(cmd => cmd.toJSON()),
    });
    console.log('Slash commands registered.');
  } catch (err) {
    console.error(err);
  }
})();

// Slash command handlers
const OWNER_ID = '1289449049698861079'; // replace this with your actual Discord user ID
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // User restriction
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({
      content: "Sorry, you ain't worthy 😤",
      ephemeral: true
    });
  }

  const vc = interaction.member.voice.channel;
  if (!vc) return interaction.reply({ content: 'Join a voice channel first!', ephemeral: true });

  const queue = distube.getQueue(interaction.guild);

  switch (interaction.commandName) {
    case 'play': {
      const query = interaction.options.getString('query');
      await interaction.reply(`Searching for: \`${query}\`...`);

      const videoURL = await searchYouTube(query);
      if (!videoURL) return interaction.editReply('❌ No results found.');

      distube.play(vc, videoURL, {
        textChannel: interaction.channel,
        member: interaction.member,
      });
      break;
    }


    case 'skip':
      if (!queue) return interaction.reply('Nothing to skip!');
      queue.skip();
      interaction.reply('⏭ Skipped the current song.');
      break;

    case 'stop':
      if (!queue) return interaction.reply('Nothing is playing!');
      queue.stop();
      interaction.reply('🛑 Music stopped.');
      break;

    case 'queue':
      if (!queue) return interaction.reply('Queue is empty!');
      interaction.reply(
        `🎶 Current Queue:\n${queue.songs.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}`
      );
      break;
  }
});


client.on('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
