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

async function setupDatabase() {
    try {
        console.log('Connecting to PostgreSQL database...');
        
        // Test connection first
        const testResult = await pool.query('SELECT NOW()');
        console.log('✓ Connected to database at:', testResult.rows[0].now);
        
        // Read and execute schema from 001_initial_schema.sql
        const schemaPath = join(__dirname, '../database/migrations/001_initial_schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        
        // Remove comments and split by semicolons, but handle multi-line statements properly
        const lines = schema.split('\n');
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
                // Extract table/index name for better logging
                const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS idx_\w+ ON (\w+)/i);
                const name = tableMatch ? tableMatch[1] : (indexMatch ? indexMatch[1] : 'item');
                console.log(`✓ Created ${name}`);
            } catch (error: any) {
                // Ignore "already exists" errors
                if (error.message.includes('already exists') || 
                    error.message.includes('duplicate') ||
                    error.code === '42P07') { // PostgreSQL duplicate_table error code
                    const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                    const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS idx_\w+ ON (\w+)/i);
                    const name = tableMatch ? tableMatch[1] : (indexMatch ? indexMatch[1] : 'item');
                    console.log(`ℹ ${name} already exists, skipping...`);
                } else {
                    console.error(`✗ Error on statement ${i + 1}:`, error.message);
                    console.error('Statement:', statement.substring(0, 150));
                    // Don't exit, continue with other statements
                }
            }
        }
        
        console.log('\n✓ Database schema setup complete!');
        await pool.end();
    } catch (error: any) {
        console.error('✗ Error setting up database:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n⚠ Database connection failed. Please check your DATABASE_URL in .env file.');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('\n⚠ Cannot connect to database server. Please check your DATABASE_URL.');
        }
        await pool.end();
        process.exit(1);
    }
}

setupDatabase();

