// events/interactionCreate.js
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nije pronađena komanda koja odgovara imenu ${interaction.commandName}.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Došlo je do greške prilikom izvršavanja ove komande!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Došlo je do greške prilikom izvršavanja ove komande!', ephemeral: true });
            }
        }
    },
};
