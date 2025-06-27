const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Profesor Buffy prikazuje detaljan izvještaj o serveru.'),

    async execute(interaction) {
        const { guild } = interaction; // 'guild' je objekat koji predstavlja server

        // Prebrojavamo kanale po tipu
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categoryChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        // Kreiramo ljepši odgovor koristeći EmbedBuilder
        const embed = new EmbedBuilder()
            .setColor('#4a90e2')
            .setTitle(`Sistemski izvještaj za: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true })) // Ikonica servera
            .addFields(
                { name: '👑 Vlasnik servera', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Kreiran', value: new Date(guild.createdTimestamp).toLocaleDateString('bs-BA'), inline: true },
                { name: '👥 Ukupno članova', value: `${guild.memberCount}`, inline: true },
                { name: '📁 Kanali', value: `Tekst: **${textChannels}** | Glas: **${voiceChannels}** | Kat: **${categoryChannels}**` }
            )
            .setTimestamp()
            .setFooter({ text: 'Izvještaj generisao: Profesor Buffy' });

        await interaction.reply({ embeds: [embed] });
    },
};