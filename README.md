# Sayit Backend

Sayit 演講記錄網站複刻的後端服務，基於 Cloudflare Workers 構建。

## 專案簡介

本專案是 Sayit 演講記錄網站的後端服務，提供演講內容的儲存與查詢功能。使用 Cloudflare Workers 作為運行環境，搭配 D1 資料庫儲存演講索引與講者資訊，並使用 R2 物件儲存服務儲存演講的 `.an` 檔案。

## fork指南

目前database_id是固定值，如果要fork，需修改wrangler.jsonc的設定。

## 技術棧

- **運行環境**: Cloudflare Workers
- **資料庫**: Cloudflare D1 (SQLite)
- **物件儲存**: Cloudflare R2
- **語言**: TypeScript
- **測試框架**: Vitest

## 本地開發

### 前置需求

- Node.js (建議 v20 或以上)
- npm 或 yarn
- Cloudflare 帳號（用於部署）

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

開發伺服器會在 `http://localhost:8787` 啟動。

### 其他指令

- `npm run deploy` - 部署到 Cloudflare Workers
- `npm run test` - 執行測試
- `npm run cf-typegen` - 重新生成 Cloudflare Workers 類型定義

## 資料庫與儲存

### D1 資料庫

D1 資料庫用於儲存演講的索引資訊與講者資料，包含以下資料表：

#### `speech_index`
儲存演講檔案的基本索引資訊。

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INTEGER | 主鍵 |
| filename | TEXT | 檔案名稱 |
| speakers | TEXT | 講者資訊 |

#### `speakers`
儲存講者的詳細資訊。

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INTEGER | 主鍵 |
| name | TEXT | 講者名稱 |
| photoURL | TEXT | 講者照片 URL |
| speeches | INTEGER | 演講數量（預設 0） |
| longest_speech | INTEGER | 最長演講時長（預設 0） |

#### `speech_content`
儲存演講內容的分段資料。

| 欄位 | 類型 | 說明 |
|------|------|------|
| filename | TEXT | 檔案名稱 |
| section_id | INTEGER | 段落 ID（主鍵） |
| section_speaker | TEXT | 段落講者 |
| section_content | TEXT | 段落內容 |

初始化 SQL 檔案位於 `sql/` 目錄下：
- `sql/init-speech_index.sql`
- `sql/init-speakers.sql`
- `sql/init-speech_content.sql`

### R2 物件儲存

R2 用於儲存演講的原始 `.an` 檔案。這些檔案可以透過 API 路由直接存取。

**R2 Bucket 設定**：
- 綁定名稱: `SPEECH_AN`
- 生產環境: `sayit-speech-an`
- 預覽環境: `sayit-speech-an-preview`

## API 路由

### 根路由

```
GET /
```

返回 "Hello World!" 訊息。

### 演講檔案路由

```
GET /api/an/{speech_name}.an
HEAD /api/an/{speech_name}.an
```

從 R2 儲存桶取得指定的 `.an` 檔案。

**參數**：
- `speech_name`: 演講檔案名稱（不含 `.an` 副檔名）

**回應**：
- `200 OK`: 成功返回檔案內容
- `404 Not Found`: 檔案不存在

**範例**：
```
GET /api/an/2025-11-10-柏林自由會議ai-的角色.an
```

## 路由測試

### 測試拿單筆演講的所有內容

```bash
curl http://localhost:8787/api/speech/2025-11-10-柏林自由會議ai-的角色
```

### 測試單段落內容取得

```bash
curl http://localhost:8787/api/section/628198
```


### 測試根路由

```bash
curl http://localhost:8787/
```

預期回應：`Hello World!`

### 測試演講檔案路由

```bash
curl http://localhost:8787/api/an/2025-11-10-%E6%9F%8F%E6%9E%97%E8%87%AA%E7%94%B1%E6%9C%83%E8%AD%B0ai-%E7%9A%84%E8%A7%92%E8%89%B2.an
```

或使用瀏覽器直接訪問：
```
http://localhost:8787/api/an/2025-11-10-柏林自由會議ai-的角色.an
```

預期回應：返回對應的 `.an` 檔案內容。

### 測試 HEAD 請求

```bash
curl -I http://localhost:8787/api/an/2025-11-10-%E6%9F%8F%E6%9E%97%E8%87%AA%E7%94%B1%E6%9C%83%E8%AD%B0ai-%E7%9A%84%E8%A7%92%E8%89%B2.an
```

預期回應：返回檔案的 HTTP headers（不包含檔案內容）。

## CORS 設定

後端支援 CORS，允許以下來源：

- `http://localhost:5173` (本地開發環境)
- `https://sayit-f5d.pages.dev/`
- `https://sayit.archive.tw/`

## GitHub Actions 整合

後端支援透過 GitHub Actions 進行自動化操作。需要以下認證：

- `Authorization: Bearer {token}` header
- `X-GitHub-Repository: {repo}` header

允許的儲存庫：
- `audreyt/transcript`
- `bestian/transcript`

