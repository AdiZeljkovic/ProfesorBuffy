// events/guildMemberAdd.js
const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Za čitanje .env fajla

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Učitavamo ID-jeve iz .env fajla
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        const autoRoleId = process.env.AUTO_ROLE_ID;
        const rulesChannelId = process.env.RULES_CHANNEL_ID;

        // Provjera da li su svi ID-jevi postavljeni u .env fajlu
        if (!welcomeChannelId || !autoRoleId || !rulesChannelId) {
            console.log('[GREŠKA] Jedan ili više ID-jeva (WELCOME_CHANNEL_ID, AUTO_ROLE_ID, ili RULES_CHANNEL_ID) nije podešen u .env fajlu.');
            return;
        }

        // --- Slanje poruke dobrodošlice ---
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00ff00') // Zelena boja
                .setTitle(`Dobrodošao/la u ${member.guild.name}!`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`Zdravo ${member.user}! Ja sam Profesor Buffy i u ime cijele TechPlay.gg zajednice želim ti dobrodošlicu!\n\nDa bi tvoje iskustvo bilo što bolje, baci pogled na pravila u kanalu <#${rulesChannelId}>.`)
                .addFields({ name: 'Ukupno članova', value: `${member.guild.memberCount}` })
                .setTimestamp();
            
            try {
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
                console.error(`Greška prilikom slanja embed poruke za ${member.user.tag}:`, error);
            }
        } else {
            console.log(`[GREŠKA] Kanal za dobrodošlicu sa ID-em ${welcomeChannelId} nije pronađen.`);
        }

        // --- Dodeljivanje automatske uloge ---
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) {
            try {
                await member.roles.add(role);
                console.log(`Dodata uloga "${role.name}" korisniku ${member.user.tag}.`);
            } catch (error) {
                console.error(`Greška prilikom dodeljivanja uloge korisniku ${member.user.tag}:`, error);
            }
        } else {
            console.log(`[GREŠKA] Uloga za automatsko dodjeljivanje sa ID-em ${autoRoleId} nije pronađena.`);
        }
    },
};