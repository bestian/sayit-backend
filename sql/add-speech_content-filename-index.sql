-- 為 speech_content 表的 filename 欄位建立索引
-- 此索引可優化 /api/speech/{filename} 路由的查詢效能
-- 當資料量較大時，建議執行此 SQL 來建立索引

CREATE INDEX IF NOT EXISTS idx_speech_content_filename ON speech_content(filename);

