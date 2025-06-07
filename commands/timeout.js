module.exports = {
    data: {
        name: 'timeout',
        description: 'Timeout a user in the server by user ID (bypasses mention)',
        options: [
            {
                name: 'user_id',
                type: 3,  // 'STRING' type for user ID
                description: 'The user ID to timeout',
                required: true,
            },
            {
                name: 'duration',
                type: 4,  // 'INTEGER' type for duration in seconds
                description: 'Duration of the timeout in seconds',
                required: true,
            },
            {
                name: 'reason',
                type: 3,  // 'STRING' type for the reason
                description: 'The reason for the timeout',
                required: false,
            },
        ],
    },
    async executeInteraction(interaction) {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({ content: 'You do not have permission to timeout members!', ephemeral: true });
        }
        const userId = interaction.options.getString('user_id');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Fetch the member from the guild (server)
            const member = await interaction.guild.members.fetch(userId);
            if (!member) {
                return interaction.reply({ content: 'User not found in this server!', ephemeral: true });
            }

            // Timeout the user
            await member.timeout(duration * 1000, reason);
            await interaction.reply({ content: `${member.user.tag} has been timed out for ${duration} seconds for: ${reason}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to timeout this user.', ephemeral: true });
        }
    },
    async executeMessage(message, args) {
        // Check if the user has permission to timeout members
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You do not have permission to timeout members!');
        }

        // Get the user ID, duration, and reason from the arguments
        let userId = args[0];
        //parse user ID from mention if provided
        if (userId.startsWith('<@') && userId.endsWith('>')) {
            userId = userId.slice(2, -1);
            if (userId.startsWith('!')) {
                userId = userId.slice(1); // Remove the '!' if present
            }
        }
        const duration = parseInt(args[1], 10);
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (isNaN(duration) || duration <= 0) {
            return message.reply('Please provide a valid duration in seconds.');
        }

        try {
            // Fetch the member from the guild (server)
            const member = await message.guild.members.fetch(userId);
            if (!member) {
                return message.reply('User not found in this server!');
            }

            // Timeout the user
            await member.timeout(duration * 1000, reason);
            await message.reply(`${member.user.tag} has been timed out for ${duration} seconds for: ${reason}`);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error trying to timeout this user.');
        }
    },
}