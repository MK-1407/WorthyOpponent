
module.exports = {
    data: {
        name: 'unshush',
        description: 'Unshush a user, allowing them to send messages again.',
        options: [
            {
                name: 'user',
                description: 'The user to unshush',
                type: 6, // USER type
                required: true,
            },
        ],
    },
    async executeInteraction(interaction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            return interaction.reply({ content: 'User not found.', ephemeral: true });
        }
        
        // Get user ID
        const userId = user.id;
        
        // Load shushed data
        const fs = require('fs');
        const shushedDataPath = '../data/shushed.json';
        let shushedData = {};
        
        // Check if the file exists
        if (fs.existsSync(shushedDataPath)) {
            // Read the existing data
            const data = fs.readFileSync(shushedDataPath, 'utf8');
            shushedData = JSON.parse(data);
        }
        
        // Remove the user from the shushed data
        delete shushedData[userId];
        
        // Write the updated data back to the file
        fs.writeFileSync(shushedDataPath, JSON.stringify(shushedData, null, 2), 'utf8');
        
        // Reply to the interaction
        return interaction.reply({ content: `User ${user.tag} has been unshushed. They can now send messages again.` });
    },
    async executeMessage(message) {
        // Get the user from the message
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply({ content: 'Please mention a user to unshush.' });
        }
        
        // Get user ID
        const userId = targetUser.id;
        
        // Load shushed data
        const fs = require('fs');
        const shushedDataPath = '../data/shushed.json';
        let shushedData = {};
        
        // Check if the file exists
        if (fs.existsSync(shushedDataPath)) {
            // Read the existing data
            const data = fs.readFileSync(shushedDataPath, 'utf8');
            shushedData = JSON.parse(data);
        }
        
        // Remove the user from the shushed data
        delete shushedData[userId];
        
        // Write the updated data back to the file
        fs.writeFileSync(shushedDataPath, JSON.stringify(shushedData, null, 2), 'utf8');
        
        // Reply to the message
        return message.reply({ content: `User ${targetUser.tag} has been unshushed. They can now send messages again.` });
    },
}