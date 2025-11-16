-- Create user_preferences table for storing user settings like dashboard layouts
CREATE TABLE user_preferences (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    preference_type TEXT NOT NULL CHECK (preference_type IN ('dashboard_layout', 'theme', 'notifications', 'display')),
    preference_data TEXT NOT NULL, -- JSON data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, preference_type)
);