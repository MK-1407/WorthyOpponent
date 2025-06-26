const { exec } = require('child_process');

module.exports = {
    data: {
        name: 'shush',
        description: 'Shush a user, and deletes all their new messages in the channel.',
        options: [
            {
                name: 'user',
                description: 'The user to shush',
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
        // get user id
        const userId = user.id;
        // save the user id to ../data/shushed.json
        const fs = require('fs');
        const shushedDataPath = './data/shushed.json';
        let shushedData = {};
        // Check if the file exists
        if (fs.existsSync(shushedDataPath)) {
            // Read the existing data
            const data = fs.readFileSync(shushedDataPath, 'utf8');
            shushedData = JSON.parse(data);
        }
        // Add the user to the shushed data
        shushedData[userId] = true;
        // Write the updated data back to the file
        fs.writeFileSync(shushedDataPath, JSON.stringify(shushedData, null, 2), 'utf8');
        // Reply to the interaction
        return interaction.reply({ content: `User ${user.tag} has been shushed. All their new messages in this channel will be deleted.` });
    },
    async executeMessage(message) {
        // get the user from the message
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply({ content: 'Please mention a user to shush.' });
        }
        // get user id
        const userId = targetUser.id;
        // save the user id to ../data/shushed.json
        const fs = require('fs');
        const shushedDataPath = './data/shushed.json';
        let shushedData = {};
        // Check if the file exists
        if (fs.existsSync(shushedDataPath)) {
            // Read the existing data
            const data = fs.readFileSync(shushedDataPath, 'utf8');
            shushedData = JSON.parse(data);
        }
        // Add the user to the shushed data
        shushedData[userId] = true;
        // Write the updated data back to the file
        fs.writeFileSync(shushedDataPath, JSON.stringify(shushedData, null, 2), 'utf8');
        // Reply to the interaction
        return message.reply({ content: `User ${targetUser.tag} has been shushed. All their new messages in this channel will be deleted.` });
    }
}