module.exports = {
    data: {
        name: 'setwelcome',
        description: 'Set the welcome channel for the server.',
        options: [
            {
                name: 'channel',
                type: 7, // Channel type
                description: 'The channel to set as the welcome channel.',
                required: true,
            },
        ],
    },
    async executeInteraction(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (!channel || channel.type !== 0) { // 0 is for text channels
            return interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
        }

        // Save the welcome channel to a JSON file or database
        const welcomeChannels = require('../data/welcomeChannels.json');
        welcomeChannels[interaction.guild.id] = channel.id;

        // Write the updated data back to the file
        const fs = require('fs');
        fs.writeFileSync('./data/welcomeChannels.json', JSON.stringify(welcomeChannels, null, 2));

        return interaction.reply({ content: `Welcome channel set to ${channel}.`, ephemeral: true });
    },
    async executeMessage(message) {
        const args = message.content.split(' ').slice(1);
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!channel || channel.type !== 0) {
            return message.reply('Please provide a valid text channel.');
        }

        // Save the welcome channel to a JSON file or database
        const welcomeChannels = require('../data/welcomeChannels.json');
        welcomeChannels[message.guild.id] = channel.id;

        // Write the updated data back to the file
        const fs = require('fs');
        fs.writeFileSync('./data/welcomeChannels.json', JSON.stringify(welcomeChannels, null, 2));

        return message.reply(`Welcome channel set to ${channel}.`);
    }
};