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
    echo "Waiting for database..."
    # Получаем параметры БД из Django settings
    until python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${DJANGO_SETTINGS_MODULE:-config.settings}')
import django
django.setup()
from django.conf import settings
import psycopg2
psycopg2.connect(
    dbname=settings.DATABASES['default']['NAME'],
    user=settings.DATABASES['default']['USER'],
    password=settings.DATABASES['default']['PASSWORD'],
    host=settings.DATABASES['default']['HOST'],
    port=settings.DATABASES['default']['PORT']
)
" 2>/dev/null; do
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

