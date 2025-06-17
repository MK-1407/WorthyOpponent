const { Options } = require("discord.js");
const { executeMessage } = require("./setwelcome");

module.exports = {
    data: {
        name: 'voteban',
        description: 'Vote to ban a user from the server, does not requires admin permissions.',
        options: [
            {
                name: 'user',
                description: 'The user to ban',
                type: 6, // USER type
                required: true
            }
        ]
    },
    async executeInteraction(interaction) {
        const targetUser = interaction.options.getUser('user');
        if (!targetUser) {
            return interaction.reply({ content: 'Please specify a valid user to ban.', ephemeral: true });
        }
        // send embed message to the chennel
        const embed = {
            color: 0xFF0000,
            title: 'Vote to Ban',
            description: `Do you want to ban ${targetUser.username}? React with 👍 to vote for ban or 👎 to vote against.`,
            footer: {
                text: 'At least 6 votes are required to ban the user.'
            }
        };
        // check till embed gets 6 votes
        const message = await interaction.channel.send({ embeds: [embed], fetchReply: true });
        await message.react(':thumbsup:')
        await message.react(':thumbsdown:');

        const filter = (reaction, user) => {
            return [':thumbsup:', ':thumbsdown:'].includes(reaction.emoji.name) && !user.bot;
        };
        const collector = message.createReactionCollector({ filter, time: 60000 }); // 1 minute to collect votes
        let votesForBan = 0;
        let votesAgainstBan = 0;
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === ':thumbsup:') {
                votesForBan++;
            } else if (reaction.emoji.name === ':thumbsdown:') {
                votesAgainstBan++;
            }
            // Check if we have enough votes
            if (votesForBan >= 6) {
                message.channel.send(`The user ${targetUser.username} has been banned by vote.`);
                // Here you would add the logic to actually ban the user
                collector.stop();
            } else if (votesAgainstBan >= 6) {
                message.channel.send(`The vote to ban ${targetUser.username} has failed.`);
                collector.stop();
            }
        });
        collector.on('end', collected => {
            if (votesForBan < 6 && votesAgainstBan < 6) {
                message.channel.send(`The vote to ban ${targetUser.username} has ended without enough votes.`);
            } else if (votesForBan >= 6) {
                // Logic to ban the user can be added here
                interaction.guild.members.ban(targetUser.id)
                    .then(() => {
                        message.channel.send(`${targetUser.username} has been banned from the server.`);
                    })
                    .catch(err => {
                        console.error(err);
                        message.channel.send(`Failed to ban ${targetUser.username}.`);
                    });
            } else {
                message.channel.send(`The vote to ban ${targetUser.username} has failed.`);
            }
        });
        interaction.reply({ content: `Vote to ban ${targetUser.username} has been initiated.`, ephemeral: true });
    },
    async executeMessage(message) {
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.channel.send('Please mention a valid user to ban.');
        }
        // send embed message to the channel
        const embed = {
            color: 0xFF0000,
            title: 'Vote to Ban',
            description: `Do you want to ban ${targetUser.username}? React with 👍 to vote for ban or 👎 to vote against.`,
            footer: {
                text: 'At least 6 votes are required to ban the user.'
            }
        };
        // check till embed gets 5 votes
        const msg = await message.channel.send({ embeds: [embed], fetchReply: true });
        await msg.react(':thumbsup:');
        await msg.react(':thumbsdown:');
        const filter = (reaction, user) => {
            return [':thumbsup:', ':thumbsdown:'].includes(reaction.emoji.name) && !user.bot;
        };
        const collector = msg.createReactionCollector({ filter, time: 60000 }); // 1 minute to collect votes
        let votesForBan = 0;
        let votesAgainstBan = 0;
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === ':thumbsup:') {
                votesForBan++;
            } else if (reaction.emoji.name === ':thumbsdown:') {
                votesAgainstBan++;
            }
            // Check if we have enough votes
            if (votesForBan >= 6) {
                message.channel.send(`The user ${targetUser.username} has been banned by vote.`);
                // Here you would add the logic to actually ban the user
                collector.stop();
            } else if (votesAgainstBan >= 6) {
                message.channel.send(`The vote to ban ${targetUser.username} has failed.`);
                collector.stop();
            }
        });
        collector.on('end', async () => {
            const messageReactions = message.reactions.cache;
            const upvotes = messageReactions.get(':thumbsup:')?.count || 0;
            const downvotes = messageReactions.get(':thumbsdown:')?.count || 0;

            const netUpvotes = upvotes - 1; // -1 because the bot reacts too
            const netDownvotes = downvotes - 1;

            if (netUpvotes >= 6) {
                try {
                    await interaction.guild.members.ban(targetUser.id);
                    message.channel.send(`${targetUser.username} has been banned from the server.`);
                } catch (err) {
                    console.error(err);
                    message.channel.send(`Failed to ban ${targetUser.username}.`);
                }
            } else if (netDownvotes >= 6) {
                message.channel.send(`The vote to ban ${targetUser.username} has failed.`);
            } else {
                message.channel.send(`The vote to ban ${targetUser.username} has ended without enough votes.`);
            }
        });

        message.channel.send(`Vote to ban ${targetUser.username} has been initiated.`);
    }
}