// commands/utility/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('leaderboard')
       .setDescription('Prikazuje top 10 najaktivnijih korisnika.'),
    async execute(interaction) {
        const top10 = db.prepare('SELECT * FROM users WHERE guild_id =? ORDER BY level DESC, xp DESC LIMIT 10').all(interaction.guild.id);

        if (top10.length === 0) {
            return interaction.reply({ content: 'Niko još nije na listi.', ephemeral: true });
        }

        const leaderboardEmbed = new EmbedBuilder()
           .setColor('#FFD700')
           .setTitle(`🏆 Leaderboard za ${interaction.guild.name}`)
           .setDescription('Top 10 najaktivnijih članova.');

        for (let i = 0; i < top10.length; i++) {
            const user = await interaction.client.users.fetch(top10[i].user_id).catch(() => null);
            const rank = i + 1;
            const name = user? user.tag : `Nepoznat korisnik (${top10[i].user_id})`;
            leaderboardEmbed.addFields({ name: `${rank}. ${name}`, value: `Nivo: ${top10[i].level} | XP: ${top10[i].xp}` });
        }

        await interaction.reply({ embeds: [leaderboardEmbed] });
    },
};
