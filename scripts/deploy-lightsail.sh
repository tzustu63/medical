#!/bin/bash
# ===========================================
# 醫事人力媒合平台 - Lightsail 部署腳本
# 與現有服務隔離，使用獨立端口
# ===========================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 檢查端口是否被佔用
check_port() {
    if ss -tulpn | grep -q ":$1 "; then
        log_error "Port $1 已被佔用！"
        return 1
    fi
    log_info "Port $1 可用"
    return 0
}

# 檢查所有需要的端口
check_all_ports() {
    log_step "檢查端口可用性..."
    local all_clear=true
    
    for port in 3004 5005 5436 6382; do
        if ! check_port $port; then
            all_clear=false
        fi
    done
    
    if [ "$all_clear" = false ]; then
        log_error "部分端口已被佔用，請檢查"
        exit 1
    fi
    
    log_info "所有端口可用"
}

# 檢查環境變數
check_env() {
    log_step "檢查環境變數..."
    
    if [ ! -f .env ]; then
        if [ -f env.lightsail ]; then
            log_info "複製 env.lightsail 為 .env"
            cp env.lightsail .env
            
            # 自動產生 JWT_SECRET
            JWT_SECRET=$(openssl rand -hex 32)
            sed -i "s/請替換為64字元的隨機字串/$JWT_SECRET/" .env
            
            log_warn "已自動產生 JWT_SECRET，請檢查 .env 檔案"
        else
            log_error ".env 檔案不存在"
            exit 1
        fi
    fi
    
    source .env
    
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD 未設定"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "請替換為64字元的隨機字串" ]; then
        log_error "JWT_SECRET 未正確設定"
        exit 1
    fi
    
    log_info "環境變數檢查通過"
}

# 建置映像
build() {
    log_step "建置 Docker 映像..."
    docker compose -f docker-compose.lightsail.yml build --no-cache
}

# 停止服務
stop() {
    log_step "停止現有服務..."
    docker compose -f docker-compose.lightsail.yml down || true
}

# 啟動服務
start() {
    log_step "啟動服務..."
    docker compose -f docker-compose.lightsail.yml up -d
}

# 清理
cleanup() {
    log_step "清理舊映像..."
    docker image prune -f
}

# 健康檢查
health_check() {
    log_step "執行健康檢查..."
    
    sleep 30
    
    # 檢查 API
    if curl -sf http://localhost:5005/api/v1/system/health > /dev/null 2>&1; then
        log_info "✅ API 健康檢查通過 (Port 5005)"
    else
        log_warn "⚠️ API 健康檢查失敗"
    fi
    
    # 檢查前端
    if curl -sf http://localhost:3004 > /dev/null 2>&1; then
        log_info "✅ 前端健康檢查通過 (Port 3004)"
    else
        log_warn "⚠️ 前端健康檢查失敗"
    fi
}

# 顯示狀態
status() {
    log_step "服務狀態："
    docker compose -f docker-compose.lightsail.yml ps
    
    echo ""
    log_info "端口使用情況："
    echo "  - 前端: http://$(hostname -I | awk '{print $1}'):3004"
    echo "  - API:  http://$(hostname -I | awk '{print $1}'):5005"
    echo "  - PostgreSQL: localhost:5436"
    echo "  - Redis: localhost:6382"
}

# 顯示日誌
logs() {
    docker compose -f docker-compose.lightsail.yml logs --tail=100 -f
}

# 完整部署
deploy() {
    log_info "======================================"
    log_info "醫事人力媒合平台 - Lightsail 部署"
    log_info "======================================"
    
    if [ ! -f docker-compose.lightsail.yml ]; then
        log_error "請在專案根目錄執行此腳本"
        exit 1
    fi
    
    # 首次部署時檢查端口
    if ! docker compose -f docker-compose.lightsail.yml ps -q 2>/dev/null | grep -q .; then
        check_all_ports
    fi
    
    check_env
    stop
    build
    start
    cleanup
    health_check
    status
    
    log_info "======================================"
    log_info "✅ 部署完成！"
    log_info "======================================"
}

# 主程式
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    start)
        start
        status
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        status
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    health)
        health_check
        ;;
    build)
        build
        ;;
    check-ports)
        check_all_ports
        ;;
    *)
        echo "用法: $0 {deploy|start|stop|restart|status|logs|health|build|check-ports}"
        exit 1
        ;;
esac

