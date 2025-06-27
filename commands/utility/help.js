// commands/utility/help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('help')
       .setDescription('Prikazuje listu svih dostupnih komandi.'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
           .setColor('#7289DA')
           .setTitle('Pomoć za komande')
           .setDescription('Evo liste svih komandi koje možete koristiti:');

        const commandFolders = fs.readdirSync(path.join(__dirname, '..', '..', 'commands'));

        for (const folder of commandFolders) {
            const commandsPath = path.join(__dirname, '..', '..', 'commands', folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            const commandList = commandFiles.map(file => {
                const command = require(path.join(commandsPath, file));
                return `\`/${command.data.name}\` - ${command.data.description}`;
            }).join('\n');

            if (commandList) {
                helpEmbed.addFields({ name: `Kategorija: ${folder.charAt(0).toUpperCase() + folder.slice(1)}`, value: commandList });
            }
        }

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};

