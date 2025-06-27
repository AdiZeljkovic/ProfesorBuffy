const SQLite = require('better-sqlite3');
const path = require('path');

const db = new SQLite(path.resolve('database.sqlite'), { fileMustExist: false });

// Funkcija za inicijalizaciju tabela
function initDb() {
    // Tabela za RSS feedove
    db.exec(`
        CREATE TABLE IF NOT EXISTS last_posts (
            feed_url TEXT PRIMARY KEY,
            last_guid TEXT NOT NULL,
            last_title TEXT
        );
    `);
    
    // Tabela za sistem nivelisanja
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1
        );
    `);
    console.log('Baza podataka uspešno inicijalizovana.');
}

initDb();

module.exports = db;
