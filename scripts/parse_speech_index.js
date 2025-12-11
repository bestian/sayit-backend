const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 輸入和輸出路徑
const inputHtmlPath = path.join(__dirname, '..', 'raw_sample_data', 'speeches.html');
const outputJsonPath = path.join(__dirname, '..', 'data', 'speech_index.json');
const outputSqlPath = path.join(__dirname, '..', 'sql', 'fill-speech_index.sql');

console.log('讀取 HTML 文件:', inputHtmlPath);

// 讀取 HTML 文件
const htmlContent = fs.readFileSync(inputHtmlPath, 'utf8');
const $ = cheerio.load(htmlContent);

// 找到 <ul class="unstyled"> 元素
const $unstyledList = $('ul.unstyled');
if ($unstyledList.length === 0) {
  console.error('錯誤: 找不到 <ul class="unstyled"> 元素');
  process.exit(1);
}

// 提取所有 <li> 元素
const $listItems = $unstyledList.find('> li');
console.log(`找到 ${$listItems.length} 個 <li> 元素`);

// 解析每個 <li> 元素
const speechIndexData = [];

$listItems.each((index, liElement) => {
  const $li = $(liElement);

  // 找到 <a> 標籤
  const $link = $li.find('a');
  if ($link.length === 0) {
    console.warn(`警告: <li> 元素 #${index} 沒有找到 <a> 標籤`);
    return;
  }

  // 提取 filename: 從 <a> 的 href 屬性去掉開頭的 '/'
  let href = $link.attr('href') || '';
  const filename = href.startsWith('/') ? href.substring(1) : href;

  // 提取 display_name: <a></a> 標籤包住的文字內容
  const displayName = $link.text().trim();

  if (!filename || !displayName) {
    console.warn(`警告: <li> 元素 #${index} 的 filename 或 display_name 為空`);
    return;
  }

  // 建立物件
  const speechItem = {
    filename: decodeURIComponent(filename),
    display_name: displayName
  };

  speechIndexData.push(speechItem);
});

console.log(`成功解析 ${speechIndexData.length} 筆資料`);

// 確保輸出目錄存在
const jsonDir = path.dirname(outputJsonPath);
const sqlDir = path.dirname(outputSqlPath);
if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir, { recursive: true });
}
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

// 生成 JSON 文件
const jsonContent = JSON.stringify(speechIndexData, null, 2);
fs.writeFileSync(outputJsonPath, jsonContent, 'utf8');
console.log(`成功生成 JSON 文件: ${outputJsonPath}`);

// 生成 SQL 文件
let sqlStatements = [];
sqlStatements.push('-- 自動生成的 SQL 插入語句');
sqlStatements.push('-- 來源: raw_sample_data/speeches.html');
sqlStatements.push('-- 生成時間: ' + new Date().toISOString());
sqlStatements.push('');
sqlStatements.push('-- 使用 INSERT OR IGNORE 避免插入重複的 filename（需要 UNIQUE 約束）');
sqlStatements.push('');

// 為每筆資料生成 INSERT 語句
speechIndexData.forEach((item) => {
  // 轉義單引號（SQL 字符串中的單引號需要轉義為兩個單引號）
  const escapedFilename = (item.filename || '').replace(/'/g, "''");
  const escapedDisplayName = (item.display_name || '').replace(/'/g, "''");

  // 使用 INSERT OR IGNORE 來避免插入重複的 filename
  sqlStatements.push(
    `INSERT OR IGNORE INTO speech_index (filename, display_name) VALUES ('${escapedFilename}', '${escapedDisplayName}');`
  );
});

sqlStatements.push('');

// 寫入 SQL 文件
const sqlContent = sqlStatements.join('\n');
fs.writeFileSync(outputSqlPath, sqlContent, 'utf8');
console.log(`成功生成 SQL 文件: ${outputSqlPath}`);
console.log(`共處理 ${speechIndexData.length} 筆資料`);

