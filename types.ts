export type UserWithoutPassword = Omit<User, 'password_hash'>;

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    password_hash: string;
    mosque_id?: string;
}

export type MemberRole = 'Imam' | 'Muazzin' | 'Committee' | 'Volunteer';
export type MemberEducation = 'Mufti' | 'Hafiz' | 'Talimuddin' | 'None';

export interface Member {
  id: string;
  mosqueId: string;
  name: string;
  role: MemberRole;
  photo: string;
  contact: string;
  background: string;
  education?: MemberEducation;
}

export interface PrayerTime {
  id: string; // Added for DataTable
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

export interface MosqueSummary {
  nextPrayer: { name: string; time: string; id: string } | null; // Added id here too
  memberCount: number;
  upcomingEventCount: number;
}