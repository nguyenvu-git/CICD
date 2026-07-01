FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Nếu dùng Vite/React, chạy preview hoặc phục vụ bằng nginx:
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]