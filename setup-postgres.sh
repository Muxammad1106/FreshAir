#!/bin/bash

# Скрипт для настройки PostgreSQL для работы с Docker

set -e

echo "🔧 Setting up PostgreSQL for FreshAir..."

# Определяем версию PostgreSQL
PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version;" | grep -oE '[0-9]+' | head -1)

if [ -z "$PG_VERSION" ]; then
    echo "❌ PostgreSQL is not running or not installed!"
    echo "   Install with: sudo apt install -y postgresql"
    exit 1
fi

echo "📌 PostgreSQL version: $PG_VERSION"

# Настройка postgresql.conf
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
echo "📝 Updating $PG_CONF..."

# Проверяем listen_addresses
if grep -q "^listen_addresses" "$PG_CONF"; then
    sudo sed -i "s/^listen_addresses.*/listen_addresses = '*'/" "$PG_CONF"
else
    echo "listen_addresses = '*'" | sudo tee -a "$PG_CONF"
fi

# Настройка pg_hba.conf
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
echo "📝 Updating $PG_HBA..."

# Добавляем правила для Docker сети, если их нет
if ! grep -q "172.17.0.0/16" "$PG_HBA"; then
    echo "" | sudo tee -a "$PG_HBA"
    echo "# Docker network access" | sudo tee -a "$PG_HBA"
    echo "host    fresh2    suv    172.17.0.0/16    md5" | sudo tee -a "$PG_HBA"
    echo "host    all       all    172.17.0.0/16    md5" | sudo tee -a "$PG_HBA"
    echo "✅ Added Docker network rules to pg_hba.conf"
fi

# Создание базы данных и пользователя
echo "📦 Creating database and user..."

sudo -u postgres psql <<EOF
-- Создание пользователя (если не существует)
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'suv') THEN
      CREATE USER suv WITH PASSWORD 'suv';
   END IF;
END
\$\$;

-- Создание базы данных (если не существует)
SELECT 'CREATE DATABASE fresh2 OWNER suv'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fresh2')\gexec

-- Выдача прав
GRANT ALL PRIVILEGES ON DATABASE fresh2 TO suv;
\c fresh2
GRANT ALL ON SCHEMA public TO suv;
EOF

# Перезапуск PostgreSQL
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Проверка
echo "✅ PostgreSQL configured!"
echo ""
echo "📋 Database info:"
echo "   Database: fresh2"
echo "   User: suv"
echo "   Password: suv"
echo ""
echo "🧪 Testing connection..."
sudo -u postgres psql -c "\l" | grep fresh2 && echo "✅ Database exists!" || echo "❌ Database not found!"
sudo -u postgres psql -c "\du" | grep suv && echo "✅ User exists!" || echo "❌ User not found!"

echo ""
echo "✅ Setup complete! You can now run ./start.sh"


