# 🏥 全國偏鄉醫事人力需求平台

連接偏鄉醫療機構與醫事專業人員的媒合平台。

## 專案結構

```
醫事人力媒合平台/
├── backend/          # NestJS 後端
│   ├── src/
│   │   ├── modules/  # 功能模組
│   │   │   ├── auth/         # 認證模組
│   │   │   ├── users/        # 使用者模組
│   │   │   ├── professionals/# 醫事人員模組
│   │   │   ├── hospitals/    # 醫院模組
│   │   │   ├── jobs/         # 職缺模組
│   │   │   ├── applications/ # 申請模組
│   │   │   └── system/       # 系統參數模組
│   │   └── common/   # 共用元件
│   └── sql/          # 資料庫初始化 SQL
├── mobile/           # React Native 前端
│   └── src/
│       ├── screens/      # 畫面元件
│       ├── navigation/   # 導航設定
│       ├── store/        # Redux 狀態管理
│       ├── services/     # API 服務
│       ├── theme/        # 主題設定
│       └── types/        # TypeScript 型別
└── md/               # 設計文檔
```

## 技術棧

### 後端
- **框架**: NestJS + TypeScript
- **資料庫**: PostgreSQL 14
- **快取**: Redis 7
- **認證**: JWT + bcrypt
- **ORM**: TypeORM
- **API 文檔**: Swagger/OpenAPI

### 前端
- **框架**: React Native + Expo
- **狀態管理**: Redux Toolkit
- **UI 元件**: React Native Paper
- **導航**: React Navigation
- **表單驗證**: React Hook Form + Yup

## 快速開始

### 前置需求
- Node.js >= 18
- Docker & Docker Compose
- npm 或 yarn

### 1. 啟動資料庫服務

```bash
docker-compose up -d
```

這會啟動：
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 3000)

### 2. 安裝依賴

```bash
# 安裝所有依賴
npm run install:all
```

### 3. 設定環境變數

```bash
# 後端
cp backend/.env.example backend/.env
# 修改 .env 中的設定
```

### 4. 啟動後端

```bash
npm run start:backend
```

後端服務會在 http://localhost:3000 啟動
Swagger API 文檔: http://localhost:3000/api

### 5. 啟動前端

```bash
npm run start:mobile
```

## API 端點

### 認證
- `POST /auth/register` - 註冊
- `POST /auth/login` - 登入
- `POST /auth/refresh` - 刷新 Token
- `POST /auth/logout` - 登出

### 職缺
- `GET /jobs` - 搜尋職缺
- `POST /jobs` - 建立職缺（醫院管理員）
- `GET /jobs/:id` - 取得職缺詳情
- `PUT /jobs/:id` - 更新職缺
- `POST /jobs/:id/close` - 關閉職缺

### 申請
- `POST /applications` - 提交申請
- `GET /applications` - 取得申請列表
- `POST /applications/:id/review` - 審核申請

### 醫事人員
- `GET /professionals/profile` - 取得個人檔案
- `PUT /professionals/profile` - 更新個人檔案
- `PUT /professionals/availability` - 設定可支援時段

### 系統
- `GET /system/regions` - 取得地區列表
- `GET /system/specialties` - 取得專科列表
- `GET /system/hospitals` - 取得醫院列表

## 使用者類型

1. **醫事人員** (`healthcare_professional`)
   - 醫師、護理師、藥師、醫檢師等
   - 可搜尋職缺、提交申請

2. **醫院管理員** (`hospital_admin`)
   - 醫療機構代表
   - 可發布職缺、審核申請

3. **系統管理員** (`system_admin`)
   - 平台管理者
   - 可管理系統設定

## 開發指令

```bash
# 後端開發模式
cd backend && npm run start:dev

# 前端開發模式
cd mobile && npm start

# 資料庫初始化
npm run db:init
```

## 授權

MIT License

