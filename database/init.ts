import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {
    // Read and execute migration files
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

    for (const migrationFile of migrationFiles) {
        const migration = fs.readFileSync(
            path.join(migrationsPath, migrationFile), 
            'utf8'
        );
        
        const statements = migration
            .split('\n')
            .filter(line => !line.startsWith('--')) // Remove SQL comments
            .join('\n')
            .split(';')
            .filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                db.prepare(statement).run();
            }
        }
    }

    console.log('Database initialized successfully');
}

// Run initialization if this is the main module
if (import.meta.url === `file://${__filename}`) {
    initializeDatabase();
}

export default initializeDatabase;