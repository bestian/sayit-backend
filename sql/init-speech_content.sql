DROP TABLE IF EXISTS speech_content;

CREATE TABLE IF NOT EXISTS speech_content (
    filename TEXT NOT NULL,
    section_id INTEGER PRIMARY KEY NOT NULL,
	previous_section_id INTEGER,
	next_section_id INTEGER,
    section_speaker TEXT,
    section_content TEXT
);
