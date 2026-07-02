# 🤖 WorthyOpponent

**WorthyOpponent** is a feature-rich multipurpose Discord bot built with **Node.js** and **discord.js v14**. It provides moderation tools, role management, welcome messages, fun commands, private messaging, music playback, and utility commands to help manage Discord communities.

---

## ✨ Features

### 🛡️ Moderation
- Ban users
- Hackban users by ID
- Kick members
- Timeout members
- Unban users
- Warn users
- Vote Ban system
- Purge messages
- Shush / Unshush users

### 👥 Role Management
- Add roles
- Remove roles
- Change nicknames

### 🎵 Music
- Play music from YouTube
- Spotify support
- Queue management
- Automatic song announcements

### 🎉 Server Management
- Configurable welcome channel
- Automatic member welcome system

### 💬 Utility
- Ping command
- Help command
- Whisper (private message)
- Bot motto
- Ship compatibility command

---

## 📁 Project Structure

```
WorthyOpponent
│
├── commands/          # Slash commands
├── events/            # Discord event handlers
├── data/              # Bot data storage
├── index.js           # Main bot
├── music.js           # Music entry point
├── package.json
└── README.md
```

---

## 📦 Built With

- Node.js
- Discord.js v14
- DisTube
- Spotify Plugin
- yt-dlp Plugin
- Express
- dotenv

---

## 🚀 Installation

### Clone the repository

```bash
git clone https://github.com/MK-1407/WorthyOpponent.git

cd WorthyOpponent
```

### Install dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
token=YOUR_DISCORD_BOT_TOKEN
clientId=YOUR_APPLICATION_CLIENT_ID
PORT=3000
```

---

## ▶️ Running the Bot

Development

```bash
npm run dev
```

Production

```bash
node index.js
```

Music mode

```bash
npm run music
```

---

## 📜 Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Display available commands |
| `/ping` | Check bot latency |
| `/ban` | Ban a member |
| `/hackban` | Ban a user by ID |
| `/kick` | Kick a member |
| `/timeout` | Timeout a member |
| `/unban` | Unban a user |
| `/warn` | Warn a member |
| `/voteban` | Community vote ban |
| `/purge` | Delete messages |
| `/addrole` | Give a role to a user |
| `/removerole` | Remove a role |
| `/nick` | Change nickname |
| `/setwelcome` | Configure welcome channel |
| `/shush` | Automatically delete a user's messages |
| `/unshush` | Remove shush restriction |
| `/ship` | Compatibility calculator |
| `/whisper` | Send a private message |
| `/moto` | Display the bot motto |

---

## 🎵 Music Support

WorthyOpponent supports playback from:

- YouTube
- Spotify
- yt-dlp supported sources

---

## 🔧 Tech Stack

- JavaScript
- Discord.js
- DisTube
- Express
- Node.js

---

## 📌 Future Plans

- [ ] Economy system
- [ ] Leveling system
- [ ] Custom logging
- [ ] Dashboard
- [ ] AI commands
- [ ] Auto moderation
- [ ] Better music controls
- [ ] Database support

---

## 🤝 Contributing

Pull requests are welcome.

If you find bugs or have feature requests, open an issue.

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Mayank**

GitHub: https://github.com/MK-1407

---

⭐ If you found this project useful, consider giving it a star!
