const Database = require('better-sqlite3');
const { EmbedBuilder } = require('discord.js');

// Inicijalizacija baze podataka (kreirat će fajl 'levels.db' u glavnom folderu)
const db = new Database('levels.db');

// Kreiranje tabele za čuvanje podataka ako već ne postoji
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        guildId TEXT,
        userId TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1
    )
`).run();

// Mapa koja povezuje nivo sa ID-em uloge
// Ovdje unesi ID-jeve uloga koje si kreirao na serveru!
const levelRoles = {
    1: '1388122709027852470',   // Npr. za ulogu "User"
    5: '1388122822999674890',   // Npr. za ulogu "User"
    15: '1388122864254718002', // Npr. za "Povezani Korisnik"
    30: '1388123517605773342', // Npr. za "Veteran"
    50: '1388123600019525693', // Npr. za "Overclocker"
    75: '1388123672509943878'  // Npr. za "Legenda Portala"
};

// Cooldown da se spriječi spamovanje poruka za XP
const cooldowns = new Set();

// Funkcija za dodjelu XP-a
async function addXp(member) {
    const userId = member.id;
    const guildId = member.guild.id;
    const userIdentifier = `${guildId}-${userId}`;

    // Ako je korisnik na cooldownu, ne radi ništa
    if (cooldowns.has(userId)) return;

    // Uzimamo podatke o korisniku iz baze
    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userIdentifier);

    // Ako korisnik ne postoji u bazi, kreiramo novi unos
    if (!user) {
        user = { id: userIdentifier, guildId, userId, xp: 0, level: 1 };
        db.prepare('INSERT INTO users (id, guildId, userId, xp, level) VALUES (?, ?, ?, ?, ?)')
          .run(user.id, user.guildId, user.userId, user.xp, user.level);
    }

    // Dodajemo nasumičan broj XP-a (npr. između 15 i 25)
    const xpToAdd = Math.floor(Math.random() * 11) + 15;
    user.xp += xpToAdd;

    // Formula za izračunavanje potrebnog XP-a za sljedeći nivo
    const xpNeededForNextLevel = 5 * (user.level ** 2) + 50 * user.level + 100;

    // Provjera da li je korisnik dostigao novi nivo
    if (user.xp >= xpNeededForNextLevel) {
        user.level++;
        // Opciono: možeš resetovati XP na 0 ili oduzeti potreban XP
        // user.xp = user.xp - xpNeededForNextLevel; 

        console.log(`${member.user.tag} je dostigao/la nivo ${user.level}!`);

        // Pošalji poruku o novom nivou
        const channel = member.channel; // Šaljemo u isti kanal gdje je poruka poslata
        const levelUpEmbed = new EmbedBuilder()
            .setColor('#f0d000')
            .setTitle('🎉 Level Up!')
            .setDescription(`Čestitamo, <@${userId}>! Dostigao/la si **Nivo ${user.level}**! Nastavi tako!`);
        
        try {
            await channel.send({ embeds: [levelUpEmbed] });
        } catch (error) {
            console.error("Nisam mogao poslati Level Up poruku:", error);
        }

        // Provjera i dodjela nove uloge
        const roleId = levelRoles[user.level];
        if (roleId) {
            try {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Dodata uloga "${role.name}" korisniku ${member.user.tag}.`);
                }
            } catch (error) {
                console.error(`Greška pri dodjeli uloge za nivo ${user.level}:`, error);
            }
        }
    }

    // Ažuriranje podataka u bazi
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?')
      .run(user.xp, user.level, user.id);

    // Stavi korisnika na cooldown
    cooldowns.add(userId);
    setTimeout(() => {
        cooldowns.delete(userId);
    }, 60 * 1000); // Cooldown od 60 sekundi
}

// Izvozimo funkciju da je možemo koristiti u eventu
module.exports = { addXp };