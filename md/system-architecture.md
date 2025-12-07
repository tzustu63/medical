# 醫事人力媒合平台 - 系統架構設計文件

## 1. 系統概述

### 1.1 系統目標
建立一個跨平台（iOS & Android）的醫事人力媒合系統，連接偏鄉醫療機構與願意支援的醫事人員。

### 1.2 核心功能
- 醫事人員註冊、管理個人檔案、設定支援意願
- 醫療機構註冊、發布職缺、管理申請
- 智能職缺搜尋與推薦
- 申請與媒合管理
- 即時通知系統

### 1.3 技術特性
- **跨平台**: 支援 iOS 和 Android
- **高可用性**: 99.9% 系統可用率
- **安全性**: 符合醫療資訊安全標準
- **可擴展性**: 支援未來功能擴充

---

## 2. 整體架構

### 2.1 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         使用者層                              │
├───────────────────┬─────────────────┬──────────────────────┤
│   iOS App         │   Android App   │   Web Dashboard      │
│   (React Native)  │  (React Native) │   (React)            │
└────────┬──────────┴────────┬────────┴──────────┬───────────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Kong/AWS)    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
    │  認證服務  │      │  業務服務   │     │  通知服務   │
    │  (Auth)   │      │  (Core)    │     │  (Notify)  │
    └────┬─────┘      └─────┬──────┘     └─────┬──────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
    │ PostgreSQL│      │   Redis    │     │    S3      │
    │  (主DB)   │      │  (快取)    │     │  (檔案)    │
    └──────────┘      └────────────┘     └────────────┘
```

### 2.2 微服務架構

#### 2.2.1 服務劃分

**1. 認證服務 (Authentication Service)**
- 使用者註冊與登入
- JWT Token 管理
- 密碼重設
- 第三方登入（Google, Apple）

**2. 使用者服務 (User Service)**
- 醫事人員個人檔案管理
- 醫療機構資料管理
- 支援意願設定

**3. 職缺服務 (Job Service)**
- 職缺CRUD操作
- 職缺搜尋與篩選
- 職缺推薦演算法

**4. 申請服務 (Application Service)**
- 申請提交與管理
- 申請審核流程
- 媒合記錄

**5. 通知服務 (Notification Service)**
- Push Notification
- Email 通知
- 站內訊息

**6. 檔案服務 (File Service)**
- 證照文件上傳
- 圖片處理
- 文件管理

---

## 3. 技術堆疊

### 3.1 前端技術

#### 移動端 (iOS & Android)
```
Framework: React Native 0.72+
State Management: Redux Toolkit / Zustand
UI Library: React Native Paper / NativeBase
Navigation: React Navigation v6
HTTP Client: Axios
Form Handling: React Hook Form
Validation: Yup / Zod
Push Notifications: React Native Firebase
Local Storage: AsyncStorage / MMKV
```

#### 管理後台 (Web)
```
Framework: React 18+ / Next.js 14+
State Management: Redux Toolkit / TanStack Query
UI Library: Material-UI / Ant Design
Charts: Recharts / Chart.js
Table: TanStack Table
Form: React Hook Form
```

### 3.2 後端技術

#### API Server
```
Language: Node.js (TypeScript) / Python (FastAPI)
Framework: NestJS / Express / FastAPI
ORM: Prisma / TypeORM / SQLAlchemy
Validation: class-validator / Pydantic
Authentication: JWT (jsonwebtoken / PyJWT)
API Documentation: Swagger/OpenAPI
```

**推薦架構: NestJS (TypeScript)**
```typescript
// 專案結構
src/
├── auth/                 # 認證模組
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── guards/
├── users/                # 使用者模組
│   ├── medical-staff/
│   └── hospitals/
├── jobs/                 # 職缺模組
│   ├── jobs.controller.ts
│   ├── jobs.service.ts
│   └── jobs.repository.ts
├── applications/         # 申請模組
├── notifications/        # 通知模組
├── common/              # 共用模組
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
├── config/              # 設定檔
└── database/            # 資料庫設定
```

### 3.3 資料庫與儲存

```
Primary Database: PostgreSQL 14+
Cache: Redis 7+
File Storage: AWS S3 / MinIO
Search Engine: Elasticsearch (可選)
```

### 3.4 DevOps 與部署

```
Container: Docker
Orchestration: Kubernetes / Docker Compose
CI/CD: GitHub Actions / GitLab CI
Monitoring: Prometheus + Grafana
Logging: ELK Stack / Loki
APM: New Relic / DataDog
```

---

## 4. 部署架構

### 4.1 雲端部署方案（AWS）

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│   S3 (Static)  │       │  Route 53 (DNS)│
│   React App    │       └───────┬────────┘
└────────────────┘               │
                         ┌───────▼────────┐
                         │  ALB (Load     │
                         │   Balancer)    │
                         └───────┬────────┘
                                 │
                    ┌────────────┼───────────┐
                    │                        │
            ┌───────▼────────┐      ┌───────▼────────┐
            │  ECS Fargate   │      │  ECS Fargate   │
            │  (API Servers) │      │  (API Servers) │
            └───────┬────────┘      └───────┬────────┘
                    │                        │
                    └────────────┬───────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
      ┌───────▼────────┐  ┌─────▼──────┐   ┌──────▼─────┐
      │  RDS (Primary) │  │ ElastiCache│   │     S3     │
      │  PostgreSQL    │  │   (Redis)  │   │  (Files)   │
      └────────────────┘  └────────────┘   └────────────┘
              │
      ┌───────▼────────┐
      │  RDS (Replica) │
      │   (Read Only)  │
      └────────────────┘
```

### 4.2 部署環境

#### Development (開發環境)
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev:dev@db:5432/medical_platform_dev
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: medical_platform_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### Staging (測試環境)
- 使用 Kubernetes 部署
- 自動化測試
- 效能測試

#### Production (生產環境)
- 高可用性配置
- 自動擴展
- 監控與告警

---

## 5. 安全架構

### 5.1 認證與授權

#### JWT Token 策略
```typescript
// Access Token: 15 分鐘有效期
{
  "userId": "uuid",
  "userType": "medical_staff" | "hospital",
  "exp": 1234567890
}

// Refresh Token: 7 天有效期
{
  "userId": "uuid",
  "tokenId": "uuid",
  "exp": 1234567890
}
```

#### RBAC 權限控制
```typescript
enum Role {
  MEDICAL_STAFF = 'medical_staff',
  HOSPITAL = 'hospital',
  ADMIN = 'admin'
}

enum Permission {
  // 職缺相關
  CREATE_JOB = 'job:create',
  UPDATE_JOB = 'job:update',
  DELETE_JOB = 'job:delete',
  VIEW_JOB = 'job:view',
  
  // 申請相關
  CREATE_APPLICATION = 'application:create',
  REVIEW_APPLICATION = 'application:review',
  VIEW_APPLICATION = 'application:view',
}

const rolePermissions = {
  [Role.MEDICAL_STAFF]: [
    Permission.VIEW_JOB,
    Permission.CREATE_APPLICATION,
    Permission.VIEW_APPLICATION
  ],
  [Role.HOSPITAL]: [
    Permission.CREATE_JOB,
    Permission.UPDATE_JOB,
    Permission.DELETE_JOB,
    Permission.VIEW_JOB,
    Permission.REVIEW_APPLICATION
  ]
};
```

### 5.2 資料安全

#### 加密策略
```
1. 傳輸層: HTTPS (TLS 1.3)
2. 密碼: bcrypt (cost factor: 12)
3. 敏感資料: AES-256 加密
4. API Key: 環境變數管理
```

### 5.3 API 安全

#### Rate Limiting
```typescript
// 使用 Redis 實現速率限制
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 次請求
  message: '請求過於頻繁，請稍後再試'
};

// 針對不同端點設置不同限制
const loginRateLimit = {
  windowMs: 15 * 60 * 1000,
  max: 5, // 登入最多 5 次
};
```

---

## 6. 效能優化

### 6.1 快取策略

#### Redis 快取層
```typescript
// 快取配置
const cacheConfig = {
  // 系統參數快取 (24 小時)
  systemParams: {
    ttl: 86400,
    keys: ['counties', 'townships', 'specialties']
  },
  
  // 職缺列表快取 (5 分鐘)
  jobList: {
    ttl: 300,
    invalidateOn: ['job:create', 'job:update', 'job:delete']
  },
  
  // 使用者資料快取 (15 分鐘)
  userProfile: {
    ttl: 900,
    invalidateOn: ['profile:update']
  }
};
```

### 6.2 資料庫優化

#### 連線池設定
```typescript
// PostgreSQL 連線池
const dbConfig = {
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大連線數
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

---

## 7. 監控與維運

### 7.1 監控指標

#### 應用層監控
```
- API Response Time (P50, P95, P99)
- Error Rate
- Request Rate (RPS)
- Active Users
- Database Query Time
```

#### 基礎設施監控
```
- CPU Usage
- Memory Usage
- Disk I/O
- Network Traffic
- Database Connections
```

---

## 8. 災難復原計劃

### 8.1 備份策略

```bash
# 每日全量備份
0 2 * * * pg_dump -U postgres medical_platform | gzip > /backup/full_$(date +\%Y\%m\%d).sql.gz

# 保留策略
- 每日備份保留 30 天
- 每週備份保留 12 週
- 每月備份保留 12 個月
```

### 8.2 復原程序

```
RTO (Recovery Time Objective): 4 小時
RPO (Recovery Point Objective): 1 小時

復原步驟:
1. 啟動備援資料庫
2. 還原最近的全量備份
3. 套用 WAL 日誌
4. 切換 DNS 到備援系統
5. 驗證系統功能
6. 通知使用者
```

---

## 9. 擴展性設計

### 9.1 水平擴展

```
- API Server: 無狀態設計，可任意擴展
- 資料庫: 讀寫分離，讀取副本可擴展
- Cache: Redis Cluster
- File Storage: 使用 S3 (無限擴展)
```

### 9.2 垂直擴展

```
- 資料庫: 增加 RAM、CPU
- API Server: 增加實例規格
- Cache: 增加 Redis 記憶體
```

---

## 10. 技術選型建議

### 10.1 推薦技術堆疊

**小型團隊 (1-3 人)**
```
前端: React Native + Expo
後端: Next.js API Routes / Firebase
資料庫: PostgreSQL (Supabase)
部署: Vercel + Railway
```

**中型團隊 (4-10 人)**
```
前端: React Native (bare workflow)
後端: NestJS
資料庫: PostgreSQL + Redis
部署: AWS ECS / DigitalOcean App Platform
```

**大型團隊 (10+ 人)**
```
前端: React Native + Micro-frontends
後端: NestJS + 微服務架構
資料庫: PostgreSQL + Redis + Elasticsearch
部署: Kubernetes on AWS/GCP
```

---

## 11. 開發時程估算

### Phase 1: MVP (最小可行產品) - 3 個月
- Week 1-2: 環境設置、基礎架構
- Week 3-6: 認證系統、使用者管理
- Week 7-10: 職缺系統、搜尋功能
- Week 11-12: 申請系統、通知功能

### Phase 2: 功能完善 - 2 個月
- Week 13-14: 推薦演算法
- Week 15-16: 進階搜尋、篩選
- Week 17-18: 管理後台
- Week 19-20: 測試與優化

### Phase 3: 上線準備 - 1 個月
- Week 21-22: 安全性審查
- Week 23: 效能測試
- Week 24: Beta 測試、正式上線

---

## 12. 總結

本架構設計提供：
- ✅ 跨平台支援 (iOS & Android)
- ✅ 高可用性與可擴展性
- ✅ 完善的安全機制
- ✅ 優化的效能表現
- ✅ 完整的監控與維運

建議根據團隊規模和時程選擇適合的技術堆疊，從 MVP 開始逐步迭代。
