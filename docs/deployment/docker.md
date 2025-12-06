# Docker Deployment Guide

Полное руководство по развертыванию FreshAir с использованием Docker и Docker Compose.

## Содержание

- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [Сервисы](#сервисы)
- [Команды](#команды)
- [Troubleshooting](#troubleshooting)

## Требования

- **Docker** 20.10 или выше
- **Docker Compose** 2.0 или выше
- **Git** (для клонирования репозитория)
- **Минимум 2GB RAM** для локальной разработки
- **Минимум 4GB RAM** для production

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd FreshAir
```

### 2. Настройка переменных окружения

```bash
cp env.example .env
```

Отредактируйте `.env` файл:

```env
# Для production обязательно измените!
SECRET_KEY=your-strong-secret-key-minimum-50-characters
DEBUG=False
ALLOWED_HOSTS=api.airly.life,localhost,127.0.0.1
FRONTEND_DOMAIN=https://airly.life
REACT_APP_HOST_API=https://api.airly.life
```

### 3. Запуск проекта

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

### 4. Инициализация базы данных

```bash
# Применение миграций
docker-compose exec backend python manage.py migrate

# Загрузка фикстур (опционально, для тестовых данных)
docker-compose exec backend python manage.py loaddata apps/core/fixtures/freshair_data.yaml
docker-compose exec backend python manage.py loaddata apps/users/fixtures/freshair_users.yaml

# Создание суперпользователя (для доступа к админке)
docker-compose exec backend python manage.py createsuperuser
```

### 5. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/v1/toolkit/

## Конфигурация

### Переменные окружения

Основные переменные в файле `.env`:

#### База данных
```env
POSTGRES_DB=freshair
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

#### Django
```env
DEBUG=False
SECRET_KEY=<измените-на-произвольный-ключ>
ALLOWED_HOSTS=api.airly.life,localhost,127.0.0.1
FRONTEND_DOMAIN=https://airly.life
CORS_ALLOWED_ORIGINS=https://airly.life,https://www.airly.life
```

#### Frontend
```env
REACT_APP_HOST_API=https://api.airly.life
FRONTEND_PORT=3000
```

### Порты

По умолчанию используются следующие порты:
- **3000** - Frontend (Nginx)
- **8000** - Backend (Gunicorn)
- **5432** - PostgreSQL
- **6379** - Redis

Изменить порты можно в `.env` файле:
```env
FRONTEND_PORT=80
BACKEND_PORT=8000
POSTGRES_PORT=5432
REDIS_PORT=6379
```

## Сервисы

### 1. db (PostgreSQL)

База данных PostgreSQL 15.

```yaml
image: postgres:15-alpine
volumes:
  - postgres_data:/var/lib/postgresql/data
```

### 2. redis

Redis для Celery broker и кэширования.

```yaml
image: redis:7-alpine
volumes:
  - redis_data:/data
```

### 3. backend (Django)

Django приложение с Gunicorn.

```yaml
build:
  context: ./backend
  dockerfile: Dockerfile
command: gunicorn --bind 0.0.0.0:8000 --workers 4 config.wsgi:application
```

**Entrypoint скрипт** автоматически:
- Ждет доступности базы данных
- Применяет миграции
- Собирает статические файлы

### 4. celery

Celery worker для фоновых задач.

```yaml
command: celery -A config worker --loglevel=info
```

### 5. celery-beat

Celery beat для периодических задач.

```yaml
command: celery -A config beat --loglevel=info --scheduler=django_celery_beat.schedulers:DatabaseScheduler
```

### 6. frontend (React + Nginx)

React приложение, собранное и раздаваемое через Nginx.

```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile
```

## Команды

### Управление контейнерами

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Пересборка и запуск
docker-compose up -d --build

# Остановка с удалением volumes (ОСТОРОЖНО: удалит данные!)
docker-compose down -v
```

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Выполнение команд

```bash
# Django shell
docker-compose exec backend python manage.py shell

# Создание миграций
docker-compose exec backend python manage.py makemigrations

# Применение миграций
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузка фикстур
docker-compose exec backend python manage.py loaddata apps/core/fixtures/freshair_data.yaml

# Коллекция статики
docker-compose exec backend python manage.py collectstatic

# Доступ к базе данных
docker-compose exec db psql -U postgres -d freshair
```

### Обслуживание

```bash
# Просмотр использования ресурсов
docker-compose stats

# Просмотр сетей
docker network ls

# Просмотр volumes
docker volume ls

# Очистка неиспользуемых ресурсов
docker system prune
```

## Бэкапы

### Создание бэкапа базы данных

```bash
# Создание бэкапа
docker-compose exec db pg_dump -U postgres freshair > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker-compose exec -T db psql -U postgres freshair < backup.sql
```

### Автоматический бэкап (пример cron)

```bash
# Добавьте в crontab
0 2 * * * cd /path/to/FreshAir && docker-compose exec -T db pg_dump -U postgres freshair > /backups/freshair_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Проблема: Контейнер не запускается

**Проверьте логи:**
```bash
docker-compose logs backend
```

**Общие причины:**
- Порт уже занят
- Недостаточно памяти
- Ошибка в конфигурации

### Проблема: Не могу подключиться к базе данных

**Проверьте:**
```bash
# Статус контейнера db
docker-compose ps db

# Логи базы данных
docker-compose logs db

# Проверка подключения
docker-compose exec backend python manage.py dbshell
```

**Решение:**
- Убедитесь, что `POSTGRES_HOST=db` в `.env`
- Проверьте, что контейнер db запущен: `docker-compose ps`

### Проблема: Миграции не применяются

**Принудительное применение:**
```bash
docker-compose exec backend python manage.py migrate --run-syncdb
```

### Проблема: Статические файлы не загружаются

**Соберите статику заново:**
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### Проблема: Frontend не собирается

**Очистка и пересборка:**
```bash
# Удаление образа
docker-compose down
docker rmi freshair_frontend

# Пересборка
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Проблема: CORS ошибки

**Проверьте настройки CORS:**
```bash
# В .env файле
CORS_ALLOWED_ORIGINS=https://airly.life,https://www.airly.life
FRONTEND_DOMAIN=https://airly.life
```

**Перезапустите backend:**
```bash
docker-compose restart backend
```

## Мониторинг

### Health checks

Все сервисы имеют health checks. Проверьте статус:

```bash
docker-compose ps
```

Все сервисы должны показывать `healthy` статус.

### Проверка производительности

```bash
# Использование ресурсов
docker-compose stats

# Логи производительности
docker-compose logs backend | grep -i "slow"
```

## Обновление

### Обновление кода

```bash
# Получение последних изменений
git pull

# Пересборка и перезапуск
docker-compose up -d --build

# Применение новых миграций
docker-compose exec backend python manage.py migrate
```

### Обновление зависимостей

```bash
# Backend
docker-compose exec backend pip install -r requirements.prod.txt --upgrade

# Frontend (требует пересборки образа)
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## Production Checklist

Перед деплоем в production убедитесь:

- [ ] `DEBUG=False` в `.env`
- [ ] Сильный `SECRET_KEY` установлен
- [ ] `ALLOWED_HOSTS` содержит домены
- [ ] `FRONTEND_DOMAIN` и `REACT_APP_HOST_API` настроены правильно
- [ ] `CORS_ALLOWED_ORIGINS` настроен
- [ ] SSL сертификаты настроены
- [ ] Резервное копирование настроено
- [ ] Мониторинг настроен
- [ ] Логи настроены
- [ ] Firewall настроен

Подробнее: [Production Deployment Guide](production.md)

