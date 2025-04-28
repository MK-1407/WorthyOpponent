module.exports = {
    data: {
        name: 'unban',
        description: 'Unban a user from the server (by user ID)',
        options: [
            {
                name: 'user_id',
                type: 3,  // 'STRING' type for user ID
                description: 'The user ID to unban',
                required: true,
            },
            {
                name: 'reason',
                type: 3,  // 'STRING' type for the reason
                description: 'The reason for the unban',
                required: false,
            },
        ],
    },
    async executeInteraction(interaction) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.unban(userId, reason);
            await interaction.reply({ content: `User with ID ${userId} has been unbanned for: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to unban this user.', ephemeral: true });
        }
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('You do not have permission to unban members!');
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await message.guild.members.unban(userId, reason);
            await message.reply(`User with ID ${userId} has been unbanned for: ${reason}`);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error trying to unban this user.');
        }
    },
}