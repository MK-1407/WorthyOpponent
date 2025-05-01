const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: {
        name: 'removerole',
        description: 'Remove a role from a member',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to remove the role from',
                required: true,
            },
            {
                name: 'role',
                type: 8, // ROLE type
                description: 'The role to remove from the user',
                required: true,
            },
        ],
    },

    async executeInteraction(interaction) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        try {
            // Get the member from the user
            const member = await interaction.guild.members.fetch(user.id);

            // Check if the user has permission to manage roles
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
            }

            // Remove the role from the member
            await member.roles.remove(role);

            await interaction.reply({ content: `Successfully removed the ${role.name} role from ${user.tag}.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while trying to remove the role.', ephemeral: true });
        }
    },

    async executeMessage(message) {
        const args = message.content.trim().split(' ').slice(1);
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        const role = message.guild.roles.cache.get(args[1].replace('<@&', '').replace('>', ''));

        if (!user || !role) {
            return message.reply('Please mention a valid user and role.');
        }

        try {
            const member = await message.guild.members.fetch(user.id);

            // Check if the user has permission to manage roles
            if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('You do not have permission to manage roles.');
            }

            //check if the role is higher than the user's highest role
            if (role.position >= member.roles.highest.position) {
                return message.reply('I cannot remove that role. It is higher than the user\'s highest role.');
            }

            // Remove the role from the member
            await member.roles.remove(role);

            await message.reply(`Successfully removed the ${role.name} role from ${user.tag}.`);

        } catch (error) {
            console.error(error);
            await message.reply('There was an error while trying to remove the role.');
        }
    }
};
