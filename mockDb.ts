import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog } from './types';
import { MOCK_MOSQUES, MOCK_MEMBERS, MOCK_PRAYER_TIMES, MOCK_ANNOUNCEMENTS, MOCK_DONATIONS, MOCK_EVENTS, MOCK_AUDIT_LOGS } from './constants';

// Deep copy mock data to avoid modifying the original constants
let mosques: Mosque[] = JSON.parse(JSON.stringify(MOCK_MOSQUES));
let members: Member[] = JSON.parse(JSON.stringify(MOCK_MEMBERS));
let prayerTimes: PrayerTime[] = JSON.parse(JSON.stringify(MOCK_PRAYER_TIMES));
let announcements: Announcement[] = JSON.parse(JSON.stringify(MOCK_ANNOUNCEMENTS));
let donations: Donation[] = JSON.parse(JSON.stringify(MOCK_DONATIONS));
let events: CommunityEvent[] = JSON.parse(JSON.stringify(MOCK_EVENTS));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS));


const dataStores = {
    members,
    prayerTimes,
    announcements,
    donations,
    events,
    auditLogs
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

type CollectionName = keyof typeof dataStores;
type Document = Member | Announcement | Donation | CommunityEvent | AuditLog;

export const db = {
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

    getCollection: async <T extends Document | PrayerTime>(mosqueId: string, collectionName: CollectionName | 'prayerTimes'): Promise<T[]> => {
        await simulateDelay(50);
        // prayerTimes is static for now for all mosques in this mock setup
        if (collectionName === 'prayerTimes') {
            return [...prayerTimes] as T[];
        }
        
        const store = dataStores[collectionName as CollectionName];
        // Filter collections that have a mosqueId property
        if (store.length > 0 && 'mosqueId' in store[0]) {
            return store.filter(item => (item as Document).mosqueId === mosqueId) as T[];
        }
        // For collections without mosqueId, return the whole collection (like prayer times)
        return [...store] as T[];
    },

    addDoc: async <T extends Omit<Document, 'id' | 'mosqueId'>>(mosqueId: string, collectionName: CollectionName, data: T): Promise<Document> => {
        await simulateDelay(100);
        // FIX: Bypassing a TypeScript limitation with complex union types and generics by casting to 'unknown' first.
        const newDoc = {
            id: `${collectionName.slice(0, 3)}-${Date.now()}`,
            mosqueId,
            ...data
        } as unknown as Document;
        
        (dataStores[collectionName] as Document[]).push(newDoc);
        return newDoc;
    },

    updateDoc: async <T extends {id: string}>(collectionName: CollectionName, data: T): Promise<T> => {
        await simulateDelay(100);
        // FIX: Bypassing a TypeScript limitation where it can't link the collectionName string to the generic type T.
        const store = dataStores[collectionName] as unknown as T[];
        const docIndex = store.findIndex(doc => doc.id === data.id);
        if (docIndex > -1) {
            store[docIndex] = { ...store[docIndex], ...data };
            return store[docIndex];
        }
        throw new Error("Document not found");
    },
    
    deleteDoc: async (collectionName: CollectionName, docId: string): Promise<void> => {
        await simulateDelay(100);
        const store = dataStores[collectionName] as {id: string}[];
        const docIndex = store.findIndex(doc => doc.id === docId);
        if (docIndex > -1) {
            store.splice(docIndex, 1);
            return;
        }
        throw new Error("Document not found");
    }
};