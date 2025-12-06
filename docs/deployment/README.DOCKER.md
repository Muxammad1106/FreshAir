# Docker Deployment Guide

Это руководство по развертыванию проекта FreshAir с использованием Docker и Docker Compose.

## Требования

- Docker 20.10+
- Docker Compose 2.0+

## Быстрый старт

1. **Скопируйте файл с переменными окружения:**
   ```bash
   cp .env.example .env
   ```

2. **Отредактируйте `.env` файл** с вашими настройками:
   ```bash
   nano .env
   ```

3. **Соберите и запустите контейнеры:**
   ```bash
   docker-compose up -d --build
   ```

4. **Проверьте статус контейнеров:**
   ```bash
   docker-compose ps
   ```

5. **Просмотрите логи:**
   ```bash
   # Все логи
   docker-compose logs -f
   
   # Логи конкретного сервиса
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

## Доступ к приложению

### Production (с настройкой DNS):
- **Frontend:** https://airly.life
- **Backend API:** https://api.airly.life
- **Django Admin:** https://api.airly.life/admin
- **API Docs (Swagger):** https://api.airly.life/api/v1/toolkit/

### Local Development:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin
- **API Docs (Swagger):** http://localhost:8000/api/v1/toolkit/

## Полезные команды

### Остановка контейнеров
```bash
docker-compose down
```

### Остановка с удалением volumes (очистка данных)
```bash
docker-compose down -v
```

### Пересборка после изменений
```bash
docker-compose up -d --build
```

### Выполнение команд в контейнере
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
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery
```

## Структура сервисов

- **db** - PostgreSQL база данных
- **redis** - Redis для Celery
- **backend** - Django приложение (Gunicorn)
- **celery** - Celery worker
- **celery-beat** - Celery beat scheduler
- **frontend** - React приложение (Nginx)

## Переменные окружения

Основные переменные окружения настраиваются в файле `.env`:

- `POSTGRES_*` - настройки базы данных
- `DEBUG` - режим отладки Django (False для production)
- `SECRET_KEY` - секретный ключ Django (обязательно измените!)
- `ALLOWED_HOSTS` - разрешенные хосты (например: `api.airly.life,localhost,127.0.0.1`)
- `FRONTEND_DOMAIN` - домен фронтенда для CORS (например: `https://airly.life`)
- `REACT_APP_HOST_API` - URL API для фронтенда (например: `https://api.airly.life`)
- `CORS_ALLOWED_ORIGINS` - разрешенные источники для CORS (например: `https://airly.life,https://www.airly.life`)

## Production Deployment

Для production развертывания с доменами airly.life:

1. **Измените `DEBUG=False` в `.env`**
2. **Установите сильный `SECRET_KEY`**
3. **Настройте домены:**
   ```env
   ALLOWED_HOSTS=api.airly.life,localhost,127.0.0.1
   FRONTEND_DOMAIN=https://airly.life
   REACT_APP_HOST_API=https://api.airly.life
   CORS_ALLOWED_ORIGINS=https://airly.life,https://www.airly.life
   ```
4. **Настройте DNS записи:**
   - `A` запись для `airly.life` → IP сервера
   - `A` запись для `api.airly.life` → IP сервера
   - (Опционально) `CNAME` для `www.airly.life` → `airly.life`
5. **Настройте SSL сертификаты** (Let's Encrypt через certbot)
6. **Используйте внешний PostgreSQL и Redis** (рекомендуется для production)
7. **Настройте reverse proxy** (Nginx/Traefik) для HTTPS и маршрутизации:
   - `airly.life` → frontend контейнер
   - `api.airly.life` → backend контейнер

### Пример production docker-compose.override.yml:
```yaml
services:
  backend:
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=api.airly.life
      - FRONTEND_DOMAIN=https://airly.life
      - CORS_ALLOWED_ORIGINS=https://airly.life,https://www.airly.life
  frontend:
    build:
      args:
        REACT_APP_HOST_API: https://api.airly.life
```

## Резервное копирование базы данных

```bash
# Создание бэкапа
docker-compose exec db pg_dump -U postgres freshair > backup.sql

# Восстановление из бэкапа
docker-compose exec -T db psql -U postgres freshair < backup.sql
```

## Мониторинг

Проверьте здоровье сервисов:
```bash
docker-compose ps
```

Все сервисы должны быть в статусе `Up` и `healthy`.

## Troubleshooting

### Проблема с подключением к базе данных
```bash
# Проверьте логи базы данных
docker-compose logs db

# Проверьте подключение
docker-compose exec backend python manage.py dbshell
```

### Проблема с миграциями
```bash
# Примените миграции вручную
docker-compose exec backend python manage.py migrate
```

### Очистка и перезапуск
```bash
# Остановка и удаление контейнеров
docker-compose down

# Удаление volumes (ОСТОРОЖНО: удалит данные!)
docker-compose down -v

# Пересборка и запуск
docker-compose up -d --build
```

## Безопасность

⚠️ **Важно для production:**

1. Измените все пароли в `.env`
2. Используйте сильный `SECRET_KEY`
3. Установите `DEBUG=False`
4. Настройте `ALLOWED_HOSTS`
5. Используйте HTTPS (настройте reverse proxy)
6. Настройте firewall
7. Регулярно обновляйте образы Docker

