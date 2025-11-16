import { Pool, QueryResult } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog } from '../types';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8St4RbYgosaN@ep-jolly-union-ahnu5ito-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

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

// Special column mappings
const columnMappings: Record<string, string> = {
    logo_url: 'logoUrl',
    mosque_id: 'mosqueId',
    password_hash: 'password_hash', // Keep as is for internal use
    donor_name: 'donorName',
    created_at: 'createdAt',
    start_date: 'startDate',
    end_date: 'endDate'
};

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const camelObj: any = {};
        for (const key in obj) {
            // Check if there's a special mapping first
            const camelKey = columnMappings[key] || key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            const value = obj[key];
            // Don't recursively process primitives (strings, numbers, booleans, null, undefined)
            if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                camelObj[camelKey] = value;
            } else {
                camelObj[camelKey] = toCamelCase(value);
            }
        }
        return camelObj;
    }
    return obj;
};

// Reverse column mappings
const reverseColumnMappings: Record<string, string> = {
    logoUrl: 'logo_url',
    mosqueId: 'mosque_id',
    donorName: 'donor_name',
    createdAt: 'created_at',
    startDate: 'start_date',
    endDate: 'end_date'
};

// Helper to convert camelCase to snake_case for database
const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const snakeObj: any = {};
        for (const key in obj) {
            // Check if there's a reverse mapping first
            const snakeKey = reverseColumnMappings[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const value = obj[key];
            // Don't recursively process primitives (strings, numbers, booleans, null, undefined)
            if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                snakeObj[snakeKey] = value;
            } else {
                snakeObj[snakeKey] = toSnakeCase(value);
            }
        }
        return snakeObj;
    }
    return obj;
};

export const pgService = {
    login: async (usernameOrEmail: string, password: string): Promise<Omit<User, 'password_hash'> | null> => {
        // Check if input is email or username
        const result = await pool.query(
            'SELECT * FROM "users" WHERE username = $1 OR email = $1',
            [usernameOrEmail]
        );
        if (result.rows.length === 0) return null;
        
        const user = toCamelCase(result.rows[0]) as User;
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    register: async (data: {
        name: string;
        username: string;
        password: string;
        email?: string;
        role: 'Imam' | 'Muazzin';
        mosque_id: string;
        address?: string;
    }): Promise<{ success: boolean; user?: Omit<User, 'password_hash'>; error?: string }> => {
        // Validate password length
        if (!data.password || data.password.length < 8) {
            return { success: false, error: 'Password must be at least 8 characters long' };
        }

        // Validate username
        if (!data.username || data.username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters long' };
        }

        // Check if username already exists
        const existingUser = await pool.query('SELECT id FROM "users" WHERE username = $1', [data.username]);
        if (existingUser.rows.length > 0) {
            return { success: false, error: 'Username already exists' };
        }

        // Check if email already exists (if provided)
        if (data.email) {
            const existingEmail = await pool.query('SELECT id FROM "users" WHERE email = $1', [data.email]);
            if (existingEmail.rows.length > 0) {
                return { success: false, error: 'Email already exists' };
            }
        }

        // Verify mosque exists
        const mosqueCheck = await pool.query('SELECT id FROM mosques WHERE id = $1', [data.mosque_id]);
        if (mosqueCheck.rows.length === 0) {
            return { success: false, error: 'Invalid mosque ID' };
        }

        try {
            const id = `user-${nanoid()}`;
            const password_hash = await bcrypt.hash(data.password, 10);
            const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`;

            // Insert user
            await pool.query(
                `INSERT INTO "users" (id, name, username, email, password_hash, role, mosque_id, address, avatar) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [id, data.name, data.username, data.email || null, password_hash, data.role, data.mosque_id, data.address || null, avatar]
            );

            // Also create a member entry linked to this user
            // This makes the user visible in the members list but protected from editing
            const memberId = `member-${nanoid()}`;
            const contact = data.email || 'Not provided';
            await pool.query(
                `INSERT INTO members (id, mosque_id, name, role, photo, contact, background, user_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    memberId, 
                    data.mosque_id, 
                    data.name, 
                    data.role, // Use same role as user (Imam or Muazzin)
                    avatar, 
                    contact,
                    `System user - ${data.role}`,
                    id // Link to user
                ]
            );

            const newUser: Omit<User, 'password_hash'> = {
                id,
                name: data.name,
                username: data.username,
                email: data.email,
                role: data.role,
                mosque_id: data.mosque_id,
                address: data.address,
                avatar
            };

            return { success: true, user: newUser };
        } catch (error: any) {
            return { success: false, error: error.message || 'Registration failed' };
        }
    },

    getMosques: async (): Promise<Mosque[]> => {
        const result = await pool.query('SELECT id, name, address, logo_url FROM mosques');
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            address: row.address,
            logoUrl: row.logo_url
        })) as Mosque[];
    },

    createMosque: async (data: Omit<Mosque, 'id' | 'logoUrl'>): Promise<Mosque> => {
        const id = `mosque-${nanoid()}`;
        const logoUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
        
        await pool.query(
            'INSERT INTO mosques (id, name, address, logo_url) VALUES ($1, $2, $3, $4)',
            [id, data.name, data.address, logoUrl]
        );
        
        return { id, logoUrl, ...data };
    },

    updateMosque: async (id: string, data: Partial<Omit<Mosque, 'id'>>): Promise<Mosque> => {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(data.name);
        }
        if (data.address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(data.address);
        }
        if (data.logoUrl !== undefined) {
            updates.push(`logo_url = $${paramCount++}`);
            values.push(data.logoUrl);
        }

        if (updates.length === 0) {
            const result = await pool.query('SELECT * FROM mosques WHERE id = $1', [id]);
            if (result.rows.length === 0) throw new Error("Mosque not found");
            const row = result.rows[0];
            return { id, name: row.name, address: row.address, logoUrl: row.logo_url };
        }

        values.push(id);
        await pool.query(
            `UPDATE mosques SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            values
        );

        const result = await pool.query('SELECT * FROM mosques WHERE id = $1', [id]);
        if (result.rows.length === 0) throw new Error("Mosque not found");
        const row = result.rows[0];
        return { id, name: row.name, address: row.address, logoUrl: row.logo_url };
    },

    deleteMosque: async (id: string): Promise<void> => {
        const result = await pool.query('DELETE FROM mosques WHERE id = $1', [id]);
        if (result.rowCount === 0) throw new Error("Mosque not found");
    },

    getCollection: async <T extends keyof CollectionType>(
        mosqueId: string,
        collection: T
    ): Promise<CollectionType[T]> => {
        const tableMap: Record<string, string> = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const result = await pool.query(`SELECT * FROM ${table} WHERE mosque_id = $1`, [mosqueId]);
        return toCamelCase(result.rows) as CollectionType[T];
    },

    addDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        mosqueId: string,
        collection: T,
        data: any
    ): Promise<any> => {
        const id = `${collection.slice(0, 3)}-${nanoid()}`;
        const tableMap: Record<string, string> = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const snakeData = toSnakeCase(data);
        
        // Remove fields that shouldn't be sent or should be auto-generated
        delete snakeData.mosque_id;
        delete snakeData.mosqueId;
        delete snakeData.created_at;
        delete snakeData.createdAt;
        
        const columns = Object.keys(snakeData).join(', ');
        // Placeholders start from $3 because $1 is id and $2 is mosqueId
        const placeholders = Object.keys(snakeData).map((_, i) => `$${i + 3}`).join(', ');
        const values = Object.values(snakeData);

        // Build the INSERT statement - if no columns, just insert id and mosque_id
        if (columns.length === 0) {
            await pool.query(
                `INSERT INTO ${table} (id, mosque_id) VALUES ($1, $2)`,
                [id, mosqueId]
            );
        } else {
            await pool.query(
                `INSERT INTO ${table} (id, mosque_id, ${columns}) VALUES ($1, $2, ${placeholders})`,
                [id, mosqueId, ...values]
            );
        }

        return { id, mosqueId, ...data };
    },

    updateDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        data: any
    ): Promise<any> => {
        const tableMap: Record<string, string> = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const { id, ...updateData } = data;
        const snakeData = toSnakeCase(updateData);
        
        // Remove fields that shouldn't be updated
        delete snakeData.created_at;
        delete snakeData.createdAt;
        delete snakeData.mosque_id;
        delete snakeData.mosqueId;
        
        const setClause = Object.keys(snakeData).map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = [...Object.values(snakeData), id];

        const result = await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = $${values.length}`, values);
        if (result.rowCount === 0) throw new Error("Document not found");

        return data;
    },

    deleteDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        docId: string
    ): Promise<void> => {
        const tableMap: Record<string, string> = {
            members: 'members',
            prayerTimes: 'prayer_times',
            announcements: 'announcements',
            donations: 'donations',
            events: 'community_events',
            auditLogs: 'audit_logs'
        };

        const table = tableMap[collection];
        const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [docId]);
        if (result.rowCount === 0) throw new Error("Document not found");
    },

    getMosqueSummary: async (mosqueId: string) => {
        const memberResult = await pool.query('SELECT COUNT(*) as count FROM members WHERE mosque_id = $1', [mosqueId]);
        const memberCount = parseInt(memberResult.rows[0].count);

        const prayerTimesResult = await pool.query('SELECT * FROM prayer_times WHERE mosque_id = $1', [mosqueId]);
        const prayerTimes = toCamelCase(prayerTimesResult.rows) as PrayerTime[];

        const now = new Date();
        const eventResult = await pool.query(
            'SELECT COUNT(*) as count FROM community_events WHERE mosque_id = $1 AND date >= $2',
            [mosqueId, now.toISOString().split('T')[0]]
        );
        const upcomingEventCount = parseInt(eventResult.rows[0].count);

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
    },

    getUserById: async (id: string): Promise<Omit<User, 'password_hash'> | null> => {
        const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        const user = toCamelCase(result.rows[0]) as User;
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    getUserByEmail: async (email: string): Promise<Omit<User, 'password_hash'> | null> => {
        const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
        if (result.rows.length === 0) return null;
        const user = toCamelCase(result.rows[0]) as User;
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    updateUser: async (id: string, data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): Promise<Omit<User, 'password_hash'>> => {
        const fields: string[] = [];
        const values: any[] = [];
        let cnt = 1;
        if (data.name !== undefined) { fields.push(`name = $${cnt++}`); values.push(data.name); }
        if (data.email !== undefined) { fields.push(`email = $${cnt++}`); values.push(data.email); }
        if (data.avatar !== undefined) { fields.push(`avatar = $${cnt++}`); values.push(data.avatar); }
        if (!fields.length) throw new Error("No profile fields to update");
        values.push(id);
        await pool.query(`UPDATE "users" SET ${fields.join(', ')} WHERE id = $${cnt}`, values);
        const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [id]);
        if (result.rows.length === 0) throw new Error("User not found");
        const { password_hash, ...without } = toCamelCase(result.rows[0]) as User;
        return without;
    },
    changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [id]);
        if (result.rows.length === 0) return { success: false, error: "User not found" };
        const user = toCamelCase(result.rows[0]) as User;
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) return { success: false, error: "Current password is incorrect" };
        if (!newPassword || newPassword.length < 6) return { success: false, error: "New password too short." };
        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE "users" SET password_hash = $1 WHERE id = $2', [hash, id]);
        return { success: true };
    }
};

export default pgService;

