import useSWR from 'swr';
import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, MosqueSummary } from '../types';
import dbService from '../database/clientService';

/**
 * Custom hooks for data fetching with SWR
 * Provides automatic caching, revalidation, and optimistic updates
 */

// Fetcher function for SWR
const fetcher = <T,>(key: string, mosqueId: string, collection: string) => {
    return dbService.getCollection(mosqueId, collection as any) as Promise<T[]>;
};

/**
 * Hook to fetch members for a specific mosque
 * Automatically revalidates when mosque changes
 */
export function useMembers(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<Member[]>(
        mosqueId ? [`members`, mosqueId, 'members'] : null,
        ([_, mosqueId, collection]) => fetcher<Member>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        members: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch prayer times for a specific mosque
 */
export function usePrayerTimes(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<PrayerTime[]>(
        mosqueId ? [`prayerTimes`, mosqueId, 'prayerTimes'] : null,
        ([_, mosqueId, collection]) => fetcher<PrayerTime>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        prayerTimes: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch announcements for a specific mosque
 */
export function useAnnouncements(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<Announcement[]>(
        mosqueId ? [`announcements`, mosqueId, 'announcements'] : null,
        ([_, mosqueId, collection]) => fetcher<Announcement>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        announcements: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch donations for a specific mosque
 */
export function useDonations(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<Donation[]>(
        mosqueId ? [`donations`, mosqueId, 'donations'] : null,
        ([_, mosqueId, collection]) => fetcher<Donation>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        donations: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch events for a specific mosque
 */
export function useEvents(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<CommunityEvent[]>(
        mosqueId ? [`events`, mosqueId, 'events'] : null,
        ([_, mosqueId, collection]) => fetcher<CommunityEvent>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        events: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch audit logs for a specific mosque
 */
export function useAuditLogs(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<AuditLog[]>(
        mosqueId ? [`auditLogs`, mosqueId, 'auditLogs'] : null,
        ([_, mosqueId, collection]) => fetcher<AuditLog>(_, mosqueId, collection),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        auditLogs: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch mosque summary
 */
export function useMosqueSummary(mosqueId: string) {
    const { data, error, isLoading, mutate } = useSWR<MosqueSummary>(
        mosqueId ? [`summary`, mosqueId] : null,
        ([_, mosqueId]) => dbService.getMosqueSummary(mosqueId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        summary: data || null,
        isLoading,
        isError: error,
        mutate,
    };
}

/**
 * Hook to fetch all mosques
 */
export function useMosques() {
    const { data, error, isLoading, mutate } = useSWR<Mosque[]>(
        'mosques',
        () => dbService.getMosques(),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        mosques: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
