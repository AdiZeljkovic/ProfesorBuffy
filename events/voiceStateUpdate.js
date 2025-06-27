// events/voiceStateUpdate.js
const { Events, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const tempChannels = new Map(); // Mapa za praćenje privremenih kanala

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const joinToCreateChannelId = process.env.JOIN_TO_CREATE_CHANNEL_ID;
        const categoryId = process.env.TEMP_CHANNELS_CATEGORY_ID;

        // Korisnik se pridružio "Join to Create" kanalu
        if (newState.channelId === joinToCreateChannelId) {
            const guild = newState.guild;
            const member = newState.member;

            try {
                const tempChannel = await guild.channels.create({
                    name: `Soba - ${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels],
                        },
                        {
                            id: guild.id, // @everyone
                            deny: [PermissionsBitField.Flags.Connect],
                        },
                    ],
                });

                await member.voice.setChannel(tempChannel);
                tempChannels.set(tempChannel.id, member.id); // Pamtimo ko je vlasnik kanala
            } catch (error) {
                console.error('Greška pri kreiranju privremenog kanala:', error);
            }
        }

        // Korisnik je napustio kanal, proveravamo da li je privremeni i prazan
        if (oldState.channel && tempChannels.has(oldState.channel.id)) {
            if (oldState.channel.members.size === 0) {
                try {
                    await oldState.channel.delete('Privremeni kanal je prazan.');
                    tempChannels.delete(oldState.channel.id);
                } catch (error) {
                    console.error('Greška pri brisanju privremenog kanala:', error);
                }
            }
        }
    },
};

