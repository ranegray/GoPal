DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  birthday DATE,
  country VARCHAR(60),
  phone VARCHAR(15),
  profile_photo_path VARCHAR(255),
  bio TEXT,
  display_name VARCHAR(15),
  fitness_level VARCHAR(20),
  visibility VARCHAR(10) DEFAULT 'anyone',
  activities_completed_count INTEGER DEFAULT 0
);

CREATE TABLE activity_types (
  activity_type_id SERIAL PRIMARY KEY,
  activity_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE activity_logs (
  activity_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  activity_type_id INTEGER REFERENCES activity_types(activity_type_id),
  activity_date DATE DEFAULT CURRENT_DATE,
  activity_time TIME DEFAULT CURRENT_TIME,
  duration_minutes INTEGER NOT NULL,
  distance_mi DECIMAL(6,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friends (
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

CREATE TABLE journal_logs (
  entry_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  entry_date DATE DEFAULT CURRENT_DATE,
  entry_time TIME DEFAULT CURRENT_TIME,
  journal_entry TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activity_types (activity_name) VALUES 
('Running'),
('Walking'),
('Hiking'),
('Swimming'),
('Cycling'),
('Skiing/Snowboarding');

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,          -- Unique ID for the achievement
    code VARCHAR(50) UNIQUE NOT NULL, -- Short unique code (e.g., 'COMPLETE_5_ACTIVITIES')
    name VARCHAR(100) NOT NULL,     -- User-friendly name (e.g., 'Activity Starter')
    description TEXT NOT NULL,      -- Description (e.g., 'Complete 5 activities')
    criteria_type VARCHAR(50) NOT NULL, -- Type of criteria (e.g., 'ACTIVITY_COUNT', 'LOGIN_STREAK')
    criteria_value INTEGER NOT NULL, -- Value needed to meet criteria (e.g., 5 for 5 activities)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Corrected reference
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, achievement_id) -- Ensure a user can't unlock the same achievement twice
);

INSERT INTO achievements (code, name, description, criteria_type, criteria_value) VALUES
('COMPLETE_1_ACTIVITY', 'First Step', 'Complete your first activity', 'ACTIVITY_COUNT', 1),
('COMPLETE_5_ACTIVITIES', 'Getting Started', 'Complete 5 activities', 'ACTIVITY_COUNT', 5),
('COMPLETE_10_ACTIVITIES', 'Activity Enthusiast', 'Complete 10 activities', 'ACTIVITY_COUNT', 10);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    reference_id INTEGER,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- CHARACTER WORK
CREATE TABLE IF NOT EXISTS character_customizations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  character_name VARCHAR(50) NOT NULL DEFAULT 'Unnamed Pal',
  hat_choice VARCHAR(20),
  color_choice VARCHAR(20) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);