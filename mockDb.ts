

import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, MosqueSummary } from './types';
import { MOCK_USER, MOCK_MOSQUES, MOCK_MEMBERS, MOCK_PRAYER_TIMES, MOCK_ANNOUNCEMENTS, MOCK_DONATIONS, MOCK_EVENTS, MOCK_AUDIT_LOGS } from './constants';

// Deep copy mock data to avoid modifying the original constants
let mosques: Mosque[] = JSON.parse(JSON.stringify(MOCK_MOSQUES));
let members: Member[] = JSON.parse(JSON.stringify(MOCK_MEMBERS));
let prayerTimes: PrayerTime[] = JSON.parse(JSON.stringify(MOCK_PRAYER_TIMES)).map((pt: Omit<PrayerTime, 'id'>, index: number) => ({ ...pt, id: `pt-${index + 1}` })); // Add IDs
let announcements: Announcement[] = JSON.parse(JSON.stringify(MOCK_ANNOUNCEMENTS));
let donations: Donation[] = JSON.parse(JSON.stringify(MOCK_DONATIONS));
let events: CommunityEvent[] = JSON.parse(JSON.stringify(MOCK_EVENTS));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS));

// Define a type map to associate collection names with their document types
interface CollectionTypeMap {
    members: Member;
    prayerTimes: PrayerTime;
    announcements: Announcement;
    donations: Donation;
    events: CommunityEvent;
    auditLogs: AuditLog;
}

// Explicitly type dataStores to leverage CollectionTypeMap
const dataStores: { [K in keyof CollectionTypeMap]: CollectionTypeMap[K][] } = {
    members,
    prayerTimes,
    announcements,
    donations,
    events,
    auditLogs
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const timeToMinutes = (time: string) => {
    const [h, m] = time.match(/\d+/g) || ['0', '0'];
    let hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    if (time.toLowerCase().includes('pm') && hours !== 12) hours += 12;
    if (time.toLowerCase().includes('am') && hours === 12) hours = 0;
    return hours * 60 + minutes;
};


export const db = {
    login: async (email: string, password: string): Promise<User | null> => {
        await simulateDelay(300);
        // NOTE: In a real app, password would be hashed. This is for demo purposes.
        if (email === MOCK_USER.email && password === 'password123') {
            return { ...MOCK_USER };
        }
        return null;
    },

    getMosques: async (): Promise<Mosque[]> => {
        await simulateDelay(50);
        return [...mosques];
    },

    createMosque: async (data: Omit<Mosque, 'id' | 'logoUrl'>): Promise<Mosque> => {
        await simulateDelay(100);
        const newMosque: Mosque = { 
            id: `mosque-${Date.now()}`, 
            logoUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
            ...data 
        };
        mosques.push(newMosque);
        return newMosque;
    },

    getMosqueSummary: async (mosqueId: string): Promise<MosqueSummary> => {
        await simulateDelay(100); // Simulate network delay

        // Fix: Explicitly specify the generic type parameter as string literal of collection names
        const allPrayerTimes = await db.getCollection<'prayerTimes'>(mosqueId, 'prayerTimes'); 
        const membersForMosque = await db.getCollection<'members'>(mosqueId, 'members');
        const eventsForMosque = await db.getCollection<'events'>(mosqueId, 'events');

        // Calculate next prayer
        let nextPrayer: { name: string; time: string; id: string } | null = null;
        if (allPrayerTimes.length > 0) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const sortedTimes = [...allPrayerTimes].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            nextPrayer = sortedTimes.find(p => timeToMinutes(p.time) > currentTime) || sortedTimes[0];
        }

        // Calculate upcoming events (simple count for now, could be filtered by date)
        const upcomingEventCount = eventsForMosque.filter(e => new Date(e.date) >= new Date()).length; // Filter for future events

        return {
            nextPrayer: nextPrayer ? { name: nextPrayer.name, time: nextPrayer.time, id: nextPrayer.id } : null,
            memberCount: membersForMosque.length,
            upcomingEventCount,
        };
    },

    // Fix: Use CollectionTypeMap for generic type K, and narrow return type based on K
    getCollection: async <K extends keyof CollectionTypeMap>(mosqueId: string, collectionName: K): Promise<Array<CollectionTypeMap[K]>> => {
        await simulateDelay(50);
        
        if (collectionName === 'prayerTimes') {
            // Prayer times are not mosque-specific in this mock.
            return [...dataStores.prayerTimes] as Array<CollectionTypeMap[K]>;
        }
        
        const store = dataStores[collectionName];
        // For other collections, filter by mosqueId.
        // Assert item to have mosqueId since prayerTimes is handled above.
        return (store.filter(item => (item as { mosqueId: string }).mosqueId === mosqueId)) as Array<CollectionTypeMap[K]>;
    },

    // Fix: Use CollectionTypeMap for generic type K and data parameter
    addDoc: async <K extends keyof CollectionTypeMap>(mosqueId: string, collectionName: K, data: Omit<CollectionTypeMap[K], 'id' | 'mosqueId'>): Promise<CollectionTypeMap[K]> => {
        await simulateDelay(100);
        
        // Generate a simple ID
        const newId = `${collectionName.slice(0, 3)}-${Date.now()}`;

        if (collectionName === 'prayerTimes') {
            // Handle PrayerTime specifically as it doesn't have mosqueId
            const newPrayerTime: PrayerTime = { id: newId, ...(data as Omit<PrayerTime, 'id'>) };
            (dataStores['prayerTimes'] as PrayerTime[]).push(newPrayerTime);
            return newPrayerTime as CollectionTypeMap[K];
        }

        // For other collections, construct the document with mosqueId
        const newDoc = {
            id: newId,
            mosqueId,
            ...data
        } as CollectionTypeMap[K]; // Fix: Cast to the specific document type

        (dataStores[collectionName] as Array<CollectionTypeMap[K]>).push(newDoc);
        return newDoc;
    },

    // Fix: Use CollectionTypeMap for generic type K and data parameter
    updateDoc: async <K extends keyof CollectionTypeMap>(collectionName: K, data: CollectionTypeMap[K]): Promise<CollectionTypeMap[K]> => {
        await simulateDelay(100);
        
        // Fix: Correctly type `store` using CollectionTypeMap
        const store = (dataStores[collectionName] as Array<CollectionTypeMap[K]>);
        const docIndex = store.findIndex(doc => doc.id === data.id);
        if (docIndex > -1) {
            store[docIndex] = { ...store[docIndex], ...data };
            return store[docIndex];
        }
        throw new Error("Document not found");
    },
    
    // Fix: Use CollectionTypeMap for generic type K
    deleteDoc: async <K extends keyof CollectionTypeMap>(collectionName: K, docId: string): Promise<void> => {
        await simulateDelay(100);
        const store = dataStores[collectionName] as Array<CollectionTypeMap[K]>;
        const docIndex = store.findIndex(doc => doc.id === docId);
        if (docIndex > -1) {
            store.splice(docIndex, 1);
            return;
        }
        throw new Error("Document not found");
    }
};