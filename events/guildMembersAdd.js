const { Events, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');

const welcomeChannels = require('../data/welcomeChannels.json'); // path to your JSON

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const guildId = member.guild.id;
        const welcomeChannelId = welcomeChannels[guildId];

        if (!welcomeChannelId) return console.log(`No welcome channel set for guild ${guildId}`);

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return console.error('Welcome channel not found.');

        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://static.vecteezy.com/system/resources/previews/000/701/690/non_2x/abstract-polygonal-banner-background-vector.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatarX = 50;
        const avatarY = 50;
        const avatarSize = 150;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 512 }));
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.font = 'bold 36px Sans';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`Welcome,`, 250, 100);

        ctx.font = 'bold 44px Sans';
        ctx.fillStyle = '#000000';
        ctx.fillText(member.user.username, 250, 160);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

        try {
            await channel.send({ content: `🎉 Welcome <@${member.id}>!`, files: [attachment] });
        } catch (error) {
            console.error('Error sending welcome embed:', error);
        }
    }
};
