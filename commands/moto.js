const { data } = require("./ping");

module.exports = {
    data: {
        name: 'moto',
        description: 'Sends Moto of the bot in the channel',
    },
    async executeInteraction(interaction) {
        const moto = "Bhai ne bola krne ka mtlb krne ka";
        await interaction.reply({ content: moto, ephemeral: true });
    },
    async executeMessage(message, args) {
        const moto = "Bhai ne bola krne ka mtlb krne ka";
        await message.reply(moto);
    },
}