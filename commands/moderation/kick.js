const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Izbacuje korisnika sa servera.')
        .addUserOption(option =>
            option.setName('korisnik')
                .setDescription('Korisnik kojeg treba izbaciti.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razlog')
                .setDescription('Razlog za izbacivanje.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Vide je samo oni sa Kick dozvolom

    async execute(interaction) {
        const target = interaction.options.getMember('korisnik');
        const reason = interaction.options.getString('razlog') || 'Nije naveden razlog.';

        // Provjera da li uopšte možemo izbaciti tog korisnika
        if (!target.kickable) {
            return interaction.reply({ content: 'Ne mogu izbaciti ovog korisnika. Možda ima jaču ulogu od mene ili je vlasnik servera.', ephemeral: true });
        }

        try {
            // Pokušaj poslati privatnu poruku korisniku prije izbacivanja
            await target.send(`Izbačen si sa servera **${interaction.guild.name}**. Razlog: ${reason}`);
        } catch (error) {
            console.log(`Nisam uspio poslati DM korisniku ${target.user.tag}.`);
        }

        try {
            // Izbaci korisnika
            await target.kick(reason);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(`✅ Korisnik **${target.user.tag}** je uspješno izbačen. Razlog: ${reason}`);
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Došlo je do greške prilikom pokušaja kickovanja.', ephemeral: true });
        }
    },
};