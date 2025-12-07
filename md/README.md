# 全國偏鄉醫事人力需求平台 - 技術文件

## 📋 專案概述

這是一個跨平台（iOS & Android）的醫事人力媒合系統，旨在連接偏鄉醫療機構與願意支援的醫事人員，落實健康平等，促進醫療資源分配。

### 主要功能

- **醫事人員端**
  - 註冊與個人檔案管理
  - 設定支援地區與時段意願
  - 搜尋與申請職缺
  - 查看申請狀態

- **醫療機構端**
  - 機構註冊與資料管理
  - 發布與管理職缺
  - 查看與審核申請
  - 媒合管理

- **系統特色**
  - 跨平台支援（iOS & Android）
  - 智能職缺搜尋與推薦
  - 即時通知系統
  - 完整的申請審核流程

---

## 📚 文件結構

本專案包含以下技術文件：

### 1. [OpenAPI 規格文件](./medical-staff-platform-openapi.yaml)
**檔案**: `medical-staff-platform-openapi.yaml`

完整的 REST API 規格文件，符合 OpenAPI 3.0 標準。

**包含內容**:
- 🔐 認證 API（註冊、登入、Token 管理）
- 👨‍⚕️ 醫事人員 API（個人檔案、支援意願）
- 🏥 醫療機構 API（機構資料管理）
- 💼 職缺 API（CRUD、搜尋、篩選）
- 📝 申請 API（申請、審核、媒合）
- 🛠️ 系統參數 API（縣市、鄉鎮、專科）

**使用方式**:
```bash
# 使用 Swagger Editor 查看
https://editor.swagger.io

# 或使用 Swagger UI
npx swagger-ui-watcher medical-staff-platform-openapi.yaml
```

---

### 2. [資料庫設計文件](./database-design.md)
**檔案**: `database-design.md`

完整的 PostgreSQL 資料庫設計，包含 15+ 資料表。

**包含內容**:
- 📊 完整的資料表結構（使用者、職缺、申請等）
- 🔗 關聯設計與索引策略
- ⚡ 觸發器與函數（自動更新、計數等）
- 👁️ 實用視圖（完整職缺資訊、申請資訊）
- 🔒 權限設計與安全策略
- 📈 效能優化建議
- 💾 備份與還原策略

**資料表列表**:
- users（使用者主表）
- medical_staff（醫事人員）
- medical_staff_availability（支援意願）
- hospitals（醫療機構）
- job_postings（職缺）
- job_posting_days（服務時段）
- job_posting_service_types（服務項目）
- applications（申請）
- application_available_dates（可支援日期）
- refresh_tokens（刷新令牌）
- counties, townships, specialties（系統參數）
- notifications（通知）
- audit_logs（審計日誌）

---

### 3. [系統架構設計文件](./system-architecture.md)
**檔案**: `system-architecture.md`

完整的系統架構設計與技術選型指南。

**包含內容**:
- 🏗️ 整體架構圖（前端、後端、資料庫）
- 🔧 微服務架構設計
- 💻 技術堆疊推薦
  - 前端: React Native
  - 後端: NestJS / FastAPI
  - 資料庫: PostgreSQL + Redis
  - 部署: AWS / Docker / Kubernetes
- ☁️ 雲端部署方案（AWS 詳細架構）
- 🔐 安全架構（認證、授權、加密）
- ⚡ 效能優化策略（快取、資料庫優化）
- 📊 監控與維運
- 🔄 災難復原計劃
- 📏 可擴展性設計

**技術選型建議**:
- 小型團隊 (1-3人): Expo + Firebase + Supabase
- 中型團隊 (4-10人): React Native + NestJS + PostgreSQL
- 大型團隊 (10+人): 微服務架構 + Kubernetes

---

### 4. [API 使用範例文件](./api-examples.md)
**檔案**: `api-examples.md`

詳細的 API 使用範例與整合指南。

**包含內容**:
- 📖 所有 API 端點的請求/回應範例
- 🔐 認證流程完整範例
- 👨‍⚕️ 醫事人員功能範例
- 🏥 醫療機構功能範例
- 💼 職缺管理範例
- 📝 申請管理範例
- ❌ 完整的錯誤處理說明
- ⚛️ React Native 整合範例
  - API 客戶端設置
  - 攔截器配置
  - 服務層實作
  - Custom Hooks 範例

---

## 🚀 快速開始

### 環境需求

```
Node.js: 18+
PostgreSQL: 14+
Redis: 7+
React Native: 0.72+
```

### 開發環境設置

1. **Clone 專案**
```bash
git clone https://github.com/your-repo/medical-platform
cd medical-platform
```

2. **安裝依賴**

後端:
```bash
cd backend
npm install
```

前端:
```bash
cd mobile
npm install
```

3. **設置資料庫**
```bash
# 建立資料庫
createdb medical_platform_dev

# 執行遷移
npm run migration:run

# 初始化資料
npm run seed
```

4. **設置環境變數**

建立 `.env` 檔案:
```env
# 資料庫
DATABASE_URL=postgresql://user:password@localhost:5432/medical_platform_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=900

# API
PORT=3000
NODE_ENV=development
```

5. **啟動開發伺服器**

後端:
```bash
cd backend
npm run start:dev
```

前端:
```bash
cd mobile
npm start
```

---

## 🏗️ 專案結構

```
medical-platform/
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── auth/           # 認證模組
│   │   ├── users/          # 使用者模組
│   │   ├── jobs/           # 職缺模組
│   │   ├── applications/   # 申請模組
│   │   └── common/         # 共用模組
│   └── package.json
│
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── api/            # API 客戶端
│   │   ├── screens/        # 畫面
│   │   ├── components/     # 組件
│   │   └── hooks/          # Custom Hooks
│   └── package.json
│
├── docs/                    # 文件目錄
│   ├── medical-staff-platform-openapi.yaml
│   ├── database-design.md
│   ├── system-architecture.md
│   ├── api-examples.md
│   └── README.md
│
└── docker-compose.yml       # Docker 設定
```

---

## 📊 開發時程規劃

### Phase 1: MVP（3個月）
- **Week 1-2**: 環境設置、基礎架構
- **Week 3-6**: 認證系統、使用者管理
- **Week 7-10**: 職缺系統、搜尋功能
- **Week 11-12**: 申請系統、通知功能

### Phase 2: 功能完善（2個月）
- **Week 13-14**: 推薦演算法
- **Week 15-16**: 進階搜尋、篩選
- **Week 17-18**: 管理後台
- **Week 19-20**: 測試與優化

### Phase 3: 上線準備（1個月）
- **Week 21-22**: 安全性審查
- **Week 23**: 效能測試
- **Week 24**: Beta測試、正式上線

---

## 🔒 安全性

### 認證機制
- JWT Token（Access Token + Refresh Token）
- bcrypt 密碼雜湊（cost factor: 12）
- HTTPS/TLS 1.3 傳輸加密

### API 保護
- Rate Limiting（防止暴力攻擊）
- Input Validation（防止注入攻擊）
- CORS 設定

### 資料保護
- 敏感資料 AES-256 加密
- 資料庫 Row Level Security
- 定期備份與審計

---

## 📈 效能指標

### 目標
- API Response Time: P95 < 500ms
- 系統可用率: 99.9%
- 並發使用者: 10,000+
- 資料庫查詢: P95 < 100ms

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### Commit 規範
```
feat: 新功能
fix: 修復 Bug
docs: 文件更新
style: 格式調整
refactor: 重構
test: 測試相關
chore: 建置或輔助工具變動
```

---

## 📞 聯絡資訊

- **Email**: support@medical-platform.tw
- **問題回報**: GitHub Issues

---

## 📄 授權

本專案採用 MIT 授權條款。

---

**最後更新**: 2024-12-07  
**文件版本**: 1.0.0
