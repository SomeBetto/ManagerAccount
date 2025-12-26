CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    pin VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    level INTEGER,
    class_name VARCHAR(100),
    char_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS level_entries (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE UNIQUE,
    priority INTEGER DEFAULT 0,
    note VARCHAR(500)
);
