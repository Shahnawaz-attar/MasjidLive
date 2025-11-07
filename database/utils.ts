import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import db from './db';
import { Mosque, User, PrayerTime } from '../types';

export async function setupInitialData() {
    // Check if we already have data
    const existingMosques = db.prepare('SELECT * FROM mosques').all();
    if (existingMosques.length > 0) {
        console.log('Initial data already exists');
        return;
    }

    // Create initial mosque
    const mosqueId = `mosque-${nanoid()}`;
    const mosque: Mosque = {
        id: mosqueId,
        name: 'Al-Rahma Masjid',
        address: '123 Islamic Way, Muslim Town',
        logoUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Al-Rahma`
    };

    db.prepare('INSERT INTO mosques (id, name, address, logo_url) VALUES (?, ?, ?, ?)')
        .run(mosque.id, mosque.name, mosque.address, mosque.logoUrl);

    // Create admin user
    const userId = `user-${nanoid()}`;
    const passwordHash = await bcrypt.hash('admin123', 10);
    const user: User = {
        id: userId,
        name: 'Admin',
        email: 'admin@masjid.com',
        password_hash: passwordHash,
        mosque_id: mosqueId
    };

    db.prepare('INSERT INTO users (id, name, email, password_hash, mosque_id) VALUES (?, ?, ?, ?, ?)')
        .run(user.id, user.name, user.email, user.password_hash, user.mosque_id);

    // Set up initial prayer times
    const prayerTimes: Omit<PrayerTime, 'id'>[] = [
        { name: 'Fajr', time: '05:30 AM' },
        { name: 'Dhuhr', time: '01:30 PM' },
        { name: 'Asr', time: '04:45 PM' },
        { name: 'Maghrib', time: '07:15 PM' },
        { name: 'Isha', time: '08:45 PM' }
    ];

    for (const prayer of prayerTimes) {
        const prayerId = `prayer-${nanoid()}`;
        db.prepare('INSERT INTO prayer_times (id, mosque_id, name, time) VALUES (?, ?, ?, ?)')
            .run(prayerId, mosqueId, prayer.name, prayer.time);
    }

    console.log('Initial data setup complete');
}

export async function backupDatabase() {
    // Implement database backup functionality
    // This is a placeholder for future implementation
    console.log('Database backup not implemented yet');
}