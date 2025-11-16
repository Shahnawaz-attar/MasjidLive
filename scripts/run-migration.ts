import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        console.log('Connecting to PostgreSQL database...');
        
        // Test connection first
        const testResult = await pool.query('SELECT NOW()');
        console.log('✓ Connected to database at:', testResult.rows[0].now);
        
        // Read and execute migration
        const migrationPath = join(__dirname, '../database/migrations/002_add_user_roles.sql');
        const migration = readFileSync(migrationPath, 'utf-8');
        
        console.log('\nRunning migration: 002_add_user_roles.sql');
        console.log('This will add role-based access control fields to the users table...\n');
        
        // Remove comments and split by semicolons
        const lines = migration.split('\n');
        let currentStatement = '';
        const statements: string[] = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            // Skip comment lines
            if (trimmed.startsWith('--') || trimmed.length === 0) {
                continue;
            }
            
            currentStatement += line + '\n';
            
            // If line ends with semicolon, it's the end of a statement
            if (trimmed.endsWith(';')) {
                const statement = currentStatement.trim();
                if (statement.length > 0) {
                    statements.push(statement);
                }
                currentStatement = '';
            }
        }
        
        // Execute statements in order
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                await pool.query(statement);
                
                // Extract operation for better logging
                if (statement.includes('ALTER TABLE')) {
                    if (statement.includes('ADD COLUMN')) {
                        const colMatch = statement.match(/ADD COLUMN (?:IF NOT EXISTS )?(\w+)/i);
                        console.log(`✓ Added column: ${colMatch ? colMatch[1] : 'unknown'}`);
                    } else if (statement.includes('ALTER COLUMN')) {
                        console.log('✓ Modified column');
                    }
                } else if (statement.includes('UPDATE')) {
                    const result = await pool.query(statement);
                    console.log(`✓ Updated ${result.rowCount} rows`);
                } else if (statement.includes('CREATE INDEX')) {
                    const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (idx_\w+)/i);
                    console.log(`✓ Created index: ${indexMatch ? indexMatch[1] : 'unknown'}`);
                }
            } catch (error: any) {
                // Ignore "already exists" errors for idempotency
                if (error.message.includes('already exists') || 
                    error.message.includes('duplicate') ||
                    error.code === '42701' || // duplicate_column
                    error.code === '42P07') { // duplicate_table
                    console.log(`ℹ Skipping (already exists)`);
                } else {
                    console.error(`✗ Error on statement ${i + 1}:`, error.message);
                    console.error('Statement:', statement.substring(0, 150));
                    // Don't exit, continue with other statements
                }
            }
        }
        
        console.log('\n✓ Migration complete!');
        console.log('\nNext steps:');
        console.log('1. Create an admin user if you haven\'t already: npm run create-admin');
        console.log('2. Users can now register as Imam or Muazzin through the UI');
        
        await pool.end();
    } catch (error: any) {
        console.error('✗ Error running migration:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n⚠ Database connection failed. Please check your DATABASE_URL in .env file.');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('\n⚠ Cannot connect to database server. Please check your DATABASE_URL.');
        }
        await pool.end();
        process.exit(1);
    }
}

runMigration();
