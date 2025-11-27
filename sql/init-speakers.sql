DROP TABLE IF EXISTS speakers;

CREATE TABLE IF NOT EXISTS speakers (
	id INTEGER UNIQUE AUTOINCREMENT,
    route_pathname TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    photoURL TEXT
);


insert into speakers (route_pathname, name, photoURL) -- 目前是第一筆填充資料，只是確立格式，未來需要修改為完整
	values (
		'%E5%94%90%E9%B3%B3-3',
		'唐鳳',
	    'https://sayit.archive.tw/media/speakers/default/pic_AudreyTang-small.jpg.96x96_q85_crop-smart_face_upscale.jpg',
	);
