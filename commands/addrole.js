const { PermissionFlagsBits } = require('discord.js');

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

            // Check if the user has permission to manage roles
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
            }

            // Check if the role is lower than the user's highest role
            if (role.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: 'You cannot assign that role. It is higher than your highest role.', ephemeral: true });
            }

            // Add the role to the member
            await member.roles.add(role);

            // Send confirmation reply (Ensure only one reply is sent)
            if (!interaction.replied) {
                await interaction.reply({ content: `Successfully added the ${role.name} role to ${user.tag}.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            // Send error message only once
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while trying to add the role.', ephemeral: true });
            }
        }
    },

    async executeMessage(message) {
        const args = message.content.trim().split(' ').slice(1);
        const user = message.guild.members.cache.get(args[0].replace(/[<@!>]/g, ''));
        const role = message.guild.roles.cache.get(args[1].replace('<@&', '').replace('>', ''));
        const bot = message.guild.members.fetchMe();

        if (!user || !role) {
            return message.reply('Please mention a valid user and role.');
        }

        try {
            const member = await message.guild.members.fetch(user.id);

            // Check if the user has permission to manage roles
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('You do not have permission to manage roles.');
            }

            // Check if the role is lower than the user's highest role
            if (role.position >= message.member.roles.highest.position) {
                return message.reply('You cannot assign that role. It is higher than your highest role.');
            }

            // Add the role to the member
            await member.roles.add(role);

            // Send confirmation reply
            await message.reply(`Successfully added the ${role.name} role to ${user.tag}.`);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while trying to add the role.');
        }
    }
};
