#!/bin/bash
set -e

# Создаем settings_prod.py из example если его нет
if [ ! -f /app/config/settings_prod.py ]; then
    echo "Creating settings_prod.py from settings_prod.py.example..."
    cp /app/config/settings_prod.py.example /app/config/settings_prod.py
    echo "settings_prod.py created successfully!"
fi

# Функция для проверки доступности базы данных
wait_for_db() {
    echo "Waiting for database connection..."
    MAX_RETRIES=60
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        # Используем прямой psycopg2 вместо Django для более быстрой проверки
        if python -c "
import os
import sys
try:
    import psycopg2
    db_host = os.environ.get('POSTGRES_HOST', 'localhost')
    db_port = int(os.environ.get('POSTGRES_PORT', 5432))
    db_name = 'fresh2'
    db_user = 'suv'
    db_pass = 'suv'
    
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_pass,
        host=db_host,
        port=db_port,
        connect_timeout=3
    )
    conn.close()
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; then
            echo "Database is available!"
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Database is unavailable (attempt $RETRY_COUNT/$MAX_RETRIES) - sleeping..."
            sleep 2
        fi
    done
    
    echo "ERROR: Could not connect to database after $MAX_RETRIES attempts"
    echo "Please check:"
    echo "  - PostgreSQL is running: sudo systemctl status postgresql"
    echo "  - POSTGRES_HOST is correct (current: ${POSTGRES_HOST:-localhost})"
    echo "  - Database 'fresh2' exists and user 'suv' has access"
    echo "  - pg_hba.conf allows connections from Docker network"
    exit 1
}

# Ждем доступности базы данных
wait_for_db

# Выполняем миграции
echo "Running migrations..."
python manage.py migrate --noinput

# Собираем статические файлы
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Warning: collectstatic failed, continuing..."

# Загружаем фикстуры (опционально, раскомментируйте если нужно)
# echo "Loading fixtures..."
# python manage.py loaddata company || true
# python manage.py loaddata users_and_tokens || true
# python manage.py loaddata apps/core/fixtures/freshair_data.yaml || true
# python manage.py loaddata apps/users/fixtures/freshair_users.yaml || true

# Запускаем команду, переданную как аргумент
exec "$@"

