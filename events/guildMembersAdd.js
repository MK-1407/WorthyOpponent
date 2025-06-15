const { Events, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannelId = '1383477669466869931'; // Replace with your welcome channel ID

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return console.error('Welcome channel not found.');
        const canvas = createCanvas(700, 250); // Width x Height
        const ctx = canvas.getContext('2d');

        // Load background image (can be a URL or local path)
        const background = await loadImage('https://static.vecteezy.com/system/resources/previews/000/701/690/non_2x/abstract-polygonal-banner-background-vector.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw circular clipping area for the avatar
        const avatarX = 50; // X position of avatar
        const avatarY = 50; // Y position of avatar
        const avatarSize = 150; // Size (width and height)

        ctx.save(); // Save the context state
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Load user's avatar
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 512 }));
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore(); // Restore context state (so clip doesn't affect text)

        // Add welcome text next to avatar
        ctx.font = 'bold 36px Sans';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`Welcome,`, 250, 100); // "Welcome," text

        ctx.font = 'bold 44px Sans';
        ctx.fillStyle = '#000000'; // Fancy color for username
        ctx.fillText(member.user.username, 250, 160); // Username below "Welcome,"
        // Convert canvas to buffer
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });
        try {
            await channel.send({ content: `🎉 Welcome <@${member.id}>!`, files: [attachment] });

        } catch (error) {
            console.error('Error sending welcome embed:', error);
        }
    }
};
