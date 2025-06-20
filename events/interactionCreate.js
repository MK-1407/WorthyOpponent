module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
        if (!interaction.isCommand()) return; // Check if the interaction is a command

        const command = interaction.client.commands.get(interaction.commandName); // Get the command from the client

        if (!command) return; // If the command doesn't exist, exit

        try {
            await command.executeInteraction(interaction); // Execute the command
        } catch (error) {
            console.error(error); // Log any errors
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }); // Reply with an error message
        }
    } catch (error) {
        console.error('Error in interactionCreate event:', error); // Log any errors in the event
        }
    },
    once: false, // This event is not a one-time event
}