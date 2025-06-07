module.exports = {
    data: {
        name: 'ping',  // Command name
        description: 'Replies with Pong!'  // Command description
    },
    async executeInteraction(interaction) {
        await interaction.reply('Pong!');
    },
    async executeMessage(message, args) {
        await message.reply('Pong!');
    },
};
