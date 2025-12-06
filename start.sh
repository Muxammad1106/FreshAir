#!/bin/bash

# Скрипт для быстрого запуска проекта FreshAir на сервере

set -e

echo "🚀 Starting FreshAir deployment..."

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your settings!"
    echo "   Especially: SECRET_KEY, POSTGRES_HOST, POSTGRES_PASSWORD"
    read -p "Press Enter after editing .env file..."
fi

# Проверка PostgreSQL
echo "🔍 Checking PostgreSQL connection..."
POSTGRES_HOST=$(grep POSTGRES_HOST .env | cut -d '=' -f2 | tr -d ' ')
POSTGRES_PORT=$(grep POSTGRES_PORT .env | cut -d '=' -f2 | tr -d ' ')

if [ -z "$POSTGRES_HOST" ]; then
    POSTGRES_HOST="host.docker.internal"
fi

if [ -z "$POSTGRES_PORT" ]; then
    POSTGRES_PORT="5432"
fi

echo "   Host: $POSTGRES_HOST"
echo "   Port: $POSTGRES_PORT"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    exit 1
fi

# Остановка существующих контейнеров
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Сборка образов
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Запуск контейнеров
echo "▶️  Starting containers..."
docker-compose up -d

# Ждем запуска
echo "⏳ Waiting for services to start..."
sleep 5

# Проверка статуса
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Services:"
echo "   - Backend API: http://localhost:8001"
echo "   - Frontend: http://localhost:8080"
echo "   - Django Admin: http://localhost:8001/admin"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""

