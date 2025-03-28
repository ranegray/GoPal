DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE activity_types (
  activity_type_id SERIAL PRIMARY KEY,
  activity_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE workout_logs (
  workout_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  activity_type_id INTEGER REFERENCES activity_types(activity_type_id),
  workout_date DATE DEFAULT CURRENT_DATE,
  workout_time TIME DEFAULT CURRENT_TIME,
  duration_minutes INTEGER NOT NULL,
  distance_mi DECIMAL(6,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activity_types (activity_name) VALUES 
('Running'),
('Walking'),
('Hiking'),
('Swimming'),
('Cycling'),
('Skiing/Snowboarding');
