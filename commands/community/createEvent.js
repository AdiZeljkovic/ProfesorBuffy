// commands/community/createEvent.js
const { SlashCommandBuilder, PermissionsBitField, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('kreiraj-event')
       .setDescription('Kreira novi zakazani događaj na serveru.')
       .addStringOption(option => option.setName('naziv').setDescription('Naziv događaja').setRequired(true))
       .addStringOption(option => option.setName('opis').setDescription('Opis događaja').setRequired(true))
       .addStringOption(option => option.setName('pocetak').setDescription('Vreme početka (YYYY-MM-DD HH:MM)').setRequired(true))
       .addChannelOption(option => option.setName('kanal').setDescription('Glasovni kanal za događaj (opciono)'))
       .addStringOption(option => option.setName('lokacija').setDescription('Eksterna lokacija (ako nije u kanalu)')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
            return interaction.reply({ content: 'Nemate dozvolu za kreiranje događaja.', ephemeral: true });
        }

        const name = interaction.options.getString('naziv');
        const description = interaction.options.getString('opis');
        const startTimeStr = interaction.options.getString('pocetak');
        const channel = interaction.options.getChannel('kanal');
        const location = interaction.options.getString('lokacija');

        if (!channel &&!location) {
            return interaction.reply({ content: 'Morate navesti ili glasovni kanal ili eksternu lokaciju.', ephemeral: true });
        }
        if (channel && location) {
            return interaction.reply({ content: 'Ne možete navesti i glasovni kanal i eksternu lokaciju istovremeno.', ephemeral: true });
        }

        const scheduledStartTime = new Date(startTimeStr);
        if (isNaN(scheduledStartTime.getTime())) {
            return interaction.reply({ content: 'Format datuma nije ispravan. Koristite YYYY-MM-DD HH:MM.', ephemeral: true });
        }

        try {
            await interaction.guild.scheduledEvents.create({
                name: name,
                scheduledStartTime: scheduledStartTime,
                privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                entityType: channel? GuildScheduledEventEntityType.Voice : GuildScheduledEventEntityType.External,
                description: description,
                channel: channel? channel.id : undefined,
                entityMetadata: location? { location: location } : undefined,
            });

            await interaction.reply({ content: `Događaj "${name}" je uspešno kreiran!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Došlo je do greške prilikom kreiranja događaja.', ephemeral: true });
        }
    },
};
