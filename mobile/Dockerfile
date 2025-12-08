FROM node:18-alpine AS builder

WORKDIR /app

# 安裝依賴
COPY package.json ./
RUN npm install

# 複製程式碼
COPY . .

# 建置 Web 版本
RUN npx expo export --platform web

# 生產映像 - 使用 nginx 提供靜態檔案
FROM nginx:alpine AS production

# 複製建置結果
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


