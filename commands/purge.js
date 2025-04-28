module.exports = {
    data: {
        name: 'purge',
        description: 'Delete messages in a channel with different filters (all, human, bot)',
        options: [
            {
                name: 'amount',
                type: 4,  // 'INTEGER' type for the number of messages
                description: 'The number of messages to delete',
                required: true,
            },
            {
                name: 'type',
                type: 3,  // 'STRING' type for the message type filter
                description: 'The type of messages to delete',
                required: false,
                choices: [
                    { name: 'All', value: 'all' },
                    { name: 'Humans', value: 'human' },
                    { name: 'Bots', value: 'bot' },
                ],
            },
        ],
    },
    async executeInteraction(interaction) {
        const amount = interaction.options.getInteger('amount');
        const type = interaction.options.getString('type') || 'all'; // Default to 'all'

        // Ensure the amount is between 1 and 100 (Discord limit for bulk delete)
        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: 'You can only purge between 1 and 100 messages at a time.',
                ephemeral: true,
            });
        }

        try {
            // Fetch the messages
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            
            // Ensure the number of messages is at least 1
            const filteredMessages = messages.filter(msg => {
                if (type === 'human' && !msg.author.bot) return true;
                if (type === 'bot' && msg.author.bot) return true;
                if (type === 'all') return true;
                return false;
            });

            // If no messages to delete, return a message
            if (filteredMessages.size === 0) {
                return interaction.reply({
                    content: `No ${type} messages found to delete.`,
                    ephemeral: true,
                });
            }

            // Purge the filtered messages
            await interaction.channel.bulkDelete(filteredMessages, true);
            await interaction.reply({
                content: `Successfully deleted ${filteredMessages.size} ${type} messages.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error trying to purge messages.',
                ephemeral: true,
            });
        }
    },

    async executeMessage(message) {
        const args = message.content.split(' ').slice(1); // Get the arguments from the message content
        const amount = parseInt(args[0]); // First argument is the amount
        const type = args[1] || 'all'; // Second argument is the type (default to 'all')

        // Ensure the amount is between 1 and 100 (Discord limit for bulk delete)
        if (amount < 1 || amount > 100) {
            return message.reply('You can only purge between 1 and 100 messages at a time.');
        }

        try {
            // Fetch the messages
            const messages = await message.channel.messages.fetch({ limit: amount });
            
            // Ensure the number of messages is at least 1
            const filteredMessages = messages.filter(msg => {
                if (type === 'human' && !msg.author.bot) return true;
                if (type === 'bot' && msg.author.bot) return true;
                if (type === 'all') return true;
                return false;
            });

            // If no messages to delete, return a message
            if (filteredMessages.size === 0) {
                return message.reply(`No ${type} messages found to delete.`);
            }

            // Purge the filtered messages
            await message.channel.bulkDelete(filteredMessages, true);
            await message.reply(`Successfully deleted ${filteredMessages.size} ${type} messages.`);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error trying to purge messages.');
        }
    }
};
