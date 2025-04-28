module.exports = {
    data: {
        name: 'ping',  // Command name
        description: 'Replies with Pong!'  // Command description
    },
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};
