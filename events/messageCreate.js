const { Events } = require('discord.js');
const { addXp } = require('../functions/leveling.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignorišemo poruke od botova i poruke iz privatnih kanala (DMs)
        if (message.author.bot || !message.guild) return;

        // Pozivamo našu funkciju za dodjelu XP-a
        await addXp(message.member);

        // Ovdje može stajati i tvoja logika za komande ako je imaš...
    },
};