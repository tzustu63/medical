#!/bin/bash
# ===========================================
# 醫事人力媒合平台 - 部署腳本
# 用於 Amazon Lightsail 部署
# ===========================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查必要工具
check_requirements() {
    log_info "檢查必要工具..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安裝"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        log_error "Git 未安裝"
        exit 1
    fi

    log_info "所有必要工具已安裝"
}

# 拉取最新程式碼
pull_latest() {
    log_info "拉取最新程式碼..."
    git fetch origin
    git pull origin main
}

# 檢查環境變數
check_env() {
    log_info "檢查環境變數..."
    
    if [ ! -f .env ]; then
        log_error ".env 檔案不存在"
        log_info "請複製 env.example 為 .env 並設定環境變數"
        exit 1
    fi

    # 檢查必要的環境變數
    source .env
    
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD 未設定"
        exit 1
    fi

    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET 未設定"
        exit 1
    fi

    log_info "環境變數檢查通過"
}

# 建置映像
build_images() {
    log_info "建置 Docker 映像..."
    docker compose -f docker-compose.prod.yml build --no-cache
}

# 停止舊容器
stop_containers() {
    log_info "停止舊容器..."
    docker compose -f docker-compose.prod.yml down || true
}

# 啟動新容器
start_containers() {
    log_info "啟動新容器..."
    docker compose -f docker-compose.prod.yml up -d
}

# 清理舊映像
cleanup() {
    log_info "清理舊映像..."
    docker image prune -f
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 等待服務啟動
    sleep 30
    
    # 檢查 API
    if curl -sf http://localhost/api/v1/system/health > /dev/null; then
        log_info "API 健康檢查通過"
    else
        log_warn "API 健康檢查失敗，請檢查日誌"
    fi
    
    # 檢查前端
    if curl -sf http://localhost/health > /dev/null; then
        log_info "前端健康檢查通過"
    else
        log_warn "前端健康檢查失敗，請檢查日誌"
    fi
}

# 顯示狀態
show_status() {
    log_info "容器狀態："
    docker compose -f docker-compose.prod.yml ps
}

# 顯示日誌
show_logs() {
    log_info "最近日誌："
    docker compose -f docker-compose.prod.yml logs --tail=50
}

# 主函數
main() {
    log_info "開始部署醫事人力媒合平台..."
    
    check_requirements
    
    # 如果在專案目錄執行
    if [ ! -f docker-compose.prod.yml ]; then
        log_error "請在專案根目錄執行此腳本"
        exit 1
    fi
    
    pull_latest
    check_env
    stop_containers
    build_images
    start_containers
    cleanup
    health_check
    show_status
    
    log_info "部署完成！"
    log_info "網站網址：http://$(hostname -I | awk '{print $1}')"
}

# 處理命令列參數
case "${1:-deploy}" in
    deploy)
        main
        ;;
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        stop_containers
        start_containers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    build)
        build_images
        ;;
    *)
        echo "用法: $0 {deploy|start|stop|restart|status|logs|health|build}"
        exit 1
        ;;
esac

