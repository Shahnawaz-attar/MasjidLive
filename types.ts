export type UserWithoutPassword = Omit<User, 'password_hash'>;

export type UserRole = 'Admin' | 'Imam' | 'Muazzin';

export interface User {
    id: string;
    name: string;
    email?: string;
    username: string;
    avatar?: string;
    password_hash: string;
    role?: UserRole; // Optional for backward compatibility with existing users
    mosque_id?: string;
    address?: string;
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
  userId?: string; // Link to User table - if set, this member is a system user and cannot be edited
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
  description?: string;
  startDate: string;
  endDate: string; // Now required (removed optional ?)
  date: string; // Keep for backward compatibility
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
    // Optional detailed fields
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    capacity?: number;
    imamName?: string;
    imamPhone?: string;
    facilities?: string;
    established?: string;
}

// User Preferences type for storing dashboard layouts and other user settings
export interface UserPreference {
    id: string;
    user_id: string;
    preference_type: 'dashboard_layout' | 'theme' | 'notifications' | 'display';
    preference_data: any; // JSON data storing the preference
    created_at: string;
    updated_at: string;
}

export interface DashboardLayout {
    layouts: { [key: string]: Layout[] };
}

// Layout type for react-grid-layout
export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
}

export interface MosqueSummary {
  nextPrayer: { name: string; time: string; id: string } | null; // Added id here too
  memberCount: number;
  upcomingEventCount: number;
}