import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createAdmin() {
    try {
        console.log('Setting up admin user...\n');

        // Check if admin user already exists
        const existingUser = await pool.query('SELECT * FROM "users" WHERE email = $1', ['admin@masjid.com']);
        
        if (existingUser.rows.length > 0) {
            console.log('⚠ Admin user already exists!');
            console.log('Email: admin@masjid.com');
            console.log('\nTo reset the password, you can:');
            console.log('1. Delete the existing user from the database');
            console.log('2. Run this script again\n');
            
            // Ask if user wants to update password
            const passwordHash = await bcrypt.hash('password123', 10);
            await pool.query(
                'UPDATE "users" SET password_hash = $1 WHERE email = $2',
                [passwordHash, 'admin@masjid.com']
            );
            console.log('✅ Password updated to: password123\n');
        } else {
            // Check if we have any mosques, if not create one
            const mosques = await pool.query('SELECT * FROM mosques LIMIT 1');
            let mosqueId: string;

            if (mosques.rows.length === 0) {
                console.log('No mosque found, creating default mosque...');
                mosqueId = `mosque-${nanoid()}`;
                await pool.query(
                    'INSERT INTO mosques (id, name, address, logo_url) VALUES ($1, $2, $3, $4)',
                    [
                        mosqueId,
                        'Al-Rahma Masjid',
                        '123 Islamic Way, Muslim Town',
                        'https://api.dicebear.com/8.x/initials/svg?seed=Al-Rahma'
                    ]
                );
                console.log('✅ Created default mosque\n');
            } else {
                mosqueId = mosques.rows[0].id;
                console.log(`✅ Using existing mosque: ${mosques.rows[0].name}\n`);
            }

            // Create admin user
            const userId = `user-${nanoid()}`;
            const passwordHash = await bcrypt.hash('password123', 10);

            await pool.query(
                'INSERT INTO "users" (id, name, email, password_hash, mosque_id) VALUES ($1, $2, $3, $4, $5)',
                [userId, 'Admin', 'admin@masjid.com', passwordHash, mosqueId]
            );

            console.log('✅ Admin user created successfully!\n');
        }

        console.log('📋 Login Credentials:');
        console.log('   Email: admin@masjid.com');
        console.log('   Password: password123\n');

        await pool.end();
    } catch (error: any) {
        console.error('✗ Error creating admin user:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n⚠ Database connection failed. Please check your DATABASE_URL in .env file.');
        }
        await pool.end();
        process.exit(1);
    }
}

createAdmin();

