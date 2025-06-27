const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Trajno zabranjuje korisniku pristup serveru.')
        .addUserOption(option =>
            option.setName('korisnik')
                .setDescription('Korisnik kojeg treba banovati.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razlog')
                .setDescription('Razlog za banovanje.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('korisnik');
        const reason = interaction.options.getString('razlog') || 'Nije naveden razlog.';

        if (!target.bannable) {
            return interaction.reply({ content: 'Ne mogu banovati ovog korisnika. Možda ima jaču ulogu od mene ili je vlasnik servera.', ephemeral: true });
        }

        try {
            await target.send(`Trajno ti je zabranjen pristup serveru **${interaction.guild.name}**. Razlog: ${reason}`);
        } catch (error) {
            console.log(`Nisam uspio poslati DM korisniku ${target.user.tag}.`);
        }
        
        try {
            // Banuj korisnika
            await target.ban({ reason: reason });

            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(`⛔ Korisnik **${target.user.tag}** je uspješno banovan. Razlog: ${reason}`);
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Došlo je do greške prilikom pokušaja banovanja.', ephemeral: true });
        }
    },
};