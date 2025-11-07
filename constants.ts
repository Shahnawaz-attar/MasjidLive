import { User, Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog } from './types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@masjid.com',
  avatar: 'https://i.pravatar.cc/150?u=admin'
};

export const MOCK_MOSQUES: Mosque[] = [
    { id: 'mosque-1', name: 'Grand Central Mosque', address: '123 Islamic Center Dr, Metro City', logoUrl: 'https://e7.pngegg.com/pngimages/724/24/png-clipart-al-masjid-an-nabawi-green-dome-mosque-islamic-green-and-brown-mosque-cdr-building-thumbnail.png' },
    { id: 'mosque-2', name: 'Masjid Al-Noor', address: '456 Community Rd, Suburbia', logoUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=Masjid%20Al-Noor' },
];

export const MOCK_MEMBERS: Member[] = [
    { id: 'mem-1', mosqueId: 'mosque-1', name: 'Imam Ahmed', role: 'Imam', photo: 'https://i.pravatar.cc/150?u=imam-ahmed', contact: 'imam.ahmed@email.com', background: 'Lead Imam, scholar in Fiqh.' },
    { id: 'mem-2', mosqueId: 'mosque-1', name: 'Bilal Khan', role: 'Muazzin', photo: 'https://i.pravatar.cc/150?u=bilal-khan', contact: 'bilal.khan@email.com', background: 'Head Muazzin, known for his beautiful adhan.' },
    { id: 'mem-3', mosqueId: 'mosque-1', name: 'Fatima Ali', role: 'Committee', photo: 'https://i.pravatar.cc/150?u=fatima-ali', contact: 'fatima.ali@email.com', background: 'Committee head for outreach programs.' },
    { id: 'mem-4', mosqueId: 'mosque-2', name: 'Sheikh Yusuf', role: 'Imam', photo: 'https://i.pravatar.cc/150?u=sheikh-yusuf', contact: 'sheikh.yusuf@email.com', background: 'Resident Imam and youth counselor.' },
    { id: 'mem-5', mosqueId: 'mosque-2', name: 'Omar Abdullah', role: 'Volunteer', photo: 'https://i.pravatar.cc/150?u=omar-abdullah', contact: 'omar.abdullah@email.com', background: 'Weekend school volunteer teacher.' },
];


export const MOCK_PRAYER_TIMES: PrayerTime[] = [
    { id: 'fajr-1', name: 'Fajr', time: '05:30 AM' },
    { id: 'dhuhr-1', name: 'Dhuhr', time: '01:15 PM' },
    { id: 'asr-1', name: 'Asr', time: '04:45 PM' },
    { id: 'maghrib-1', name: 'Maghrib', time: '07:00 PM' },
    { id: 'isha-1', name: 'Isha', time: '08:30 PM' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann-1', mosqueId: 'mosque-1', title: 'Community Iftar this Friday', body: 'Join us for a community Iftar this Friday after Maghrib prayer. All are welcome!', audience: 'All', date: '2024-05-20' },
    { id: 'ann-2', mosqueId: 'mosque-1', title: 'Volunteer Meeting', body: 'A mandatory meeting for all weekend school volunteers will be held on Saturday at 11 AM.', audience: 'Members only', date: '2024-05-18' },
];

export const MOCK_DONATIONS: Donation[] = [
    { id: 'don-1', mosqueId: 'mosque-1', amount: 100, donorName: 'Anonymous', purpose: 'General Fund', date: '2024-05-21' },
    { id: 'don-2', mosqueId: 'mosque-1', amount: 250, donorName: 'John Doe', purpose: 'Iftar Program', date: '2024-05-20' },
];

export const MOCK_EVENTS: CommunityEvent[] = [
    { id: 'evt-1', mosqueId: 'mosque-1', title: 'Friday Night Halaqa', date: '2024-05-24', type: 'Event' },
    { id: 'evt-2', mosqueId: 'mosque-1', title: 'Iftari Slot - May 25', date: '2024-05-25', type: 'Iftari Slot', capacity: 50, booked: 25 },
    { id: 'evt-3', mosqueId: 'mosque-1', title: 'Youth Group Meeting', date: '2024-06-01', type: 'Event' },
    { id: 'evt-4', mosqueId: 'mosque-1', title: 'Sisters\' Potluck', date: '2024-06-08', type: 'Event' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log-1', mosqueId: 'mosque-1', user: 'admin@masjid.com', action: 'Added Member', details: 'Added new member: Fatima Ali', date: '2024-05-19' },
    { id: 'log-2', mosqueId: 'mosque-1', user: 'admin@masjid.com', action: 'Updated Timings', details: 'Adjusted Asr prayer time', date: '2024-05-21' },
];