
import { Mosque, Member, PrayerTime, Announcement, Donation, CommunityEvent, AuditLog, User } from './types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@masjid.com',
  avatar: 'https://i.pravatar.cc/150?u=admin'
};


export const MOCK_MOSQUES: Mosque[] = [
    {
        id: 'mosque-1',
        name: 'Grand Central Mosque',
        address: '123 Faith St, Metropolis, USA',
        logoUrl: 'https://e7.pngegg.com/pngimages/724/24/png-clipart-al-masjid-an-nabawi-green-dome-mosque-islamic-green-and-brown-mosque-cdr-building-thumbnail.png',
    },
    {
        id: 'mosque-2',
        name: 'Community Peace Center',
        address: '456 Unity Ave, Gotham City, USA',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6fB6h42n5_soi-Csr-ftU02s69N7wBq-gUA&s',
    },
     {
        id: 'mosque-3',
        name: 'Al-Noor Islamic Center',
        address: '789 Wisdom Rd, Star City, USA',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7f7_EzF-i9j-a1k-b-n-g-q-g-g-q-g-g-q-g&s',
    }
];


export const MOCK_MEMBERS: Member[] = [
  { id: 'm1', mosqueId: 'mosque-1', name: 'Imam Ahmed', role: 'Imam', photo: `https://i.pravatar.cc/150?u=imam1`, contact: 'ahmed@email.com', background: 'Lead Imam with 10 years experience.' },
  { id: 'm2', mosqueId: 'mosque-1', name: 'Bilal Khan', role: 'Muazzin', photo: `https://i.pravatar.cc/150?u=muazzin1`, contact: 'bilal@email.com', background: 'Expert in Adhan recitation.' },
  { id: 'm3', mosqueId: 'mosque-1', name: 'Fatima Ali', role: 'Committee', photo: `https://i.pravatar.cc/150?u=committee1`, contact: 'fatima@email.com', background: 'Community outreach coordinator.' },
  { id: 'm4', mosqueId: 'mosque-1', name: 'Omar Sharif', role: 'Volunteer', photo: `https://i.pravatar.cc/150?u=volunteer1`, contact: 'omar@email.com', background: 'Weekend event support.' },
  { id: 'm5', mosqueId: 'mosque-2', name: 'Imam Yusuf', role: 'Imam', photo: `https://i.pravatar.cc/150?u=imam2`, contact: 'yusuf@email.com', background: 'Youth program specialist.' },
  { id: 'm6', mosqueId: 'mosque-2', name: 'Aisha Begum', role: 'Committee', photo: `https://i.pravatar.cc/150?u=committee2`, contact: 'aisha@email.com', background: 'Treasurer.' },
];

export const MOCK_PRAYER_TIMES: PrayerTime[] = [
  { name: 'Fajr', time: '05:30 AM' },
  { name: 'Dhuhr', time: '01:15 PM' },
  { name: 'Asr', time: '04:45 PM' },
  { name: 'Maghrib', time: '07:00 PM' },
  { name: 'Isha', time: '08:30 PM' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', mosqueId: 'mosque-1', title: 'Community Iftar this Friday', body: 'Join us for a community iftar this Friday after Maghrib prayer. All are welcome!', audience: 'All', date: '2024-07-20' },
  { id: 'a2', mosqueId: 'mosque-1', title: 'Committee Meeting', body: 'Monthly committee meeting will be held on Sunday at 2 PM in the main hall.', audience: 'Members only', date: '2024-07-18' },
  { id: 'a3', mosqueId: 'mosque-2', title: 'Youth Soccer Tournament', body: 'Sign up for the youth soccer tournament. Ages 12-18.', audience: 'All', date: '2024-07-19' },
];

export const MOCK_DONATIONS: Donation[] = [
    { id: 'd1', mosqueId: 'mosque-1', amount: 100, donorName: 'John Doe', purpose: 'General Fund', date: '2024-07-21' },
    { id: 'd2', mosqueId: 'mosque-1', amount: 50, donorName: 'Jane Smith', purpose: 'Iftar Program', date: '2024-07-20' },
    { id: 'd3', mosqueId: 'mosque-2', amount: 200, donorName: 'Anonymous', purpose: 'Expansion Project', date: '2024-07-19' },
];

export const MOCK_EVENTS: CommunityEvent[] = [
  { id: 'e1', mosqueId: 'mosque-1', title: 'Friday Sermon: Importance of Charity', date: '2024-07-26', type: 'Event' },
  { id: 'e2', mosqueId: 'mosque-1', title: 'Ramadan Iftari - Day 15', date: '2025-03-15', type: 'Iftari Slot', capacity: 100, booked: 65 },
  { id: 'e3', mosqueId: 'mosque-2', title: 'Interfaith Dialogue', date: '2024-08-01', type: 'Event' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'al1', mosqueId: 'mosque-1', user: 'Admin User', action: 'Member Added', date: '2024-07-21 10:00 AM', details: 'Added Omar Sharif as a Volunteer.' },
    { id: 'al2', mosqueId: 'mosque-1', user: 'Admin User', action: 'Announcement Created', date: '2024-07-20 03:15 PM', details: 'Created announcement: "Community Iftar this Friday".' },
    { id: 'al3', mosqueId: 'mosque-2', user: 'Admin User', action: 'Prayer Time Updated', date: '2024-07-19 09:00 AM', details: 'Updated Asr time to 05:00 PM.' },
];
