const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 'data' dio definiše kako komanda izgleda na Discordu
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Provjerava da li je bot online i prikazuje latenciju.'),

    // 'execute' dio sadrži logiku koja se izvršava kada se komanda pozove
    async execute(interaction) {
        // 'interaction.reply' je funkcija za slanje odgovora korisniku
        // Računamo latenciju tako što od trenutnog vremena oduzmemo vrijeme kada je komanda kreirana
        await interaction.reply(`Pong! 🏓 Veza sa mojim centralnim serverom je stabilna. Latencija iznosi ${Date.now() - interaction.createdTimestamp}ms.`);
    },
};