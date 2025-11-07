import { nanoid } from 'nanoid';
import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog } from '../types';
import db from './db';
import bcrypt from 'bcryptjs';

type CollectionType = {
    members: Member[];
    prayerTimes: PrayerTime[];
    announcements: Announcement[];
    donations: Donation[];
    events: CommunityEvent[];
    auditLogs: AuditLog[];
};

interface CountResult {
    count: number;
}

export const dbService = {
    login: async (email: string, password: string): Promise<Omit<User, 'password_hash'> | null> => {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
        if (!user) return null;
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    getMosques: async (): Promise<Mosque[]> => {
        return Promise.resolve(db.prepare('SELECT * FROM mosques').all() as Mosque[]);
    },

    createMosque: (data: Omit<Mosque, 'id' | 'logoUrl'>): Mosque => {
        const id = `mosque-${nanoid()}`;
        const logoUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
        const mosque = { id, logoUrl, ...data };
        
        db.prepare('INSERT INTO mosques (id, name, address, logo_url) VALUES (?, ?, ?, ?)')
          .run(mosque.id, mosque.name, mosque.address, mosque.logoUrl);
        
        return mosque;
    },

    getCollection: async <T extends keyof CollectionType>(
        mosqueId: string,
        collection: T
    ): Promise<CollectionType[T]> => {
        const tableMap = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const rows = db.prepare(`SELECT * FROM ${table} WHERE mosque_id = ?`).all(mosqueId);
        return Promise.resolve(rows as unknown as CollectionType[T]);
    },

    addDoc: <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        mosqueId: string,
        collection: T,
        data: any
    ): any => {
        const id = `${collection.slice(0, 3)}-${nanoid()}`;
        const tableMap = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        db.prepare(`INSERT INTO ${table} (id, mosque_id, ${columns}) VALUES (?, ?, ${placeholders})`)
          .run(id, mosqueId, ...values);

        return { id, mosqueId, ...data };
    },

    updateDoc: <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        data: any
    ): any => {
        const tableMap = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const { id, ...updateData } = data;
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const result = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values);
        if (result.changes === 0) throw new Error("Document not found");

        return data;
    },

    deleteDoc: <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        docId: string
    ): void => {
        const tableMap = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(docId);
        if (result.changes === 0) throw new Error("Document not found");
    },

    getMosqueSummary: async (mosqueId: string) => {
        const memberCount = (db.prepare('SELECT COUNT(*) as count FROM members WHERE mosque_id = ?')
            .get(mosqueId) as CountResult).count;

        const prayerTimes = db.prepare('SELECT * FROM prayer_times WHERE mosque_id = ?')
            .all(mosqueId) as PrayerTime[];

        const now = new Date();
        const upcomingEventCount = (db.prepare(
            'SELECT COUNT(*) as count FROM community_events WHERE mosque_id = ? AND date >= ?'
        ).get(mosqueId, now.toISOString().split('T')[0]) as CountResult).count;

        // Find next prayer
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const timeToMinutes = (time: string) => {
            const [h, m] = time.match(/\d+/g) || ['0', '0'];
            let hours = parseInt(h, 10);
            const minutes = parseInt(m, 10);
            if (time.toLowerCase().includes('pm') && hours !== 12) hours += 12;
            if (time.toLowerCase().includes('am') && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const sortedTimes = [...prayerTimes].sort((a, b) => 
            timeToMinutes(a.time) - timeToMinutes(b.time)
        );
        
        const nextPrayer = sortedTimes.find(p => 
            timeToMinutes(p.time) > currentTime
        ) || sortedTimes[0];

        return {
            nextPrayer: nextPrayer ? { 
                name: nextPrayer.name, 
                time: nextPrayer.time, 
                id: nextPrayer.id 
            } : null,
            memberCount,
            upcomingEventCount
        };
    }
};

export default dbService;