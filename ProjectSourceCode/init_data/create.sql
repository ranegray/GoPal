DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  birthday DATE,
  country VARCHAR(255),
  phone VARCHAR(255),
  display_name VARCHAR(255),
  fitness_level VARCHAR(255),
  visibility VARCHAR(255) DEFAULT 'anyone'
);