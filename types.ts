
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type MemberRole = 'Imam' | 'Muazzin' | 'Committee' | 'Volunteer';

export interface Member {
  id: string;
  mosqueId: string;
  name: string;
  role: MemberRole;
  photo: string;
  contact: string;
  background: string;
}

export interface PrayerTime {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
}

export interface Announcement {
  id: string;
  mosqueId: string;
  title: string;
  body: string;
  audience: 'All' | 'Members only';
  date: string;
}

export interface Donation {
    id: string;
    mosqueId: string;
    amount: number;
    donorName: string;
    purpose: string;
    date: string;
}

export interface CommunityEvent {
  id: string;
  mosqueId: string;
  title: string;
  date: string; // Should be in a format that can be parsed by a calendar
  type: 'Event' | 'Iftari Slot';
  capacity?: number;
  booked?: number;
}


export interface AuditLog {
    id: string;
    mosqueId: string;
    user: string;
    action: string;
    date: string;
    details: string;
}

export interface Mosque {
    id: string;
    name: string;
    address: string;
    logoUrl: string;
}
