const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); // <-- NAJVAŽNIJA LINIJA KOJA JE VJEROVATNO NEDOSTAJALA

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[UPOZORENJE] Komanda na putanji ${filePath} nema potrebna "data" ili "execute" svojstva.`);
        }
    }
}

// Inicijalizacija REST modula sa tvojim tokenom
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Anonimna 'async' funkcija koja se odmah izvršava
(async () => {
    try {
        console.log(`Počelo osvežavanje ${commands.length} aplikacijskih (/) komandi.`);

        // 'put' metoda šalje sve komande Discordu i briše stare
        const data = await rest.put(
            // Definišemo da su ovo komande za jedan, specifičan server (guild)
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`✅ Uspješno ponovo učitano ${data.length} aplikacijskih (/) komandi.`);
    } catch (error) {
        console.error(error);
    }
})();