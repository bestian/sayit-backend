const fs = require('fs');
const path = require('path');

// 讀取 JSON 文件
const jsonPath = path.join(__dirname, '..', 'data', 'speech_index.json');
const sqlPath = path.join(__dirname, '..', 'sql', 'fill-speech_index.sql');

console.log('讀取 JSON 文件:', jsonPath);

// 讀取 JSON 數據
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 生成 SQL 語句
let sqlStatements = [];
sqlStatements.push('-- 自動生成的 SQL 插入語句');
sqlStatements.push('-- 來源: data/speech_index.json');
sqlStatements.push('-- 生成時間: ' + new Date().toISOString());
sqlStatements.push('');
sqlStatements.push('-- 使用 INSERT OR IGNORE 避免插入重複的 filename（需要 UNIQUE 約束）');
sqlStatements.push('');

// 為每個 filename 生成 INSERT 語句
jsonData.forEach((filename) => {
  // 轉義單引號（SQL 字符串中的單引號需要轉義為兩個單引號）
  const escapedFilename = filename.replace(/'/g, "''");

  // 使用 INSERT OR IGNORE 來避免插入重複的 filename
  sqlStatements.push(
    `INSERT OR IGNORE INTO speech_index (filename) VALUES ('${escapedFilename}');`
  );
});

sqlStatements.push('');

// 寫入 SQL 文件
const sqlContent = sqlStatements.join('\n');
fs.writeFileSync(sqlPath, sqlContent, 'utf8');

console.log(`成功生成 SQL 文件: ${sqlPath}`);
console.log(`共處理 ${jsonData.length} 筆資料`);

