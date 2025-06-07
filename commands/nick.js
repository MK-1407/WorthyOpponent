const { Options } = require("discord.js");
const { name } = require("../events/messageCreate");

module.exports = {
    data: {
        name: 'nick',
        description: 'Change the nickname of a user in the server',
        Options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to change the nickname of',
                required: true,
            },
            {
                name: 'nickname',
                type: 3, // STRING type
                description: 'The new nickname for the user',
                required: true,
            },
        ],
    },
    async executeInteraction(interaction) {
        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');

        try {
            // Check if the interaction is in a guild
            if (!interaction.guild) {
                return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
            }

            // Fetch the member from the user
            const member = await interaction.guild.members.fetch(user.id);

            // Check if the user has permission to manage nicknames
            if (!interaction.member.permissions.has('ManageNicknames')) {
                return interaction.reply({ content: 'You do not have permission to manage nicknames.', ephemeral: true });
            }
            // Change the nickname of the member
            await member.setNickname(nickname);
            // Send confirmation reply
            if (!interaction.replied) {
                await interaction.reply({ content: `Successfully changed the nickname of ${user.tag} to ${nickname}.`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            // Send error message only once
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while trying to change the nickname.', ephemeral: true });
            }
        }
    },
    async executeMessage(message, args) {
        // Check if the user has permission to manage nicknames
        if (!message.member.permissions.has('ManageNicknames')) {
            return message.reply('You do not have permission to manage nicknames!');
        }

        // Get the user ID and new nickname from the arguments
        const userId = args[0].replace(/[<@!>]/g, ''); // Remove <@!> from mention
        const nickname = args.slice(1).join(' ');

        // Fetch the member from the guild (server)
        const member = message.guild.members.cache.get(userId);
        
        // If the member is found and the bot has permission to change nicknames
        if (member) {
            try {
                // Change the nickname of the member
                await member.setNickname(nickname);
                await message.reply(`Successfully changed the nickname of ${member.user.tag} to ${nickname}.`);
            } catch (error) {
                console.error(error);
                await message.reply('There was an error while trying to change the nickname.');
            }
        } else {
            await message.reply('User not found in this server!');
        }
    },
}