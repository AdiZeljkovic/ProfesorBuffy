// commands/moderation/kick.js
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('kick')
       .setDescription('Izbacuje korisnika sa servera.')
       .addUserOption(option => 
            option.setName('korisnik')
               .setDescription('Korisnik kojeg treba izbaciti')
               .setRequired(true))
       .addStringOption(option =>
            option.setName('razlog')
               .setDescription('Razlog za izbacivanje')),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('korisnik');
        const reason = interaction.options.getString('razlog') || 'Nije naveden razlog.';
        const member = await interaction.guild.members.fetch(targetUser.id);

        // --- Provera Dozvola ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'Nemate dozvolu da koristite ovu komandu.', ephemeral: true });
        }
        if (!member) {
            return interaction.reply({ content: 'Korisnik nije pronađen na ovom serveru.', ephemeral: true });
        }
        if (member.id === interaction.user.id) {
            return interaction.reply({ content: 'Ne možete izbaciti sami sebe.', ephemeral: true });
        }
        if (member.id === interaction.client.user.id) {
            return interaction.reply({ content: 'Ne možete izbaciti mene.', ephemeral: true });
        }
        // Provera da li bot ima višu ulogu od ciljanog korisnika
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: 'Ne možete izbaciti korisnika koji ima istu ili višu ulogu od vas.', ephemeral: true });
        }
        if (!member.kickable) {
            return interaction.reply({ content: 'Ne mogu da izbacim ovog korisnika. Proverite da li imam potrebne dozvole i da li je moja uloga iznad njegove.', ephemeral: true });
        }

        // --- Izvršavanje Akcije ---
        try {
            await member.kick(reason);
            await interaction.reply({ content: `Korisnik ${targetUser.tag} je uspešno izbačen. Razlog: ${reason}` });

            // --- Logovanje Akcije ---
            const logChannelId = process.env.LOG_CHANNEL_ID;
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                       .setColor('#ff0000')
                       .setTitle('Korisnik Izbačen (Kick)')
                       .addFields(
                            { name: 'Ciljani Korisnik', value: `${targetUser.tag} (${targetUser.id})` },
                            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})` },
                            { name: 'Razlog', value: reason }
                        )
                       .setTimestamp();
                    logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Došlo je do greške prilikom pokušaja izbacivanja korisnika.', ephemeral: true });
        }
    },
};

