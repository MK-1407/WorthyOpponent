module.exports = {
    data: {
        name: 'purge',
        description: 'Delete messages in a channel with different filters (all, human, bot)',
        options: [
            {
                name: 'amount',
                type: 4, // INTEGER type
                description: 'The number of messages to delete',
                required: true,
            },
            {
                name: 'type',
                type: 3, // STRING type
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
        const type = interaction.options.getString('type') || 'all';

        try {
            // Try fetching more messages to ensure availability
            const messages = await interaction.channel.messages.fetch({ limit: Math.min(amount + 20, 100) }); // overfetch slightly
            const filteredMessages = messages.filter(msg => {
                if (type === 'human' && !msg.author.bot) return true;
                if (type === 'bot' && msg.author.bot) return true;
                if (type === 'all') return true;
                return false;
            }).first(amount); // Limit to 'amount'

            if (!filteredMessages.length) {
                return interaction.reply({ content: `No ${type} messages found to delete.`, ephemeral: true });
            }
            await interaction.channel.bulkDelete(filteredMessages, true)
                .catch(error => {
                    console.error(error);
                    throw new Error('Some messages are too old to bulk delete.');
                });

            await interaction.reply({ content: `Successfully deleted ${filteredMessages.length} ${type} messages.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: error.message || 'There was an error trying to purge messages.', ephemeral: true });
        }
    },

    async executeMessage(message) {
        const args = message.content.trim().split(' ').slice(1);
        const amount = parseInt(args[0]);
        const type = args[1] || 'all';

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('You can only purge between 1 and 100 messages at a time.');
        }
        message.delete().catch(() => {});
        try {
            const messages = await message.channel.messages.fetch({ limit: Math.min(amount + 20, 100) });
            const filteredMessages = messages.filter(msg => {
                if (type === 'human' && !msg.author.bot) return true;
                if (type === 'bot' && msg.author.bot) return true;
                if (type === 'all') return true;
                return false;
            }).first(amount); // again limit

            if (!filteredMessages.length) {
                return message.reply(`No ${type} messages found to delete.`)
                    .then(sent => {
                        setTimeout(() => sent.delete().catch(console.error), 5000);
                    });
            }

            await message.channel.bulkDelete(filteredMessages, true)
                .catch(error => {
                    console.error(error);
                    throw new Error('Some messages are too old to bulk delete.');
                });

            await message.channel.send(`Successfully deleted ${filteredMessages.length} ${type} messages.`)
                .then(sent => {
                    setTimeout(() => sent.delete().catch(console.error), 5000);
                });

        } catch (error) {
            console.error(error);
            await message.reply(error.message || 'There was an error trying to purge messages.');
        }
    }
};
