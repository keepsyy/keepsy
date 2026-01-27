const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.resolve(__dirname, 'keepsy.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to keepsy.db');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Keepsy Table
        db.run(`CREATE TABLE IF NOT EXISTS keepsy (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Invites Table
        db.run(`CREATE TABLE IF NOT EXISTS invites (
            id TEXT PRIMARY KEY,
            keepsy_id TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'pending', -- pending | used | expired
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Tables initialized');
    });
}

module.exports = db;
