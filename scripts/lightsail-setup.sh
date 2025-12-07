#!/bin/bash
# ===========================================
# Amazon Lightsail 初始設定腳本
# 在新的 Lightsail 實例上執行此腳本
# ===========================================

set -e

echo "======================================"
echo "Amazon Lightsail 初始設定"
echo "======================================"

# 更新系統
echo ">>> 更新系統套件..."
sudo apt-get update
sudo apt-get upgrade -y

# 安裝必要套件
echo ">>> 安裝必要套件..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    htop \
    vim

# 安裝 Docker
echo ">>> 安裝 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # 將當前用戶加入 docker 群組
    sudo usermod -aG docker $USER
fi

# 安裝 Docker Compose
echo ">>> 安裝 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 設定防火牆
echo ">>> 設定防火牆..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# 建立應用程式目錄
echo ">>> 建立應用程式目錄..."
sudo mkdir -p /opt/medical-platform
sudo chown $USER:$USER /opt/medical-platform

# 設定 Git
echo ">>> 設定 Git..."
read -p "請輸入 GitHub 帳號: " github_user
read -p "請輸入 GitHub Repository (格式: username/repo): " github_repo

cd /opt/medical-platform

# Clone 專案
if [ ! -d ".git" ]; then
    echo ">>> 複製專案..."
    git clone https://github.com/$github_repo .
fi

# 建立環境變數檔案
echo ">>> 建立環境變數檔案..."
if [ ! -f ".env" ]; then
    cp env.example .env
    
    # 產生隨機 JWT Secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/your_jwt_secret_key_here_change_in_production/$JWT_SECRET/" .env
    
    # 產生隨機資料庫密碼
    DB_PASSWORD=$(openssl rand -base64 24)
    sed -i "s/your_secure_password_here/$DB_PASSWORD/" .env
    
    echo ""
    echo "======================================"
    echo "環境變數已自動產生並儲存到 .env"
    echo "請檢查 .env 檔案並依需要調整"
    echo "======================================"
fi

# 設定 SSL (可選)
echo ""
read -p "是否要設定 SSL 憑證? (y/n): " setup_ssl
if [ "$setup_ssl" = "y" ]; then
    echo ">>> 安裝 Certbot..."
    sudo apt-get install -y certbot
    
    read -p "請輸入您的網域名稱: " domain_name
    
    echo ">>> 取得 SSL 憑證..."
    sudo certbot certonly --standalone -d $domain_name
    
    # 複製憑證
    sudo mkdir -p /opt/medical-platform/nginx/ssl
    sudo cp /etc/letsencrypt/live/$domain_name/fullchain.pem /opt/medical-platform/nginx/ssl/
    sudo cp /etc/letsencrypt/live/$domain_name/privkey.pem /opt/medical-platform/nginx/ssl/
    sudo chown -R $USER:$USER /opt/medical-platform/nginx/ssl
    
    echo "請手動啟用 nginx 配置中的 SSL 設定"
fi

# 設定自動更新 SSL 憑證
if [ "$setup_ssl" = "y" ]; then
    echo ">>> 設定自動更新 SSL 憑證..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f /opt/medical-platform/docker-compose.prod.yml restart web") | crontab -
fi

# 設定自動啟動
echo ">>> 設定開機自動啟動..."
cat << EOF | sudo tee /etc/systemd/system/medical-platform.service
[Unit]
Description=Medical Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/medical-platform
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable medical-platform

echo ""
echo "======================================"
echo "初始設定完成！"
echo "======================================"
echo ""
echo "下一步："
echo "1. 登出並重新登入以套用 Docker 群組權限"
echo "2. 編輯 .env 檔案設定環境變數"
echo "3. 執行 ./scripts/deploy.sh 部署應用程式"
echo ""
echo "常用指令："
echo "  ./scripts/deploy.sh deploy  - 部署應用程式"
echo "  ./scripts/deploy.sh status  - 查看狀態"
echo "  ./scripts/deploy.sh logs    - 查看日誌"
echo ""

