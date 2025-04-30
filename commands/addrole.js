module.exports = {
    data: {
        name: 'addrole',
        description: 'Add a role to a member',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to add the role to',
                required: true,
            },
            {
                name: 'role',
                type: 8, // ROLE type
                description: 'The role to add to the user',
                required: true,
            },
        ],
    },

    async executeInteraction(interaction) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            // Check if the interaction is in a guild
            if (!interaction.guild) {
                return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
            }

            // Fetch the member from the user
            const member = await interaction.guild.members.fetch(user.id);

            // Check if the bot has permissions in the guild
            if (!interaction.guild.me) {
                console.error('Bot is not in the guild.');
                return interaction.reply({ content: 'Bot is not in the guild.', ephemeral: true });
            }

            // Check if the bot has permission to manage roles
            if (!interaction.guild.me.permissions.has('MANAGE_ROLES')) {
                return interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
            }

            // Check if the user has permission to manage roles
            if (!interaction.member || !interaction.member.permissions.has('MANAGE_ROLES')) {
                return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
            }

            // Check if the bot can assign the role (the role must not be higher than the bot's highest role)
            if (role.position >= interaction.guild.me.roles.highest.position) {
                return interaction.reply({ content: 'I cannot assign that role. It is higher than my highest role.', ephemeral: true });
            }

            // Add the role to the member
            await member.roles.add(role);

            await interaction.reply({ content: `Successfully added the ${role.name} role to ${user.tag}.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while trying to add the role.', ephemeral: true });
        }
    },

    async executeMessage(message) {
        const args = message.content.trim().split(' ').slice(1);
        const user = message.mentions.users.first();
        const role = message.guild.roles.cache.get(args[1].replace('<@&', '').replace('>', ''));

        if (!user || !role) {
            return message.reply('Please mention a valid user and role.');
        }

        try {
            const member = await message.guild.members.fetch(user.id);

            // Check if the bot has permission to manage roles
            if (!message.guild.me || !message.guild.me.permissions.has('MANAGE_ROLES')) {
                return message.reply('I do not have permission to manage roles.');
            }

            // Check if the user has permission to manage roles
            if (!message.member || !message.member.permissions.has('MANAGE_ROLES')) {
                return message.reply('You do not have permission to manage roles.');
            }

            // Check if the bot can assign the role
            if (role.position >= message.guild.me.roles.highest.position) {
                return message.reply('I cannot assign that role. It is higher than my highest role.');
            }

            // Add the role to the member
            await member.roles.add(role);

            await message.reply(`Successfully added the ${role.name} role to ${user.tag}.`);

        } catch (error) {
            console.error(error);
            await message.reply('There was an error while trying to add the role.');
        }
    }
};
