-- PostgreSQL Schema for Masjid Manager
-- Run this script on your Neon PostgreSQL database

CREATE TABLE IF NOT EXISTS mosques (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    logo_url TEXT
);

CREATE TABLE IF NOT EXISTS "users" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('Admin', 'Imam', 'Muazzin')) DEFAULT 'Muazzin',
    mosque_id TEXT REFERENCES mosques(id),
    address TEXT
);

CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('Imam', 'Muazzin', 'Committee', 'Volunteer')),
    photo TEXT,
    contact TEXT,
    background TEXT,
    education TEXT CHECK(education IN ('Mufti', 'Hafiz', 'Talimuddin', 'None')),
    user_id TEXT REFERENCES "users"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prayer_times (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    name TEXT CHECK(name IN ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha')),
    time TEXT NOT NULL,
    UNIQUE(mosque_id, name)
);

CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT CHECK(audience IN ('All', 'Members only')),
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    amount DECIMAL(10,2) NOT NULL,
    donor_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_events (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT CHECK(type IN ('Event', 'Iftari Slot')),
    capacity INTEGER,
    booked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    mosque_id TEXT NOT NULL REFERENCES mosques(id),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_mosque_id ON members(mosque_id);
CREATE INDEX IF NOT EXISTS idx_prayer_times_mosque_id ON prayer_times(mosque_id);
CREATE INDEX IF NOT EXISTS idx_announcements_mosque_id ON announcements(mosque_id);
CREATE INDEX IF NOT EXISTS idx_donations_mosque_id ON donations(mosque_id);
CREATE INDEX IF NOT EXISTS idx_events_mosque_id ON community_events(mosque_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_mosque_id ON audit_logs(mosque_id);

