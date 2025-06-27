// events/guildMemberAdd.js
const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        const autoRoleId = process.env.AUTO_ROLE_ID;

        if (!welcomeChannelId ||!autoRoleId) {
            console.log('ID kanala za dobrodošlicu ili ID automatske uloge nije podešen u.env fajlu.');
            return;
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            console.log('Kanal za dobrodošlicu nije pronađen.');
            return;
        }

        // Kreiranje embed poruke
        const welcomeEmbed = new EmbedBuilder()
           .setColor('#00ff00')
           .setTitle(`Dobrodošao/la u ${member.guild.name}!`)
           .setDescription(`Zdravo ${member.user}, nadamo se da ćeš uživati u našoj zajednici!`)
           .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
           .addFields({ name: 'Ukupno članova', value: `${member.guild.memberCount}` })
           .setTimestamp();

        welcomeChannel.send({ embeds: [welcomeEmbed] });

        // Dodeljivanje automatske uloge
        try {
            const role = member.guild.roles.cache.get(autoRoleId);
            if (role) {
                await member.roles.add(role);
                console.log(`Dodata uloga "${role.name}" korisniku ${member.user.tag}.`);
            } else {
                console.log('Automatska uloga nije pronađena.');
            }
        } catch (error) {
            console.error('Greška prilikom dodeljivanja automatske uloge:', error);
        }
    },
};

