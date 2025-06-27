const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pomoc')
        .setDescription('Prikazuje listu svih dostupnih komandi.'),

    async execute(interaction) {
        // 'interaction.client.commands' je kolekcija svih komandi koje smo učitali
        const commands = interaction.client.commands;

        const embed = new EmbedBuilder()
            .setColor('#facc15') // Žuta boja
            .setTitle('📖 Profesor Buffy | Lista Komandi')
            .setDescription('Zdravo! Ja sam Profesor Buffy, tvoj digitalni asistent. Ispod se nalazi lista svih protokola (komandi) koje trenutno imam u sistemu.')
            .setThumbnail(interaction.client.user.displayAvatarURL()) // Slika bota
            .setTimestamp();

        // Kreiramo rječnik za grupisanje komandi po kategorijama (folderima)
        const categories = {};

        commands.forEach(command => {
            // Pretpostavljamo da je kategorija ime foldera u kojem se komanda nalazi
            const category = command.folder || 'Ostalo';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(`> </${command.data.name}>: ${command.data.description}`);
        });

        // Dodajemo polja u embed za svaku kategoriju
        for (const categoryName in categories) {
            embed.addFields({
                name: `📁 ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`, // Prvo slovo veliko
                value: categories[categoryName].join('\n'),
                inline: false
            });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true }); // 'ephemeral' čini poruku vidljivom samo tebi
    },
};