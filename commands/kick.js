module.exports = {
    data: {
        name: 'kick',
        description: 'Kick a user from the server (by mention or user ID)',
        options: [
            {
                name: 'user',
                type: 6,  // 'USER' type for mention support
                description: 'The user to kick (mention or user ID)',
                required: true,
            },
            {
                name: 'reason',
                type: 3,  // 'STRING' type for the reason
                description: 'The reason for the kick',
                required: false,
            },
        ],
    },
    async executeInteraction(interaction) {
        // Get the user and reason from options
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Fetch the member from the guild (server)
        const member = interaction.guild.members.cache.get(user.id);

        // If the member is found and the bot has permission to kick
        if (member) {
            try {
                // Kick the user
                await member.kick(reason);
                await interaction.reply({ content: `${user.tag} has been kicked for: ${reason}`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error trying to kick this user.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'User not found in this server!', ephemeral: true });
        }
    },
    async executeMessage(message, args) {
        // Check if the user has permission to kick members
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply('You do not have permission to kick members!');
        }

        // Get the user ID and reason from the arguments
        const userId = args[0].replace(/[<@!>]/g, ''); // Remove <@!> from mention
        const reason = args.slice(1).join(' ') || 'No reason provided';

        // Fetch the member from the guild (server)
        const member = message.guild.members.cache.get(userId);

        // If the member is found and the bot has permission to kick
        if (member) {
            try {
                // Kick the user
                await member.kick(reason);
                await message.reply(`${member.user.tag} has been kicked for: ${reason}`);
            } catch (error) {
                console.error(error);
                await message.reply('There was an error trying to kick this user.');
            }
        } else {
            await message.reply('User not found in this server!');
        }
    }
}