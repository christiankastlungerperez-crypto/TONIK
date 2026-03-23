const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { open } = require('sqlite');

async function setupDB() {
    const dbPath = path.resolve(__dirname, 'crm.sqlite');
    
    // Abrimos la base de datos local SQLite
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Creamos la tabla principal para almacenar todo el estado de la app de forma dinámica
    await db.exec(`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY,
            key_name TEXT UNIQUE,
            data_json TEXT
        )
    `);
    
    return db;
}

module.exports = setupDB;
