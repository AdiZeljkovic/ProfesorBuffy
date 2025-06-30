const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reci')
        .setDescription('Šalje poruku u ime bota u određeni kanal.')
        .addChannelOption(option => // Opcija za odabir kanala
            option.setName('kanal')
                .setDescription('Kanal u koji treba poslati poruku.')
                .addChannelTypes(ChannelType.GuildText) // Dozvoljava samo tekstualne kanale
                .setRequired(true))
        .addStringOption(option => // Opcija za unos poruke
            option.setName('poruka')
                .setDescription('Sadržaj poruke koju treba poslati.')
                .setRequired(true)
                .setMaxLength(4000)), // Maksimalna dužina poruke
    
    // Ovu komandu mogu koristiti samo članovi sa administratorskim dozvolama
    setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Uzimamo vrijednosti iz opcija
        const targetChannel = interaction.options.getChannel('kanal');
        const messageContent = interaction.options.getString('poruka');

        // Odgađamo odgovor da bismo izbjegli "interaction failed" grešku
        await interaction.deferReply({ ephemeral: true });

        try {
            // Šaljemo poruku u odabrani kanal
            await targetChannel.send(messageContent);
            
            // Obavještavamo korisnika da je poruka uspješno poslata
            await interaction.editReply(`✅ Poruka je uspješno poslata u kanal ${targetChannel}.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`Došlo je do greške. Provjeri da li imam dozvolu da pišem u kanalu ${targetChannel}.`);
        }
    },
};