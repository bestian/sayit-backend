DROP TABLE IF EXISTS speakers;

CREATE TABLE IF NOT EXISTS speakers (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    photoURL TEXT,
    speeches INTEGER DEFAULT 0,
    longest_speech INTEGER DEFAULT 0
);
