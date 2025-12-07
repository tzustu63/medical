# 部署指南 - Amazon Lightsail

本文件說明如何將醫事人力媒合平台部署到 Amazon Lightsail。

## 📊 端口分配（避免衝突）

| 服務 | 端口 | 說明 |
|------|------|------|
| 前端 | **3003** | React Native Web |
| API | **5004** | NestJS 後端 |
| PostgreSQL | **5435** | 資料庫 |
| Redis | **6381** | 快取 |

## 📋 目錄

1. [前置需求](#前置需求)
2. [建立 Lightsail 實例](#建立-lightsail-實例)
3. [設定 GitHub Repository](#設定-github-repository)
4. [部署到 Lightsail](#部署到-lightsail)
5. [設定 CI/CD 自動部署](#設定-cicd-自動部署)
6. [SSL 憑證設定](#ssl-憑證設定)
7. [維運指令](#維運指令)

---

## 前置需求

- GitHub 帳號
- AWS 帳號
- 域名 (選用，用於 SSL)

---

## 建立 Lightsail 實例

### 步驟 1: 登入 AWS Lightsail

1. 前往 [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. 點擊 "Create instance"

### 步驟 2: 選擇配置

| 設定項目 | 建議值 |
|---------|-------|
| 區域 | Asia Pacific (Tokyo) ap-northeast-1 |
| 平台 | Linux/Unix |
| 映像 | Ubuntu 22.04 LTS |
| 規格 | $10/月 (2 GB RAM, 1 vCPU) 或以上 |

> 💡 建議至少選擇 2GB RAM 的方案以確保 Docker 容器順暢運行

### 步驟 3: 設定 SSH 金鑰

1. 下載或建立 SSH 金鑰對
2. 保存私鑰 (稍後用於 GitHub Actions)

### 步驟 4: 建立實例

1. 設定實例名稱 (例如: `medical-platform`)
2. 點擊 "Create instance"
3. 等待實例啟動

### 步驟 5: 設定靜態 IP

1. 在 Networking 標籤中建立靜態 IP
2. 附加到實例

### 步驟 6: 設定防火牆

在 Networking 標籤中添加以下規則：

| 協定 | 連接埠 | 說明 |
|-----|-------|------|
| TCP | 22 | SSH |
| TCP | 80 | HTTP |
| TCP | 443 | HTTPS |

---

## 設定 GitHub Repository

### 步驟 1: 建立 Repository

```bash
# 在專案目錄中初始化 Git
cd /path/to/medical-platform
git init
git add .
git commit -m "Initial commit"

# 連結到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/medical-platform.git
git branch -M main
git push -u origin main
```

### 步驟 2: 設定 Secrets

在 GitHub Repository 的 Settings > Secrets and variables > Actions 中添加：

| Secret 名稱 | 說明 |
|------------|------|
| `LIGHTSAIL_HOST` | Lightsail 實例的靜態 IP |
| `LIGHTSAIL_USER` | SSH 用戶名 (通常是 `ubuntu`) |
| `LIGHTSAIL_SSH_KEY` | SSH 私鑰內容 |

---

## 部署到 Lightsail

### 方法 1: 使用初始設定腳本 (建議首次部署使用)

1. SSH 連線到 Lightsail 實例：

```bash
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP
```

2. 下載並執行初始設定腳本：

```bash
# 下載設定腳本
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/medical-platform/main/scripts/lightsail-setup.sh -o setup.sh

# 執行設定腳本
chmod +x setup.sh
./setup.sh
```

3. 腳本會自動：
   - 安裝 Docker 和 Docker Compose
   - 設定防火牆
   - Clone 專案
   - 建立環境變數檔案
   - 設定開機自動啟動

4. 登出並重新登入（套用 Docker 群組權限）：

```bash
exit
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP
```

5. 部署應用程式：

```bash
cd /opt/medical-platform
./scripts/deploy.sh deploy
```

### 方法 2: 手動部署

```bash
# 1. SSH 連線
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP

# 2. 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. 登出再登入
exit
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP

# 4. Clone 專案
sudo mkdir -p /opt/medical-platform
sudo chown $USER:$USER /opt/medical-platform
cd /opt/medical-platform
git clone https://github.com/YOUR_USERNAME/medical-platform.git .

# 5. 設定環境變數
cp env.example .env
nano .env  # 編輯環境變數

# 6. 部署
docker compose -f docker-compose.prod.yml up -d
```

---

## 設定 CI/CD 自動部署

設定完成後，每次推送到 `main` 分支會自動觸發部署。

### 手動觸發部署

1. 前往 GitHub Repository 的 Actions 標籤
2. 選擇 "Deploy to Lightsail" workflow
3. 點擊 "Run workflow"
4. 選擇環境並執行

---

## SSL 憑證設定

### 使用 Let's Encrypt

1. SSH 連線到伺服器

2. 安裝 Certbot：

```bash
sudo apt install certbot -y
```

3. 暫停 web 容器：

```bash
docker compose -f docker-compose.prod.yml stop web
```

4. 取得憑證：

```bash
sudo certbot certonly --standalone -d your-domain.com
```

5. 複製憑證：

```bash
sudo mkdir -p /opt/medical-platform/nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/medical-platform/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/medical-platform/nginx/ssl/
sudo chown -R $USER:$USER /opt/medical-platform/nginx/ssl
```

6. 啟用 SSL 設定：

編輯 `nginx/nginx.prod.conf`，取消註解 SSL 相關設定。

7. 重新啟動：

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 自動更新憑證

```bash
# 添加 cron job
(crontab -l ; echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/medical-platform/docker-compose.prod.yml restart web") | crontab -
```

---

## 維運指令

### 常用指令

```bash
cd /opt/medical-platform

# 查看狀態
./scripts/deploy.sh status

# 查看日誌
./scripts/deploy.sh logs

# 重新部署
./scripts/deploy.sh deploy

# 重啟服務
./scripts/deploy.sh restart

# 停止服務
./scripts/deploy.sh stop

# 健康檢查
./scripts/deploy.sh health
```

### Docker 指令

```bash
# 查看容器狀態
docker compose -f docker-compose.prod.yml ps

# 查看特定服務日誌
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# 進入容器
docker compose -f docker-compose.prod.yml exec api sh
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d medical_platform

# 重建特定服務
docker compose -f docker-compose.prod.yml build api --no-cache
docker compose -f docker-compose.prod.yml up -d api
```

### 資料庫備份

```bash
# 備份
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres medical_platform > backup_$(date +%Y%m%d).sql

# 還原
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres medical_platform
```

---

## 故障排除

### 容器無法啟動

```bash
# 查看詳細日誌
docker compose -f docker-compose.prod.yml logs --tail=100

# 檢查資源使用
docker stats
free -m
df -h
```

### API 無法連線

```bash
# 檢查 API 容器
docker compose -f docker-compose.prod.yml exec api wget -qO- http://localhost:3000/api/v1/system/health

# 檢查資料庫連線
docker compose -f docker-compose.prod.yml exec api nc -zv postgres 5432
```

### 前端無法載入

```bash
# 檢查 nginx 配置
docker compose -f docker-compose.prod.yml exec web nginx -t

# 檢查靜態檔案
docker compose -f docker-compose.prod.yml exec web ls -la /usr/share/nginx/html
```

---

## 聯絡資訊

如有問題，請建立 GitHub Issue 或聯絡開發團隊。

