const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

// Kreiranje nove instance klijenta
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,   // Potrebno za primanje poruka
        GatewayIntentBits.MessageContent,  // Potrebno za čitanje sadržaja poruka
        GatewayIntentBits.GuildMembers,    // Potrebno za XP sistem
    ],
    partials: [Partials.Channel],
});

// Učitavanje komandi
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[UPOZORENJE] Komanda na putanji ${filePath} nema potrebna "data" ili "execute" svojstva.`);
        }
    }
}

// Učitavanje evenata
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Prijavljivanje bota koristeći token iz .env fajla
client.login(process.env.DISCORD_TOKEN);