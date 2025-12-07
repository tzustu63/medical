FROM node:18-alpine AS builder

WORKDIR /app

# 安裝依賴
COPY package.json ./
RUN npm install

# 複製程式碼
COPY . .

# 建置
RUN npm run build

# 生產映像
FROM node:18-alpine AS production

WORKDIR /app

# 只複製生產所需的檔案
COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 啟動
CMD ["node", "dist/main.js"]

