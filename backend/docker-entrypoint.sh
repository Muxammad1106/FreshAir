#!/bin/bash
set -e

# Функция для проверки доступности базы данных
wait_for_db() {
    echo "Waiting for database..."
    until python -c "import psycopg2; psycopg2.connect(dbname='${POSTGRES_DB}', user='${POSTGRES_USER}', password='${POSTGRES_PASSWORD}', host='${POSTGRES_HOST}', port='${POSTGRES_PORT:-5432}')" 2>/dev/null; do
        echo "Database is unavailable - sleeping"
        sleep 1
    done
    echo "Database is available!"
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

