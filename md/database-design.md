# 全國偏鄉醫事人力需求平台 - 資料庫設計文檔

## 1. 資料庫架構概覽

### 1.1 資料庫選擇
- **主資料庫**: PostgreSQL 14+
- **字元編碼**: UTF-8
- **時區設定**: Asia/Taipei (UTC+8)

### 1.2 命名規範
- 表格名稱：小寫複數，使用底線分隔 (例：`job_postings`)
- 欄位名稱：小寫，使用底線分隔 (例：`created_at`)
- 主鍵：統一使用 `id` (UUID類型)
- 外鍵：`{關聯表}_id` (例：`user_id`)
- 時間戳記：`created_at`, `updated_at`, `deleted_at`

## 2. 核心資料表

### 2.1 用戶表 (users)

用於儲存所有系統用戶的基本資訊。

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('healthcare_professional', 'hospital_admin', 'system_admin')),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_type ON users(user_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- 註解
COMMENT ON TABLE users IS '系統用戶表';
COMMENT ON COLUMN users.user_type IS '用戶類型: healthcare_professional(醫事人員), hospital_admin(醫院管理員), system_admin(系統管理員)';
COMMENT ON COLUMN users.is_verified IS '郵箱是否已驗證';
COMMENT ON COLUMN users.is_active IS '帳號是否啟用';
```

### 2.2 醫事人員檔案表 (professional_profiles)

儲存醫事人員的專業資訊。

```sql
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    professional_type VARCHAR(50) NOT NULL CHECK (professional_type IN (
        'doctor', 'nurse', 'registered_nurse', 'pharmacist', 
        'pharmacy_technician', 'medical_technologist', 'medical_laboratory_technician'
    )),
    license_number VARCHAR(100) NOT NULL,
    specialties JSONB DEFAULT '[]',
    years_of_experience INTEGER,
    current_hospital VARCHAR(255),
    available_for_support BOOLEAN DEFAULT TRUE,
    available_regions JSONB DEFAULT '[]',
    available_days JSONB DEFAULT '[]',
    bio TEXT,
    profile_completion_rate INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_applications INTEGER DEFAULT 0,
    total_completed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_professional_user_id ON professional_profiles(user_id);
CREATE INDEX idx_professional_type ON professional_profiles(professional_type);
CREATE INDEX idx_professional_available ON professional_profiles(available_for_support) WHERE available_for_support = TRUE;
CREATE INDEX idx_professional_regions ON professional_profiles USING GIN(available_regions);
CREATE INDEX idx_professional_specialties ON professional_profiles USING GIN(specialties);

-- 註解
COMMENT ON TABLE professional_profiles IS '醫事人員專業檔案表';
COMMENT ON COLUMN professional_profiles.professional_type IS '職業類別: doctor(醫師), nurse(護理師), registered_nurse(護士), pharmacist(藥師), pharmacy_technician(藥劑生), medical_technologist(醫檢師), medical_laboratory_technician(醫檢生)';
COMMENT ON COLUMN professional_profiles.specialties IS 'JSON陣列，儲存專科列表 例：["內科", "家醫科"]';
COMMENT ON COLUMN professional_profiles.available_regions IS 'JSON陣列，儲存可支援地區 例：["屏東縣", "台東縣"]';
COMMENT ON COLUMN professional_profiles.available_days IS 'JSON陣列，儲存可支援星期 例：["monday", "friday"]';
```

### 2.3 醫院表 (hospitals)

儲存醫療機構資訊。

```sql
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    county VARCHAR(50) NOT NULL,
    township VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    hospital_type VARCHAR(50) CHECK (hospital_type IN (
        'medical_center', 'regional_hospital', 'district_hospital', 'clinic'
    )),
    contact_email VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_hospitals_code ON hospitals(hospital_code);
CREATE INDEX idx_hospitals_location ON hospitals(county, township);
CREATE INDEX idx_hospitals_name ON hospitals(name);
CREATE INDEX idx_hospitals_type ON hospitals(hospital_type);

-- 全文搜索索引
CREATE INDEX idx_hospitals_name_trgm ON hospitals USING gin(name gin_trgm_ops);

-- 註解
COMMENT ON TABLE hospitals IS '醫療機構表';
COMMENT ON COLUMN hospitals.hospital_type IS '醫院層級: medical_center(醫學中心), regional_hospital(區域醫院), district_hospital(地區醫院), clinic(診所)';
```

### 2.4 醫院管理員表 (hospital_admins)

關聯醫院與管理員。

```sql
CREATE TABLE hospital_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hospital_id)
);

-- 索引
CREATE INDEX idx_hospital_admins_user ON hospital_admins(user_id);
CREATE INDEX idx_hospital_admins_hospital ON hospital_admins(hospital_id);

COMMENT ON TABLE hospital_admins IS '醫院管理員關聯表';
COMMENT ON COLUMN hospital_admins.is_primary IS '是否為主要管理員';
```

### 2.5 職缺表 (job_postings)

儲存所有職缺資訊。

```sql
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    
    -- 基本資訊
    county VARCHAR(50) NOT NULL,
    township VARCHAR(50) NOT NULL,
    professional_type VARCHAR(50) NOT NULL,
    specialty VARCHAR(100),
    number_of_positions INTEGER NOT NULL DEFAULT 1 CHECK (number_of_positions > 0),
    
    -- 職缺類型與服務
    job_type VARCHAR(20) DEFAULT 'support' CHECK (job_type IN ('support', 'permanent')),
    service_type VARCHAR(50) CHECK (service_type IN ('outpatient', 'inpatient', 'emergency', 'other')),
    service_days JSONB DEFAULT '[]',
    
    -- 服務期間
    service_start_date DATE NOT NULL,
    service_end_date DATE NOT NULL,
    
    -- 公費與福利
    is_public_funded BOOLEAN DEFAULT FALSE,
    meal_provided BOOLEAN DEFAULT FALSE,
    accommodation_provided BOOLEAN DEFAULT FALSE,
    transportation_provided BOOLEAN DEFAULT FALSE,
    
    -- 薪資
    salary_amount DECIMAL(10, 2),
    salary_currency VARCHAR(10) DEFAULT 'TWD',
    salary_unit VARCHAR(20) CHECK (salary_unit IN ('hourly', 'daily', 'monthly')),
    
    -- 聯絡資訊
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- 其他
    remarks TEXT,
    requirements TEXT,
    
    -- 狀態管理
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled', 'cancelled')),
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- 約束條件
    CHECK (service_end_date >= service_start_date)
);

-- 索引
CREATE INDEX idx_jobs_hospital ON job_postings(hospital_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_status ON job_postings(status) WHERE deleted_at IS NULL AND status = 'open';
CREATE INDEX idx_jobs_location ON job_postings(county, township) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_professional_type ON job_postings(professional_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_dates ON job_postings(service_start_date, service_end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_specialty ON job_postings(specialty) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_public_funded ON job_postings(is_public_funded) WHERE is_public_funded = TRUE;
CREATE INDEX idx_jobs_service_days ON job_postings USING GIN(service_days);
CREATE INDEX idx_jobs_created_at ON job_postings(created_at DESC);

-- 全文搜索
CREATE INDEX idx_jobs_remarks_trgm ON job_postings USING gin(remarks gin_trgm_ops);

-- 註解
COMMENT ON TABLE job_postings IS '職缺發布表';
COMMENT ON COLUMN job_postings.status IS '職缺狀態: draft(草稿), open(開放中), closed(已關閉), filled(已填滿), cancelled(已取消)';
COMMENT ON COLUMN job_postings.service_days IS 'JSON陣列，儲存服務星期 例：["monday", "friday"]';
COMMENT ON COLUMN job_postings.views_count IS '瀏覽次數';
COMMENT ON COLUMN job_postings.applications_count IS '申請人數';
```

### 2.6 申請表 (applications)

儲存醫事人員對職缺的申請記錄。

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 申請內容
    cover_letter TEXT,
    available_start_date DATE,
    
    -- 狀態管理
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'cancelled', 'withdrawn')),
    review_note TEXT,
    reviewed_by_user_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- 時間戳記
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 唯一約束：一個人對同一職缺只能申請一次
    UNIQUE(job_id, professional_id)
);

-- 索引
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_professional ON applications(professional_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- 註解
COMMENT ON TABLE applications IS '職缺申請表';
COMMENT ON COLUMN applications.status IS '申請狀態: pending(待審核), reviewing(審核中), approved(已核准), rejected(已拒絕), cancelled(已取消), withdrawn(已撤回)';
```

### 2.7 通知表 (notifications)

儲存系統通知記錄。

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 通知內容
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- 關聯資源
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- 通知狀態
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- 通知渠道
    sent_via_push BOOLEAN DEFAULT FALSE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id);

-- 註解
COMMENT ON TABLE notifications IS '系統通知表';
COMMENT ON COLUMN notifications.type IS '通知類型: application_status, new_job_match, system_announcement等';
COMMENT ON COLUMN notifications.resource_type IS '關聯資源類型: job, application, user等';
```

### 2.8 系統參數表 (system_parameters)

儲存系統配置和選項列表。

```sql
CREATE TABLE system_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    label VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(category, key)
);

-- 索引
CREATE INDEX idx_system_params_category ON system_parameters(category, is_active, sort_order);

-- 註解
COMMENT ON TABLE system_parameters IS '系統參數與選項列表表';
COMMENT ON COLUMN system_parameters.category IS '參數分類: counties(縣市), townships(鄉鎮), specialties(專科), etc';

-- 初始資料：縣市
INSERT INTO system_parameters (category, key, value, label, sort_order) VALUES
('county', 'pingtung', '屏東縣', '屏東縣', 1),
('county', 'taitung', '台東縣', '台東縣', 2),
('county', 'hualien', '花蓮縣', '花蓮縣', 3),
('county', 'penghu', '澎湖縣', '澎湖縣', 4);

-- 初始資料：專科
INSERT INTO system_parameters (category, key, value, label, sort_order) VALUES
('specialty', 'internal_medicine', '內科', '內科', 1),
('specialty', 'surgery', '外科', '外科', 2),
('specialty', 'pediatrics', '小兒科', '小兒科', 3),
('specialty', 'obstetrics_gynecology', '婦產科', '婦產科', 4),
('specialty', 'family_medicine', '家醫科', '家醫科', 5),
('specialty', 'emergency', '急診醫學科', '急診醫學科', 6);
```

## 3. ER 圖

```
┌─────────────┐         ┌──────────────────┐         ┌────────────┐
│   users     │◄────────│ hospital_admins  │────────►│ hospitals  │
└──────┬──────┘         └──────────────────┘         └─────┬──────┘
       │                                                     │
       │  1                                              1   │
       │                                                     │
       │  *                                              *   │
       │                                                     │
┌──────▼──────────────┐                         ┌───────────▼────────┐
│ professional_       │                         │   job_postings     │
│ profiles            │                         └───────────┬────────┘
└──────┬──────────────┘                                     │
       │                                                    │
       │  1                                             *   │
       │                                                    │
       │  *                                             1   │
       │                ┌───────────────┐                  │
       └───────────────►│ applications  │◄─────────────────┘
                        └───────────────┘
```

## 4. 初始化腳本

完整的初始化SQL腳本已包含在上述表格定義中。建議使用資料庫遷移工具（如Flyway或Liquibase）來管理資料庫版本。
