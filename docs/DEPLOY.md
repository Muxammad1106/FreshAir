# 🚀 Быстрый деплой FreshAir на сервер

## Предварительные требования

1. **Docker и Docker Compose** установлены
2. **PostgreSQL** установлен и запущен на хосте
3. **Git** для клонирования репозитория

## Быстрый старт

### 1. Клонирование и переход в проект

```bash
cd ~
git clone <your-repo-url> FreshAir
cd FreshAir
```

### 2. Настройка PostgreSQL

Запустите скрипт для автоматической настройки:

```bash
./setup-postgres.sh
```

Этот скрипт:
- Настроит `postgresql.conf` для приема подключений
- Обновит `pg_hba.conf` для доступа от Docker сети
- Создаст базу данных `fresh2` и пользователя `suv`

**Или настройте вручную:**

```bash
# 1. Настройте postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
# Установите: listen_addresses = '*'

# 2. Настройте pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Добавьте:
# host    fresh2    suv    172.17.0.0/16    md5

# 3. Создайте БД и пользователя
sudo -u postgres psql
CREATE DATABASE fresh2;
CREATE USER suv WITH PASSWORD 'suv';
GRANT ALL PRIVILEGES ON DATABASE fresh2 TO suv;
\q

# 4. Перезапустите PostgreSQL
sudo systemctl restart postgresql
```

### 3. Настройка переменных окружения

```bash
cp env.example .env
nano .env
```

Минимальные настройки:
```env
SECRET_KEY=your-very-strong-secret-key-minimum-50-characters
POSTGRES_HOST=host.docker.internal
POSTGRES_PORT=5432
```

### 4. Запуск проекта

**Вариант 1: Автоматический (рекомендуется)**

```bash
./start.sh
```

**Вариант 2: Ручной**

```bash
# Сборка и запуск
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Логи
docker-compose logs -f
```

## Проверка работы

```bash
# Backend API
curl http://localhost:8001/api/v1/toolkit/

# Frontend
curl http://localhost:8080

# Статус контейнеров
docker-compose ps
```

## Управление

```bash
# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Выполнение команд в контейнере
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Обновление

```bash
cd ~/FreshAir

# Получить изменения
git pull

# Пересобрать и перезапустить
docker-compose up -d --build

# Применить миграции
docker-compose exec backend python manage.py migrate
```

## Troubleshooting

### Проблема: Не могу подключиться к PostgreSQL

**Решение:**
1. Проверьте что PostgreSQL запущен: `sudo systemctl status postgresql`
2. Проверьте `listen_addresses` в `postgresql.conf`
3. Проверьте правила в `pg_hba.conf`
4. Убедитесь что база `fresh2` и пользователь `suv` существуют

### Проблема: Порт занят

**Решение:**
Измените порты в `.env`:
```env
BACKEND_PORT=8001
FRONTEND_PORT=8080
```

### Проблема: Контейнер постоянно перезапускается

**Решение:**
Проверьте логи:
```bash
docker-compose logs backend
docker-compose logs celery-beat
```

## Структура портов

- **Backend API**: 8001
- **Frontend**: 8080
- **Redis**: 6379

## Production настройки

Для production:
1. Настройте SSL через Nginx reverse proxy
2. Используйте сильный `SECRET_KEY`
3. Настройте бэкапы базы данных
4. Настройте мониторинг
5. Используйте `.env` файл с секретными данными (не коммитьте в git!)

