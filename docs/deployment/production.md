# Production Deployment Guide

Руководство по развертыванию FreshAir в production окружении.

## Предварительные требования

1. **Сервер** с Ubuntu 20.04+ или подобной ОС
2. **Docker** и **Docker Compose** установлены
3. **Домены** настроены и указывают на сервер:
   - `airly.life` → IP сервера
   - `api.airly.life` → IP сервера
4. **SSL сертификаты** (рекомендуется Let's Encrypt)
5. **Firewall** настроен

## Настройка сервера

### 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Docker

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Настройка Firewall

```bash
# Разрешить SSH (важно!)
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable
```

## Настройка DNS

Настройте A записи у вашего DNS провайдера:

```
A    airly.life         → <IP_СЕРВЕРА>
A    api.airly.life     → <IP_СЕРВЕРА>
```

Проверка:
```bash
dig airly.life
dig api.airly.life
```

## Настройка SSL (Let's Encrypt)

### Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Получение сертификатов

```bash
# Для frontend домена
sudo certbot certonly --standalone -d airly.life -d www.airly.life

# Для backend домена
sudo certbot certonly --standalone -d api.airly.life
```

Сертификаты будут сохранены в:
- `/etc/letsencrypt/live/airly.life/`
- `/etc/letsencrypt/live/api.airly.life/`

### Автоматическое обновление

```bash
# Добавьте в crontab для автоматического обновления
sudo crontab -e
# Добавьте строку:
0 3 * * * certbot renew --quiet && docker-compose -f /path/to/FreshAir/docker-compose.yml restart
```

## Настройка Reverse Proxy (Nginx)

Создайте конфигурацию Nginx для проксирования:

### `/etc/nginx/sites-available/airly.life`

```nginx
# Frontend
server {
    listen 80;
    server_name airly.life www.airly.life;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name airly.life www.airly.life;

    ssl_certificate /etc/letsencrypt/live/airly.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/airly.life/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.airly.life;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.airly.life;

    ssl_certificate /etc/letsencrypt/live/api.airly.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.airly.life/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Для WebSocket если нужно
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/airly.life /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Настройка проекта

### 1. Клонирование репозитория

```bash
cd /opt
sudo git clone <repository-url> FreshAir
sudo chown -R $USER:$USER FreshAir
cd FreshAir
```

### 2. Настройка переменных окружения

```bash
cp env.example .env
nano .env
```

**Важные настройки для production:**

```env
# Django
DEBUG=False
SECRET_KEY=<сгенерируйте-сильный-ключ-минимум-50-символов>
ALLOWED_HOSTS=api.airly.life,localhost,127.0.0.1
FRONTEND_DOMAIN=https://airly.life
CORS_ALLOWED_ORIGINS=https://airly.life,https://www.airly.life

# Frontend
REACT_APP_HOST_API=https://api.airly.life

# Database
POSTGRES_PASSWORD=<сильный-пароль-для-базы>

# Другие настройки...
```

**Генерация SECRET_KEY:**

```python
python -c 'import secrets; print(secrets.token_urlsafe(50))'
```

### 3. Первый запуск

```bash
# Сборка и запуск
docker-compose up -d --build

# Применение миграций
docker-compose exec backend python manage.py migrate

# Создание суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузка начальных данных (опционально)
docker-compose exec backend python manage.py loaddata apps/core/fixtures/freshair_data.yaml
docker-compose exec backend python manage.py loaddata apps/users/fixtures/freshair_users.yaml
```

## Настройка автозапуска

Создайте systemd service для автоматического запуска:

### `/etc/systemd/system/freshair.service`

```ini
[Unit]
Description=FreshAir Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/FreshAir
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Активируйте:

```bash
sudo systemctl daemon-reload
sudo systemctl enable freshair
sudo systemctl start freshair
```

## Мониторинг

### Настройка логирования

Логи сохраняются в volumes. Для централизованного логирования можно использовать:

- **Docker logging driver** для отправки в внешний сервис
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **Sentry** для ошибок (уже интегрировано в проект)

### Health checks

Настройте мониторинг здоровья сервисов:

```bash
# Скрипт для проверки
#!/bin/bash
docker-compose ps | grep -q "Up (healthy)" || exit 1
```

Добавьте в cron для периодической проверки.

## Резервное копирование

### Автоматический бэкап базы данных

Создайте скрипт `/opt/FreshAir/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/freshair"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Бэкап базы данных
docker-compose exec -T db pg_dump -U postgres freshair | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Бэкап media файлов
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /opt/FreshAir backend/media

echo "Backup completed: $DATE"
```

Сделайте исполняемым и добавьте в cron:

```bash
chmod +x /opt/FreshAir/backup.sh
crontab -e
# Добавьте:
0 2 * * * /opt/FreshAir/backup.sh >> /var/log/freshair_backup.log 2>&1
```

## Обновление

### Процесс обновления

```bash
# 1. Бэкап
./backup.sh

# 2. Остановка
docker-compose down

# 3. Обновление кода
git pull

# 4. Пересборка
docker-compose build --no-cache

# 5. Запуск
docker-compose up -d

# 6. Миграции
docker-compose exec backend python manage.py migrate

# 7. Статика
docker-compose exec backend python manage.py collectstatic --noinput
```

## Безопасность

### Checklist безопасности

- [ ] `DEBUG=False`
- [ ] Сильный `SECRET_KEY`
- [ ] Пароли БД сложные
- [ ] SSL сертификаты установлены
- [ ] Firewall настроен
- [ ] SSH доступ только по ключам
- [ ] Регулярные обновления системы
- [ ] Логирование включено
- [ ] Мониторинг настроен
- [ ] Бэкапы настроены

### Дополнительные меры

1. **Fail2ban** для защиты от brute force:
```bash
sudo apt install fail2ban
```

2. **Регулярные обновления**:
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Мониторинг дискового пространства**:
```bash
df -h
docker system df
```

## Масштабирование

### Горизонтальное масштабирование backend

Для масштабирования можно запустить несколько инстансов backend:

```yaml
# В docker-compose.yml
backend:
  deploy:
    replicas: 3
```

Требуется внешний load balancer (Nginx/HAProxy).

### Использование внешней БД

Для production рекомендуется использовать управляемую БД (AWS RDS, DigitalOcean Managed Database и т.д.):

```env
POSTGRES_HOST=external-db-host.com
POSTGRES_PORT=5432
POSTGRES_DB=freshair
POSTGRES_USER=freshair_user
POSTGRES_PASSWORD=<password>
```

## Поддержка

При проблемах:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте ресурсы: `docker stats`
4. См. [Troubleshooting](docker.md#troubleshooting)

