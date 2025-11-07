import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, MosqueSummary } from './types';
import { MOCK_USER, MOCK_MOSQUES, MOCK_MEMBERS, MOCK_PRAYER_TIMES, MOCK_ANNOUNCEMENTS, MOCK_DONATIONS, MOCK_EVENTS, MOCK_AUDIT_LOGS } from './constants';

// Deep copy mock data to avoid modifying the original constants
let mosques: Mosque[] = JSON.parse(JSON.stringify(MOCK_MOSQUES));
let members: Member[] = JSON.parse(JSON.stringify(MOCK_MEMBERS));
// Ensure prayerTimes also gets an ID on initialization as required by DataTable
let prayerTimes: PrayerTime[] = JSON.parse(JSON.stringify(MOCK_PRAYER_TIMES)).map((pt: PrayerTime, index: number) => ({ ...pt, id: pt.id || `pt-${index + 1}` }));
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
    prayerTimes, // prayerTimes should now have IDs
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
        await simulateDelay(100);

        const allPrayerTimes = await db.getCollection<'prayerTimes'>(mosqueId, 'prayerTimes'); 
        const membersForMosque = await db.getCollection<'members'>(mosqueId, 'members');
        const eventsForMosque = await db.getCollection<'events'>(mosqueId, 'events');

        let nextPrayer: { name: string; time: string; id: string } | null = null;
        if (allPrayerTimes.length > 0) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const sortedTimes = [...allPrayerTimes].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            nextPrayer = sortedTimes.find(p => timeToMinutes(p.time) > currentTime) || sortedTimes[0];
        }

        const upcomingEventCount = eventsForMosque.filter(e => new Date(e.date) >= new Date()).length;

        return {
            nextPrayer: nextPrayer ? { name: nextPrayer.name, time: nextPrayer.time, id: nextPrayer.id } : null,
            memberCount: membersForMosque.length,
            upcomingEventCount,
        };
    },

    getCollection: async <K extends keyof CollectionTypeMap>(mosqueId: string, collectionName: K): Promise<Array<CollectionTypeMap[K]>> => {
        await simulateDelay(50);
        
        // Ensure dataStores[collectionName] is an array, or handle unexpected collectionName
        const store = dataStores[collectionName];
        if (!Array.isArray(store)) {
            console.error(`Collection '${collectionName}' is not an array or does not exist in dataStores.`);
            return []; // Return an empty array to prevent filter error
        }

        if (collectionName === 'prayerTimes') {
            return [...store] as Array<CollectionTypeMap[K]>;
        }
        
        // For other collections, filter by mosqueId.
        return (store.filter(item => (item as { mosqueId: string }).mosqueId === mosqueId)) as Array<CollectionTypeMap[K]>;
    },

    addDoc: async <K extends keyof CollectionTypeMap>(mosqueId: string, collectionName: K, data: Omit<CollectionTypeMap[K], 'id' | 'mosqueId'>): Promise<CollectionTypeMap[K]> => {
        await simulateDelay(100);
        
        const newId = `${collectionName.slice(0, 3)}-${Date.now()}`;

        if (collectionName === 'prayerTimes') {
            const newPrayerTime: PrayerTime = { id: newId, ...(data as Omit<PrayerTime, 'id'>) };
            (dataStores['prayerTimes'] as PrayerTime[]).push(newPrayerTime);
            return newPrayerTime as CollectionTypeMap[K];
        }

        const newDoc = {
            id: newId,
            mosqueId,
            ...data
        } as CollectionTypeMap[K];

        (dataStores[collectionName] as Array<CollectionTypeMap[K]>).push(newDoc);
        return newDoc;
    },

    updateDoc: async <K extends keyof CollectionTypeMap>(collectionName: K, data: CollectionTypeMap[K]): Promise<CollectionTypeMap[K]> => {
        await simulateDelay(100);
        
        const store = (dataStores[collectionName] as Array<CollectionTypeMap[K]>);
        const docIndex = store.findIndex(doc => doc.id === data.id);
        if (docIndex > -1) {
            // Merge properties, but ensure 'id' and 'mosqueId' (if present) are preserved from original
            const updatedDoc = { ...store[docIndex], ...data };
            store[docIndex] = updatedDoc;
            return updatedDoc;
        }
        throw new Error("Document not found");
    },
    
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