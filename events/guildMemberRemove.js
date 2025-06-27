// events/guildMemberRemove.js
const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (!logChannelId) return;

        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // Provera da li je korisnik izbačen (kick) ili banovan
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });

        const kickLog = fetchedLogs.entries.first();

        let reason = 'Korisnik je sam napustio server.';
        let executor = 'N/A';

        if (kickLog && kickLog.target.id === member.id) {
            reason = `Korisnik je izbačen. Razlog: ${kickLog.reason || 'Nije naveden'}`;
            executor = kickLog.executor ? kickLog.executor.tag : 'N/A';
        } else {
            const banLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            const banLog = banLogs.entries.first();
            if (banLog && banLog.target.id === member.id) {
                reason = `Korisnik je banovan. Razlog: ${banLog.reason || 'Nije naveden'}`;
                executor = banLog.executor ? banLog.executor.tag : 'N/A';
            }
        }

        const leaveEmbed = new EmbedBuilder()
           .setColor('#ff0000')
           .setTitle('Član je napustio server')
           .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
           .addFields(
                { name: 'Korisnik', value: `${member.user} (${member.id})`, inline: false },
                { name: 'Razlog odlaska', value: reason, inline: false },
                { name: 'Izvršilac akcije', value: executor, inline: true }
            )
           .setTimestamp()
           .setFooter({ text: `ID korisnika: ${member.id}` });
        
        logChannel.send({ embeds: [leaveEmbed] });
    },
};
