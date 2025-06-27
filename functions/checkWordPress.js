const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const path = require('path');

// Putanja do naše "baze podataka"
const dbPath = path.join(__dirname, '..', 'last_post.json');

// Definišemo asinhronu funkciju koja prima 'client' objekat da bi mogla slati poruke
async function checkWordPress(client) {
    console.log('Provjeravam WordPress RSS feed...');
    try {
        // Učitaj link zadnjeg objavljenog članka iz našeg fajla
        const lastPostData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const lastPostLink = lastPostData.link;

        // Pročitaj RSS feed sa tvog portala
        // OBAVEZNO ZAMIJENI 'https://www.techplay.gg/feed' SA TAČNIM URL-om TVOG FEED-a
        const feed = await parser.parseURL('https://www.techplay.gg/feed');
        
        // Uzmi najnoviji članak sa feed-a
        if (!feed.items.length) {
            console.log('RSS feed je prazan ili ne postoji.');
            return;
        }
        const latestPost = feed.items[0];

        // Ako je link najnovijeg članka RAZLIČIT od onog sačuvanog u našem fajlu...
        if (latestPost.link !== lastPostLink) {
            console.log(`NOVI ČLANAK PRONAĐEN: ${latestPost.title}`);

            // Pronađi kanal u koji treba poslati poruku
            // OBAVEZNO ZAMIJENI 'TVOJ_ID_KANALA_ZA_NOVOSTI' SA STVARNIM ID-em
            const channelId = '769510587175796746';
            const channel = client.channels.cache.get(channelId);

            if (channel) {
                // Sastavi i pošalji poruku
                const message = `🚀 **TechPlay.gg | Nova Objava**\n\n### ${latestPost.title}\n\nCijeli članak možete pročitati ovdje: ${latestPost.link}`;

                await channel.send(message);

                // Nakon slanja, AŽURIRAJ našu "bazu" sa linkom novog članka
                fs.writeFileSync(dbPath, JSON.stringify({ link: latestPost.link }));
                console.log(`Novi članak objavljen i link sačuvan: ${latestPost.link}`);
            } else {
                console.log(`[GREŠKA] Kanal sa ID-em ${channelId} nije pronađen.`);
            }
        } else {
            console.log('Nema novih članaka.');
        }

    } catch (error) {
        console.error('Došlo je do greške pri provjeri WordPressa:', error);
    }
}

// Izvezi funkciju da je možemo koristiti u drugim fajlovima
module.exports = checkWordPress;