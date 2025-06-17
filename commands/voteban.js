const { Options } = require("discord.js");
const { executeMessage } = require("./setwelcome");

module.exports = {
    name: 'voteban',
    description: 'Vote to ban a user from the server, does not requires admin permissions. atleast 5 votes are required to ban a user.',
    Options: [
        {
            name: 'user',
            description: 'The user to ban',
            type: 6, // USER type
            required: true
        }
    ],
    async executeInteraction(interaction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            return interaction.reply({ content: 'Please provide a valid user to ban.', ephemeral: true });
        }

        // Check if the user is already banned
        const bannedUsers = await interaction.guild.bans.fetch();
        if (bannedUsers.has(user.id)) {
            return interaction.reply({ content: `${user.tag} is already banned.`, ephemeral: true });
        }

        // Create a vote channel
        const voteChannel = await interaction.guild.channels.create(`vote-ban-${user.username}`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL'],
                }
            ]
        });

        // Send the voting message
        const voteMessage = await voteChannel.send({
            content: `Vote to ban ${user.tag}. React with 👍 to ban or 👎 to cancel.`,
            components: []
        });

        // Add reactions for voting
        await voteMessage.react('👍');
        await voteMessage.react('👎');

        // Create a filter for reactions
        const filter = (reaction, voter) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && !voter.bot;
        };

        // Collect reactions
        const collector = voteMessage.createReactionCollector({ filter, time: 60000 });

        let votesForBan = 0;
        let votesAgainstBan = 0;

        collector.on('collect', (reaction, voter) => {
            if (reaction.emoji.name === '👍') {
                votesForBan++;
            } else if (reaction.emoji.name === '👎') {
                votesAgainstBan++;
            }
        });

        collector.on('end', async () => {
            if (votesForBan >= 5) {
                try {
                    await interaction.guild.members.ban(user);
                    await voteChannel.send(`${user.tag} has been banned from the server.`);
                } catch (error) {
                    console.error(error);
                    await voteChannel.send(`Failed to ban ${user.tag}.`);
                }
            } else {
                await voteChannel.send(`Vote ended. Not enough votes to ban ${user.tag}.`);
            }
            await voteChannel.delete();
        });

        return interaction.reply({ content: `Voting started in ${voteChannel}.`, ephemeral: true });
    },
    async executeMessage(message, args) {
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply('Please provide a valid user to ban.');
        }

        // Check if the user is already banned
        const bannedUsers = await message.guild.bans.fetch();
        if (bannedUsers.has(user.id)) {
            return message.reply(`${user.tag} is already banned.`);
        }

        // Create a vote channel
        const voteChannel = await message.guild.channels.create(`vote-ban-${user.username}`, {
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL'],
                }
            ]
        });

        // Send the voting message
        const voteMessage = await voteChannel.send({
            content: `Vote to ban ${user.tag}. React with 👍 to ban or 👎 to cancel.`,
            components: []
        });

        // Add reactions for voting
        await voteMessage.react('👍');
        await voteMessage.react('👎');

        // Create a filter for reactions
        const filter = (reaction, voter) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && !voter.bot;
        };

        // Collect reactions
        const collector = voteMessage.createReactionCollector({ filter, time: 60000 });

        let votesForBan = 0;
        let votesAgainstBan = 0;

        collector.on('collect', (reaction, voter) => {
            if (reaction.emoji.name === '👍') {
                votesForBan++;
            } else if (reaction.emoji.name === '👎') {
                votesAgainstBan++;
            }
        });

        collector.on('end', async () => {
            if (votesForBan >= 5) {
                try {
                    await message.guild.members.ban(user);
                    await voteChannel.send(`${user.tag} has been banned from the server.`);
                } catch (error) {
                    console.error(error);
                    await voteChannel.send(`Failed to ban ${user.tag}.`);
                }
            } else {
                await voteChannel.send(`Vote ended. Not enough votes to ban ${user.tag}.`);
            }
            await voteChannel.delete();
        });

        return message.reply(`Voting started in ${voteChannel}.`);
    }
}