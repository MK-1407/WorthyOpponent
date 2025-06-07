module.exports = {
    data: {
        name: 'warn',
        description: 'Warn a user with a reason',
        options: [
            {
                name: 'user',
                description: 'The user to warn',
                type: 6, // USER
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for the warning',
                type: 3, // STRING
                required: true
            }
        ]
    },

    async executeInteraction(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        if (!interaction.member.permissions.has('KickMembers')) {
            return interaction.reply({ content: '❌ You do not have permission to warn members.', ephemeral: true });
        }
        if (targetUser.bot) {
            return interaction.reply({ content: '❌ You can’t warn bots.', ephemeral: true });
        }

        try {
            await targetUser.send(`⚠️ You have been warned in **${interaction.guild.name}** for: ${reason}`);
        } catch (err) {
            console.warn(`Could not DM ${targetUser.tag}.`);
        }

        await interaction.reply({
            content: `✅ <@${targetUser.id}> has been warned for: **${reason}**`,
            ephemeral: false
        });
    },

    async executeMessage(message, args) {
        await message.delete().catch(() => {});

        if (!message.member.permissions.has('KickMembers')) {
            return message.channel.send('❌ You do not have permission to warn members.');
        }

        const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        const reason = args.slice(1).join(' ');

        if (!targetUser || !reason) {
            return message.channel.send('Usage: `!warn @user [reason]`');
        }

        if (targetUser.bot) {
            return message.channel.send('❌ You can’t warn bots.');
        }

        try {
            await targetUser.send(`⚠️ You have been warned in **${message.guild.name}** for: ${reason}`);
        } catch (err) {
            console.warn(`Could not DM ${targetUser.tag}.`);
        }

        await message.channel.send(`✅ <@${targetUser.id}> has been warned for: **${reason}**`);
    }
};
