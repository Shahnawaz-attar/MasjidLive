# SWR State Management Implementation

This document explains the SWR (Stale-While-Revalidate) state management implementation in the Masjid Manager application.

## Overview

We've implemented **SWR** for data fetching and state management, replacing the basic `useState` + `useEffect` pattern with a production-ready solution that provides:

- ✅ Automatic caching
- ✅ Real-time revalidation
- ✅ Optimistic UI updates
- ✅ Automatic refetching on focus/reconnect
- ✅ Deduplicated requests
- ✅ Better performance

## Why SWR?

SWR is a React Hooks library for data fetching developed by Vercel. It provides several advantages over manual state management:

1. **Automatic Caching**: Data is cached and reused across components
2. **Real-time Updates**: Data stays fresh without manual refetching
3. **Optimistic UI**: Instant UI updates with background revalidation
4. **Network Efficiency**: Deduplicates requests and reuses cached data
5. **Built-in Loading States**: Provides `isLoading` and `isError` states
6. **Focus/Reconnect Revalidation**: Automatically refreshes data when user returns to the app

## Implementation Details

### Custom Hooks (`hooks/useData.ts`)

We've created custom hooks for each data type:

```typescript
// Members for a specific mosque
const { members, isLoading, isError, mutate } = useMembers(mosqueId);

// Prayer times for a specific mosque
const { prayerTimes, isLoading, isError, mutate } = usePrayerTimes(mosqueId);

// Announcements
const { announcements, isLoading, isError, mutate } = useAnnouncements(mosqueId);

// Donations
const { donations, isLoading, isError, mutate } = useDonations(mosqueId);

// Events
const { events, isLoading, isError, mutate } = useEvents(mosqueId);

// Audit logs
const { auditLogs, isLoading, isError, mutate } = useAuditLogs(mosqueId);

// All mosques
const { mosques, isLoading, isError, mutate } = useMosques();

// Mosque summary
const { summary, isLoading, isError, mutate } = useMosqueSummary(mosqueId);
```

### Key Features

#### 1. Automatic Mosque-Based Filtering

When you switch mosques, SWR automatically:
- Caches the previous mosque's data
- Fetches new data for the selected mosque
- Instantly shows cached data if available
- Revalidates in the background

```typescript
// In MembersPage.tsx
const { members, isLoading, mutate } = useMembers(mosque.id);
// When mosque.id changes, SWR automatically fetches new data
```

#### 2. Optimistic Updates with `mutate()`

After creating, updating, or deleting data, call `mutate()` to revalidate:

```typescript
const handleDeleteMember = async (memberId: string) => {
    await dbService.deleteDoc('members', memberId);
    mutate(); // Revalidates and refetches members
};
```

#### 3. Loading States

All hooks provide `isLoading` for better UX:

```typescript
{isLoading ? (
    <div className="text-center py-8 text-gray-500">Loading members...</div>
) : (
    <DataTable columns={columns} data={members} />
)}
```

#### 4. Deduplication

If multiple components request the same data, SWR makes only one request:

```typescript
// Both components use same data - only one API call
<MembersPage mosque={mosque} />
<MembersSummary mosque={mosque} />
```

## Updated Components

The following components now use SWR:

### 1. **MembersPage** (`components/pages/MembersPage.tsx`)
- Uses `useMembers(mosque.id)`
- Automatically updates when mosque changes
- Shows loading state while fetching

### 2. **PrayerTimesPage** (`components/pages/PrayerTimesPage.tsx`)
- Uses `usePrayerTimes(mosque.id)`
- Real-time updates when prayer times change

### 3. **AnnouncementsPage** (`components/pages/AnnouncementsPage.tsx`)
- Uses `useAnnouncements(mosque.id)`
- Instant updates after creating/editing announcements

### 4. **App.tsx**
- Uses `useMosques()` for mosque list
- Cached mosque list shared across components

## Configuration

SWR is configured with these options in `hooks/useData.ts`:

```typescript
{
    revalidateOnFocus: false,    // Don't refetch when window regains focus
    revalidateOnReconnect: true, // Refetch when internet reconnects
}
```

You can adjust these based on your needs:
- `revalidateOnFocus: true` - Refetch when user returns to tab
- `dedupingInterval: 2000` - Time window for request deduplication
- `refreshInterval: 10000` - Auto-refresh every 10 seconds

## Benefits for Production

### 1. **Performance**
- Cached data loads instantly
- Reduced API calls
- Better perceived performance

### 2. **User Experience**
- No loading spinners for cached data
- Smooth transitions between mosques
- Real-time data updates

### 3. **Network Efficiency**
- Automatic request deduplication
- Smart refetching only when needed
- Offline support with cached data

### 4. **Developer Experience**
- Simple API with hooks
- Automatic loading/error states
- Easy to debug with SWR DevTools

## Testing

To test the SWR implementation:

1. **Switch between mosques**:
   - First switch: Shows loading
   - Second switch back: Shows cached data instantly

2. **Add/edit/delete data**:
   - Changes reflect immediately
   - Background revalidation ensures fresh data

3. **Open multiple tabs**:
   - Data stays synchronized across tabs

## Future Enhancements

Possible improvements:

1. **Pagination**: Add pagination support for large datasets
2. **Infinite Loading**: Implement infinite scroll with SWR
3. **Real-time Updates**: Add WebSocket support for live data
4. **Optimistic UI**: Show changes before API confirmation
5. **Error Recovery**: Automatic retry on network errors

## Migration from Old Pattern

### Before (useState + useEffect):
```typescript
const [members, setMembers] = useState<Member[]>([]);

const fetchMembers = () => {
    dbService.getCollection(mosque.id, 'members').then(setMembers);
};

useEffect(() => {
    fetchMembers();
}, [mosque]);
```

### After (SWR):
```typescript
const { members, isLoading, mutate } = useMembers(mosque.id);
// Automatically refetches when mosque.id changes
```

## Troubleshooting

### Data not updating after changes?
Call `mutate()` after the operation:
```typescript
await dbService.addDoc(mosqueId, 'members', newMember);
mutate(); // Refresh the data
```

### Want to show cached data while revalidating?
SWR does this by default! The `data` is immediately available from cache while fresh data is being fetched in the background.

### Need to force refresh?
```typescript
mutate(undefined, { revalidate: true });
```

## Resources

- [SWR Documentation](https://swr.vercel.app/)
- [SWR Examples](https://swr.vercel.app/examples)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
