DROP TABLE IF EXISTS speech_index;

CREATE TABLE IF NOT EXISTS speech_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE
    -- speakers TEXT
);

insert into speech_index (filename) values ('2025-11-10-柏林自由會議：AI 的角色');
insert into speech_index (filename) values ('2025-11-10-Berlin Freedom Conference: The Role of AI');
insert into speech_index (filename) values ('2025-11-08-解學習：監管');
insert into speech_index (filename) values ('2025-11-08-Unlearning Regulation');
insert into speech_index (filename) values ('2025-11-06-開放 AI 安全，巨頭迎來轉折點');

