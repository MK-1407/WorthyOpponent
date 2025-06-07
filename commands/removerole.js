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
        // remove role using role name or id
        const args = message.content.split(' ').slice(1);
        const userId = args[0].replace(/[<@!>]/g, ''); // Remove <@!> from mention
        // Get the role ID or name
        const roleIdOrName = args[1];

        // check if it is role mention and send "dont mention role"
        if (roleIdOrName.startsWith('<@&')) {
            return message.reply('Do not mention the role dumbass. Use the role ID or name instead.');
        }

        const role = message.guild.roles.cache.find(r => r.id === roleIdOrName || r.name === roleIdOrName);
        if (!role) {
            return message.reply('Role not found. Please provide a valid role ID or name.');
        }

        const member = message.guild.members.cache.get(userId);
        if (!member) {
            return message.reply('User not found in this server.');
        }

        // Remove the role
        member.roles.remove(role)
            .then(() => {
                message.reply(`Successfully removed the role **${role.name}** from <@${userId}>.`);
            })
            .catch(err => {
                console.error(err);
                message.reply('Failed to remove the role. Make sure my role is higher than the target role and I have permissions.');
            });

    },
}
