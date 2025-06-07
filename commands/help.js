module.exports = {
    data: {
        name: 'help',
        description: 'List all available commands or get help for a specific command',
        options: [
            {
                name: 'command',
                type: 3,  // 'STRING' type for command name
                description: 'The command to get help for (optional)',
                required: false,
            },
        ],
    },
    async executeInteraction(interaction) {
        const commandName = interaction.options.getString('command');
        if (commandName) {
            // Get specific command help
            const command = interaction.client.commands.get(commandName);
            if (!command) {
                return interaction.reply({ content: `No command found with the name \`${commandName}\``, ephemeral: true });
            }
            const helpMessage = `**${command.data.name}**: ${command.data.description}`;
            return interaction.reply({ content: helpMessage, ephemeral: true });
        } else {
            // List all commands
            const commandsList = interaction.client.commands.map(cmd => `**${cmd.data.name}**: ${cmd.data.description}`).join('\n');
            return interaction.reply({ content: `Available commands:\n${commandsList}`, ephemeral: true });
        }
    },
    async executeMessage(message, args) {
        const commandName = args[0];
        if (commandName) {
            // Get specific command help
            const command = message.client.commands.get(commandName);
            if (!command) {
                return message.reply(`No command found with the name \`${commandName}\``);
            }
            const helpMessage = `**${command.data.name}**: ${command.data.description}`;
            return message.reply(helpMessage);
        } else {
            // List all commands
            const commandsList = message.client.commands.map(cmd => `**${cmd.data.name}**: ${cmd.data.description}`).join('\n');
            return message.reply(`Available commands:\n${commandsList}`);
        }
    },
}