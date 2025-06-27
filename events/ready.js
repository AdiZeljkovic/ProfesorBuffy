// events/ready.js
const { Events } = require('discord.js');
const { checkFeeds } = require('../services/rssService'); // Učitavamo rssService

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Spreman! Ulogovan kao ${client.user.tag}`);
        
        // Pokretanje periodične provere RSS feedova
        console.log('Pokrećem periodičnu proveru RSS feedova...');
        checkFeeds(client); // Prva provera odmah po startu
        setInterval(() => checkFeeds(client), 15 * 60 * 1000); // Provera na svakih 15 minuta
    },
};

