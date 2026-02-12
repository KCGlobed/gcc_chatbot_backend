import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export class DatabaseService {
    private db: Database | null = null;

    constructor() {
        this.init();
    }

    async init() {
        this.db = await open({
            filename: './gcc_bot.db',
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT,
                details_json TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async saveUser(name: string, phone: string) {
        if (!this.db) await this.init();
        await this.db?.run(
            'INSERT INTO users (name, phone) VALUES (?, ?)',
            name,
            phone
        );
        console.log(`User saved: ${name}, ${phone}`);
    }

    async logEvent(event: string, details: any) {
        if (!this.db) await this.init();

        // Console Log for Cloud/StdOut
        console.log(JSON.stringify({
            event,
            ...details,
            time: new Date().toISOString()
        }));

        // SQLite Persistance
        try {
            await this.db?.run(
                'INSERT INTO logs (event, details_json) VALUES (?, ?)',
                event,
                JSON.stringify(details)
            );
        } catch (error) {
            console.error("Failed to save log to SQLite:", error);
        }
    }
}
