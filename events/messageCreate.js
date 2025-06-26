module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        try {
        if (!message.content.startsWith('&') || message.author.bot) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.executeMessage(message, args);
        } catch (error) {
            console.error(error);
        }

        // Check if the user is shushed
        const fs = require('fs');
        const shushedDataPath = '../data/shushed.json';
        if (fs.existsSync(shushedDataPath)) {
            const data = fs.readFileSync(shushedDataPath, 'utf8');
            const shushedData = JSON.parse(data);
            if (shushedData[message.author.id]) {
                // If the user is shushed, delete their message
                await message.delete();
            }
        }
    } catch (error) {
        console.error('Error in messageCreate event:', error);
    }
    },
};
