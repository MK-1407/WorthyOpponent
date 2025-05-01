const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE = path.join(__dirname, 'ship_history.csv');

// Load saved pairs
function loadSavedScores() {
    return new Promise((resolve) => {
        const results = [];
        if (!fs.existsSync(CSV_FILE)) {
            console.log('CSV file does not exist, returning empty results.');
            return resolve([]);
        }

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
                resolve(results);
            });
    });
}

// Save new pair
function saveScoreToCSV(user1ID, user2ID, score) {
    const line = `${user1ID},${user2ID},${score}\n`;
    const header = 'user1,user2,score\n';
    console.log(`Saving to CSV: ${line}`);
    if (!fs.existsSync(CSV_FILE)) {
        fs.writeFileSync(CSV_FILE, header + line);
    } else {
        fs.appendFileSync(CSV_FILE, line);
    }
}

module.exports = {
    data: {
        name: 'ship',
        description: 'Ship two users and show their compatibility score',
        options: [
            {
                name: 'user1',
                type: 6, // USER type
                description: 'The first user to ship',
                required: false,
            },
            {
                name: 'user2',
                type: 6, // USER type
                description: 'The second user to ship',
                required: false,
            },
            {
                name: 'preferred_role',
                type: 3, // STRING type for role
                description: 'Preferred role (e.g., She/Her, He/Him)',
                required: false,
            },
        ],
    },

    async executeInteraction(interaction) {
        let user1 = interaction.options.getUser('user1') || interaction.user;
        let user2 = interaction.options.getUser('user2');

        let preferredRole = interaction.options.getString('preferred_role')?.toLowerCase();

        // Remove %%=<percent> from preferredRole if present
        let preferredRole_temp = preferredRole;
        if (preferredRole && preferredRole.includes('%%=')) {
            preferredRole_temp = preferredRole.split('%%=')[0];
        }

        // If user2 is not provided, pick a random user based on the preferred role
        if (!user2) {
            user2 = await findUserWithRole(interaction.guild, preferredRole_temp);
        }

        if (!user2) {
            return interaction.reply({ content: 'Could not find a valid second user to ship with based on the role preference.', ephemeral: true });
        }

        // If a role contains the "%%=" percentage format, use it as the score
        let score = 0;
        const savedScores = loadSavedScores();
        console.log(`Saved scores: ${JSON.stringify(savedScores)}`);
        const existingEntry = savedScores.find(entry =>
            (entry.user1 === user1.id && entry.user2 === user2.id) ||
            (entry.user1 === user2.id && entry.user2 === user1.id)
        );
        console.log(`Existing entry: ${JSON.stringify(existingEntry)}`);
        
        if (existingEntry) {
            score = parseInt(existingEntry.score);
        } else {
            if (preferredRole && preferredRole.includes('%%=')) {
                const match = preferredRole.match(/%%=(\d+)%/);
                if (match) {
                    score = parseInt(match[1]);
                    // Save the score for this pair
                    console.log(`Saving score for ${user1.tag} and ${user2.tag}: ${score}`);
                    saveScoreToCSV(user1.id, user2.id, score);
                }
            } else {
                score = await generateCompatibilityScore(user1, user2, preferredRole);
            }
        }

        const hearts = '❤️'.repeat(Math.floor(score / 10)) + '🤍'.repeat(10 - Math.floor(score / 10));

        return interaction.reply({ content: `💖 **Compatibility between ${user1.tag} and ${user2.tag}:** 💖\n\n**Score**: ${score}%\n**Hearts**: ${hearts}` });
    },

    async executeMessage(message) {
        const args = message.content.trim().split(' ');

        let user1, user2, preferredRole;

        // Parse the users and the preferred role from the message arguments
        args.forEach((arg, index) => {
            if (arg === '?u1' && args[index + 1]?.startsWith('<@')) {
                user1 = message.mentions.users.first();
            }
            if (arg === '?u2' && args[index + 1]?.startsWith('<@')) {
                user2 = message.mentions.users.last();
            }
            if (arg === '?role' && args[index + 1]) {
                preferredRole = args[index + 1].toLowerCase();
            }
        });

        // If no user2 is specified, pick a random user based on the preferred role
        if (!user2) {
            if (preferredRole && preferredRole.includes('%%=')) {
                preferredRole = preferredRole.split('%%=')[0]; // Remove the %%=<percent> part
            }
            user2 = await findUserWithRole(message.guild, preferredRole);
        }

        if (!user1) user1 = message.author; // If user1 is not provided, default to the message sender

        if (!user1 || !user2) {
            return message.reply('Please provide valid users to ship with. Usage: `!ship ?u1 @user1 ?u2 @user2 ?role <role_name>`');
        }

        // If a role contains the "%%=" percentage format, use it as the score
        let score = 0;
        const savedScores = await loadSavedScores();
        const existingEntry = savedScores.find(entry =>
            (entry.user1 === user1.id && entry.user2 === user2.id) ||
            (entry.user1 === user2.id && entry.user2 === user1.id)
        );
        
        if (existingEntry) {
            score = parseInt(existingEntry.score);
        } else {
            if (preferredRole && preferredRole.includes('%%=')) {
                const match = preferredRole.match(/%%=(\d+)%/);
                if (match) {
                    score = parseInt(match[1]);
                    // Save the score for this pair
                    console.log(`Saving score for ${user1.tag} and ${user2.tag}: ${score}`);
                    saveScoreToCSV(user1.id, user2.id, score);
                }
            } else {
                score = await generateCompatibilityScore(user1, user2, preferredRole);
            }
        }
        

        const hearts = '❤️'.repeat(Math.floor(score / 10)) + '🤍'.repeat(10 - Math.floor(score / 10));

        message.reply(`💖 **Compatibility between ${user1.tag} and ${user2.tag}:** 💖\n\n**Score**: ${score}%\n**Hearts**: ${hearts}`);
    },
};

// Generate a basic compatibility score (before adding bias)
async function generateCompatibilityScore(user1, user2, preferredRole) {
    let score = await calculateBaseScore(user1, user2);

    // Keep the score within the range of 0 to 100
    score = Math.min(Math.max(score, 0), 100);

    return score;
}

// Calculate the base compatibility score (before adding bias)
async function calculateBaseScore(user1, user2) {
    const combinedString = user1.username + user1.id + user2.username + user2.id;
    const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return (hashValue % 101); // Modulo 101 to ensure the score is between 0 and 100
}

// Find a user with the specified role
async function findUserWithRole(guild, preferredRole) {
    const members = await guild.members.fetch(); // Ensure members are fetched before accessing roles
    const usersWithRole = [];

    // Loop through the members and collect those who have the preferred role
    for (let member of members.values()) {
        if (!member.user.bot && member.id !== guild.client.user.id) {
            if (preferredRole && member.roles.cache.some(role => role.name.toLowerCase() === preferredRole.toLowerCase())) {
                usersWithRole.push(member.user); // Add user to the list if they have the role
            }
        }
    }

    // Ensure there are users with the role
    if (usersWithRole.length > 0) {
        // Randomly choose a user from the list
        let randomIndex = Math.floor(Math.random() * usersWithRole.length);
        return usersWithRole[randomIndex];
    }

    return null; // Return null if no user with the preferred role was found
}


