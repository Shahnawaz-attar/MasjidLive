import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'masjid.sqlite');
const _db = new Database(dbPath);

// Enable foreign keys
_db.pragma('foreign_keys = ON');

// Export as `any` to avoid leaking the external Database type into the public API
const db: any = _db;

export default db;