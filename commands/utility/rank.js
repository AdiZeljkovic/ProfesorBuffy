const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('rank')
       .setDescription('Prikazuje vaš ili rang drugog korisnika.')
       .addUserOption(option => option.setName('korisnik').setDescription('Korisnik čiji rang želite da vidite')),
    async execute(interaction) {
        const user = interaction.options.getUser('korisnik') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const data = db.prepare('SELECT * FROM users WHERE guild_id =? AND user_id =?').get(interaction.guild.id, user.id);

        if (!data) {
            return interaction.reply({ content: `${user.tag} još uvek nema XP poena.`, ephemeral: true });
        }

        const rankEmbed = new EmbedBuilder()
           .setColor('#0099ff')
           .setTitle(`Rang za ${user.username}`)
           .setThumbnail(user.displayAvatarURL())
           .addFields(
                { name: 'Nivo', value: `**${data.level}**`, inline: true },
                { name: 'XP', value: `**${data.xp} / ${data.level * 300}**`, inline: true }
            );
        
        await interaction.reply({ embeds: [rankEmbed] });
    },
};

