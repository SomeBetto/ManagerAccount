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

CREATE TABLE IF NOT EXISTS daily_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE
);

CREATE TABLE IF NOT EXISTS daily_event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES daily_events(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    UNIQUE(event_id, character_id)
);

CREATE TABLE IF NOT EXISTS daily_event_progress (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES daily_event_participants(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(participant_id, event_date)
);
