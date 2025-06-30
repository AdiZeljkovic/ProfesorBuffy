const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reci')
        .setDescription('Šalje poruku u ime bota u određeni kanal.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kanal u koji treba poslati poruku.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('poruka')
                .setDescription('Sadržaj poruke koju treba poslati.')
                .setRequired(true)
                .setMaxLength(4000))
        // --- ISPRAVKA JE OVDJE ---
        // Dozvola je sada dio lanca SlashCommandBuilder-a
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('kanal');
        const messageContent = interaction.options.getString('poruka');

        await interaction.deferReply({ ephemeral: true });

        try {
            await targetChannel.send(messageContent);
            await interaction.editReply(`✅ Poruka je uspješno poslata u kanal ${targetChannel}.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`Došlo je do greške. Provjeri da li imam dozvolu da pišem u kanalu ${targetChannel}.`);
        }
    },
};