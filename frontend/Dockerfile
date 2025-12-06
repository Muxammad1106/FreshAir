# Frontend Dockerfile - Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./
COPY yarn.lock* ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps || yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для build (ARG передаются как переменные окружения)
ARG REACT_APP_HOST_API=https://api.airly.life
ENV REACT_APP_HOST_API=$REACT_APP_HOST_API

# Собираем приложение
RUN npm run build || yarn build

# Production stage - Nginx
FROM nginx:alpine

# Копируем собранное приложение из builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

