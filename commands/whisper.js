const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: {
        name: 'whisper',
        description: 'Sends a private message to a user',
        options: [
            {
                name: 'user',
                description: 'The user to send a private message to',
                type: 6, // USER type
                required: true
            },
            {
                name: 'message',
                description: 'The secret message to send',
                type: 3, // STRING type
                required: true
            }
        ]
    },

    async executeInteraction(interaction) {
        console.log('[Command] secret-message');
        const targetUser = await interaction.options.getUser('user');
        const secretMessage = await interaction.options.getString('message');

        if (targetUser.bot) {
            return await interaction.reply({ content: `❌ You can't send secret messages to bots.`, ephemeral: true });
        }

        // Send anonymous confirmation to sender
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: `✅ Your secret message has been delivered anonymously.` });

        // Button setup
        const buttonId = `reveal_secret_${interaction.id}`;
        const button = new ButtonBuilder()
            .setCustomId(buttonId)
            .setLabel('🔒 Reveal Secret Message')
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(button);

        // Send to channel
        const msg = await interaction.channel.send({
            content: `📨 <@${targetUser.id}>, someone has sent you a secret message!`,
            components: [row]
        });

        // Log the secret message info to console
        console.log(`🕵️ Secret message sent:
  From: ${interaction.user.tag} (${interaction.user.id})
  To: ${targetUser.tag} (${targetUser.id})
  Message: ${secretMessage}
  Message Link: ${msg.url}
`);

        // Wait for button click
        const filter = i => i.customId === buttonId && i.user.id === targetUser.id;

        try {
            const confirmation = await interaction.channel.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 5 * 60 * 1000 // 5 minutes
            });

            await confirmation.reply({
                content: `💌 Secret message: ||${secretMessage}||`,
                ephemeral: true
            });
        } catch (err) {
            console.log('[Timeout] No interaction or expired');
        }
    }

    ,
    async executeMessage(message, args) {
        // delete the command message
        await message.delete().catch(console.error);
        // Check if the user has permission to send secret messages
        if (!message.member.permissions.has('SendMessages')) {
            return message.reply('You do not have permission to send secret messages!');
        }

        // Get the user and message from the arguments
        const targetUser = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        const secretMessage = args.slice(1).join(' ');

        if (!targetUser) {
            return message.reply('Please mention a valid user or provide a valid user ID.');
        }

        if (targetUser.bot) {
            return message.reply(`❌ You can't send secret messages to bots.`);
        }

        const buttonId = `reveal_secret_${message.id}`;

        const button = new ButtonBuilder()
            .setCustomId(buttonId)
            .setLabel('🔒 Reveal Secret Message')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({
            content: `📨 <@${targetUser.id}>, someone has sent you a secret message!`,
            components: [row]
        });

        const filter = i => i.customId === buttonId && i.user.id === targetUser.id;

        try {
            const confirmation = await message.channel.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 5 * 60 * 1000 // 5 minutes
            });

            await confirmation.reply({
                content: `💌 Secret message: ||${secretMessage}||`,
                ephemeral: true
            });
        } catch (err) {
            console.log('[Timeout] No interaction or expired');
        }
    }
};
