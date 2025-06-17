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
    } catch (error) {
        console.error('Error in messageCreate event:', error);
    }
    },
};
