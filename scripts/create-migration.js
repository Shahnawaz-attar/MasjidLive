import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

const name = process.argv[2];
if (!name) {
    console.error('Please provide a name for the migration');
    process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
const migrationId = nanoid(6);
const filename = `${timestamp}_${migrationId}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sql`;

const template = `-- Up
-- Add your migration SQL here

-- Down
-- Add your rollback SQL here
`;

if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

fs.writeFileSync(path.join(MIGRATIONS_DIR, filename), template);
console.log(`Created migration: ${filename}`);