// events/ready.js
const { Events } = require('discord.js');

// Učitavamo obje funkcije koje želimo da koristimo (svaku samo jednom)
const checkWordPress = require('../functions/checkWordPress.js');
const { checkFeeds } = require('../services/rssService.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        // Jedna poruka kada je bot spreman
        console.log(`Spreman! Ulogovan kao ${client.user.tag}`);

        // --- Logika za WordPress provjeru ---
        console.log('Pokrećem petlju za provjeru WordPressa (svakih 5 min)...');
        checkWordPress(client); // Pokreni odmah
        setInterval(() => checkWordPress(client), 5 * 60 * 1000); // Ponavljaj na 5 min

        // --- Logika za provjeru ostalih RSS feedova ---
        console.log('Pokrećem periodičnu proveru ostalih RSS feedova (svakih 15 min)...');
        checkFeeds(client); // Pokreni odmah
        setInterval(() => checkFeeds(client), 15 * 60 * 1000); // Ponavljaj na 15 min
    },
};