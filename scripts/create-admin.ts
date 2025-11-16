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

        // Check if admin user already exists (by email or username)
        const existingUser = await pool.query(
            'SELECT * FROM "users" WHERE email = $1 OR username = $2', 
            ['admin@masjid.com', 'admin']
        );
        
        if (existingUser.rows.length > 0) {
            console.log('⚠ Admin user already exists!');
            console.log('Email: admin@masjid.com');
            console.log('Username: admin');
            console.log('\nUpdating user with proper credentials...');
            
            // Update existing user with correct role, username, and password
            const passwordHash = await bcrypt.hash('password123', 10);
            await pool.query(
                `UPDATE "users" 
                 SET password_hash = $1, 
                     role = $2, 
                     username = $3,
                     email = $4
                 WHERE email = $5 OR username = $6`,
                [passwordHash, 'Admin', 'admin', 'admin@masjid.com', 'admin@masjid.com', 'admin']
            );
            console.log('✅ Admin user updated successfully!');
            console.log('   - Role set to: Admin');
            console.log('   - Username set to: admin');
            console.log('   - Password updated to: password123\n');
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

            // Create admin user with role and username
            const userId = `user-${nanoid()}`;
            const passwordHash = await bcrypt.hash('password123', 10);
            const avatar = 'https://api.dicebear.com/8.x/initials/svg?seed=Admin';

            await pool.query(
                `INSERT INTO "users" (id, name, email, username, password_hash, role, mosque_id, avatar) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [userId, 'Admin', 'admin@masjid.com', 'admin', passwordHash, 'Admin', mosqueId, avatar]
            );

            console.log('✅ Admin user created successfully!\n');
        }

        console.log('📋 Login Credentials:');
        console.log('   Email: admin@masjid.com');
        console.log('   Username: admin');
        console.log('   Password: password123');
        console.log('   Role: Admin\n');
        
        console.log('💡 You can log in with either email or username\n');

        await pool.end();
    } catch (error: any) {
        console.error('✗ Error creating admin user:', error.message);
        if (error.message.includes('password authentication failed')) {
            console.error('\n⚠ Database connection failed. Please check your DATABASE_URL in .env file.');
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.error('\n⚠ Database schema is outdated. Please run:');
            console.error('   npm run setup-db');
            console.error('   npm run migrate');
        }
        await pool.end();
        process.exit(1);
    }
}

createAdmin();

