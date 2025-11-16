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
        
        // Get all migration files and sort them
        const migrationsDir = join(__dirname, '../database/migrations');
        const fs = await import('fs');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.match(/^\d{3}_.*\.sql$/))
            .sort(); // This will sort: 001_, 002_, 003_, etc.
        
        if (migrationFiles.length === 0) {
            console.log('⚠ No migration files found');
            await pool.end();
            return;
        }
        
        console.log(`\nFound ${migrationFiles.length} migration file(s):`);
        migrationFiles.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
        console.log('');
        
        // Run each migration
        for (const migrationFile of migrationFiles) {
            const migrationPath = join(migrationsDir, migrationFile);
            const migration = readFileSync(migrationPath, 'utf-8');
            
            console.log(`\nRunning migration: ${migrationFile}`);
            console.log('─'.repeat(50));
        
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
                            console.log(`  ✓ Added column: ${colMatch ? colMatch[1] : 'unknown'}`);
                        } else if (statement.includes('ALTER COLUMN')) {
                            console.log('  ✓ Modified column');
                        }
                    } else if (statement.includes('UPDATE')) {
                        const result = await pool.query(statement);
                        console.log(`  ✓ Updated ${result.rowCount} rows`);
                    } else if (statement.includes('CREATE INDEX')) {
                        const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (idx_\w+)/i);
                        console.log(`  ✓ Created index: ${indexMatch ? indexMatch[1] : 'unknown'}`);
                    } else if (statement.includes('CREATE TABLE')) {
                        console.log('  ✓ Created table');
                    }
                } catch (error: any) {
                    // Ignore "already exists" errors for idempotency
                    if (error.message.includes('already exists') || 
                        error.message.includes('duplicate') ||
                        error.code === '42701' || // duplicate_column
                        error.code === '42P07') { // duplicate_table
                        console.log(`  ℹ Skipping (already exists)`);
                    } else {
                        console.error(`  ✗ Error on statement ${i + 1}:`, error.message);
                        console.error('  Statement:', statement.substring(0, 150));
                        // Don't exit, continue with other statements
                    }
                }
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✓ All migrations complete!');
        console.log('='.repeat(50));
        console.log('\nNext steps:');
        console.log('1. Create an admin user if you haven\'t already: npm run create-admin');
        console.log('2. Users can now register as Imam or Muazzin through the UI');
        console.log('3. Clear browser localStorage and log in again if you had issues');
        
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
