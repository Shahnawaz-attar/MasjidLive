import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export function createMigration(name: string) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const migrationId = nanoid(6);
    const filename = `${timestamp}_${migrationId}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sql`;
    
    const template = `-- Up
-- Add your migration SQL here

-- Down
-- Add your rollback SQL here
`;

    fs.writeFileSync(path.join(MIGRATIONS_DIR, filename), template);
    console.log(`Created migration: ${filename}`);
}

export function listMigrations() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }
    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith('.sql'))
        .sort();
}

export default {
    createMigration,
    listMigrations
};