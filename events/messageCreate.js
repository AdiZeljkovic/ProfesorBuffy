// events/messageCreate.js
const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Lista nepoželjnih reči
const badWords = ['lošareč1', 'lošareč2', 'primer'];
const linkRegex = /(https?:\/\/[^\s]+)/g;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return; // Ignoriši poruke botova
        if (message.member.permissions.has('Administrator')) return; // Ignoriši administratore

        const logChannelId = process.env.LOG_CHANNEL_ID;
        const logChannel = message.guild.channels.cache.get(logChannelId);

        const content = message.content.toLowerCase();
        const containsBadWord = badWords.some(word => content.includes(word));
        const containsLink = linkRegex.test(content);

        if (containsBadWord || containsLink) {
            await message.delete();

            const reason = containsBadWord? 'Korišćenje nepoželjnih reči.' : 'Slanje linkova nije dozvoljeno.';

            // Slanje upozorenja korisniku u DM
            try {
                await message.author.send(`Vaša poruka na serveru "${message.guild.name}" je obrisana. Razlog: ${reason}`);
            } catch (error) {
                console.log(`Nije moguće poslati DM korisniku ${message.author.tag}.`);
            }

            // Slanje loga u log kanal
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                   .setColor('#ffa500')
                   .setTitle('Automatska Moderacija')
                   .setDescription(`Poruka korisnika ${message.author} je obrisana.`)
                   .addFields(
                        { name: 'Korisnik', value: `${message.author.tag} (${message.author.id})` },
                        { name: 'Razlog', value: reason },
                        { name: 'Originalna poruka', value: `\`\`\`${message.content}\`\`\`` }
                    )
                   .setTimestamp();
                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};
const db = require('../database');
const xpCooldowns = new Map();

//... unutar execute funkcije, posle provere za botove...

// --- Leveling System ---
if (!message.author.bot) {
    const guildId = message.guild.id;
    const userId = message.author.id;
    const cooldownKey = `${guildId}-${userId}`;

    // Provera cooldown-a (npr. 60 sekundi)
    if (!xpCooldowns.has(cooldownKey) || Date.now() - xpCooldowns.get(cooldownKey) > 60000) {
        const xpToGive = Math.floor(Math.random() * (25 - 15 + 1)) + 15; // Random XP između 15 i 25
        
        // Uzmi trenutne podatke korisnika
        let userData = db.prepare('SELECT * FROM users WHERE guild_id =? AND user_id =?').get(guildId, userId);

        if (userData) {
            userData.xp += xpToGive;
        } else {
            userData = { id: `${guildId}-${userId}`, guild_id: guildId, user_id: userId, xp: xpToGive, level: 1 };
        }

        // Provera za level up
        const nextLevelXP = userData.level * 300;
        if (userData.xp >= nextLevelXP) {
            userData.level++;
            userData.xp = userData.xp - nextLevelXP; // Opciono: resetuj XP ili ga prenesi
            message.channel.send(`🎉 Čestitamo ${message.author}, dostigao/la si nivo **${userData.level}**!`);
        }

        // Sačuvaj podatke u bazu
        db.prepare('INSERT OR REPLACE INTO users (id, guild_id, user_id, xp, level) VALUES (?,?,?,?,?)')
         .run(userData.id, userData.guild_id, userData.user_id, userData.xp, userData.level);

        xpCooldowns.set(cooldownKey, Date.now());
    }
}
