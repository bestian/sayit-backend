DROP TABLE IF EXISTS speech_index;

CREATE TABLE IF NOT EXISTS speech_index (
    id INTEGER PRIMARY KEY NOT NULL,
    filename TEXT NOT NULL,
    speakers TEXT
);
