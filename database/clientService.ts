// Browser-safe database client — makes HTTP calls to API server
import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, MosqueSummary, UserWithoutPassword, UserPreference } from '../types';

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001/api';

type CollectionType = {
    members: Member[];
    prayerTimes: PrayerTime[];
    announcements: Announcement[];
    donations: Donation[];
    events: CommunityEvent[];
    auditLogs: AuditLog[];
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
};

export default {
    login: async (email: string, password: string): Promise<UserWithoutPassword | null> => {
        try {
            return await apiCall('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
        } catch (error) {
            return null;
        }
    },

    register: async (data: {
        name: string;
        username: string;
        password: string;
        email?: string;
        role: 'Imam' | 'Muazzin';
        mosque_id: string;
        address?: string;
    }): Promise<{ success: boolean; user?: UserWithoutPassword; error?: string }> => {
        try {
            const user = await apiCall('/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return { success: true, user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    getMosques: async (): Promise<Mosque[]> => {
        return apiCall('/mosques');
    },

    createMosque: async (data: Omit<Mosque, 'id'>): Promise<Mosque> => {
        return apiCall('/mosques', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateMosque: async (id: string, data: Partial<Omit<Mosque, 'id'>>): Promise<Mosque> => {
        return apiCall(`/mosques/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteMosque: async (id: string): Promise<void> => {
        await apiCall(`/mosques/${id}`, {
            method: 'DELETE',
        });
    },

    getCollection: async <T extends keyof CollectionType>(
        mosqueId: string,
        collection: T
    ): Promise<CollectionType[T]> => {
        return apiCall(`/mosques/${mosqueId}/${collection}`);
    },

    addDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        mosqueId: string,
        collection: T,
        data: any
    ): Promise<any> => {
        return apiCall(`/mosques/${mosqueId}/${collection}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        data: any
    ): Promise<any> => {
        return apiCall(`/${collection}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteDoc: async <T extends 'members' | 'prayerTimes' | 'announcements' | 'donations' | 'events' | 'auditLogs'>(
        collection: T,
        docId: string
    ): Promise<void> => {
        await apiCall(`/${collection}/${docId}`, {
            method: 'DELETE',
        });
    },

    getMosqueSummary: async (mosqueId: string): Promise<MosqueSummary> => {
        return apiCall(`/mosques/${mosqueId}/summary`);
    },

    getUserById: async (id: string): Promise<UserWithoutPassword | null> => {
        try {
            return await apiCall(`/users/${id}`);
        } catch (error) {
            return null;
        }
    },

    getUserByEmail: async (email: string): Promise<UserWithoutPassword | null> => {
        try {
            return await apiCall(`/users/email/${email}`);
        } catch (error) {
            return null;
        }
    },

    updateUser: async (id: string, data: Partial<UserWithoutPassword>): Promise<UserWithoutPassword> => {
        return apiCall(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
        return apiCall(`/users/${id}/change-password`, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },

    // User Preferences
    getUserPreferences: async (userId: string, preferenceType: string = 'dashboard_layout'): Promise<UserPreference | null> => {
        try {
            return await apiCall(`/users/${userId}/preferences/${preferenceType}`);
        } catch (error) {
            return null;
        }
    },

    saveUserPreferences: async (userId: string, preferenceType: string, preferenceData: any): Promise<UserPreference> => {
        return apiCall(`/users/${userId}/preferences`, {
            method: 'POST',
            body: JSON.stringify({ preferenceType, preferenceData }),
        });
    },
};
