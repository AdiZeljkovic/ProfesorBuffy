// services/rssService.js
const Parser = require('rss-parser');
const { EmbedBuilder } = require('discord.js');
const db = require('../database'); // Učitavamo naš database handler

const parser = new Parser();

const feeds = []; // ili popuni sa svojim feedovima

async function checkFeeds(client) {
    for (const feedConfig of feeds) {
        try {
            const feed = await parser.parseURL(feedConfig.url);
            if (!feed.items.length) continue;

            const latestItem = feed.items[0];
            
            // Provera da li je ovaj post već poslat
            const lastPost = db.prepare('SELECT last_guid FROM last_posts WHERE feed_url =?').get(feedConfig.url);

            if (!lastPost || lastPost.last_guid !== latestItem.guid) {
                console.log(`Novi post pronađen za ${feedConfig.name}: ${latestItem.title}`);

                const channel = await client.channels.fetch(feedConfig.channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                       .setColor('#1E90FF')
                       .setTitle(latestItem.title)
                       .setURL(latestItem.link)
                       .setAuthor({ name: feed.title, iconURL: feed.image?.url, url: feed.link })
                       .setDescription((latestItem.contentSnippet?.substring(0, 250) + '...') || 'Nema opisa.')
                       .setTimestamp(new Date(latestItem.isoDate))
                       .setFooter({ text: `Novi sadržaj sa ${feedConfig.name}` });

                    if (feedConfig.name === 'YouTube' && latestItem.link) {
                        const videoId = latestItem.link.split('v=')[1];
                        embed.setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
                    }

                    await channel.send({ embeds: [embed] });

                    // Ažuriranje baze podataka sa GUID-om poslednjeg poslatog posta
                    db.prepare('INSERT OR REPLACE INTO last_posts (feed_url, last_guid, last_title) VALUES (?,?,?)')
                     .run(feedConfig.url, latestItem.guid, latestItem.title);
                }
            }
        } catch (error) {
            console.error(`Greška prilikom provere RSS feed-a za ${feedConfig.name}:`, error);
        }
    }
}

module.exports = { checkFeeds };

