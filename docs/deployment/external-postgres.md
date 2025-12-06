# Использование внешнего PostgreSQL

Если на сервере уже установлен PostgreSQL, вы можете использовать его вместо контейнера Docker.

## Настройка

### 1. Подготовка базы данных

Создайте базу данных и пользователя в PostgreSQL:

```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных
CREATE DATABASE freshair;

# Создайте пользователя (или используйте существующего)
CREATE USER freshair_user WITH PASSWORD 'your-secure-password';

# Дайте права на базу данных
GRANT ALL PRIVILEGES ON DATABASE freshair TO freshair_user;

# Выйдите
\q
```

### 2. Настройка PostgreSQL для приема подключений от Docker

#### Измените `postgresql.conf`:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Найдите и измените:
```
listen_addresses = '*'  # или 'localhost,172.17.0.1'
```

#### Измените `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Добавьте в конец файла:
```
# Разрешить подключения от Docker контейнеров
host    freshair    freshair_user    172.17.0.0/16    md5
# Или для всех пользователей (менее безопасно):
host    all         all              172.17.0.0/16    md5
```

#### Перезапустите PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Настройка переменных окружения

Отредактируйте `.env` файл:

```env
POSTGRES_DB=freshair
POSTGRES_USER=freshair_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_HOST=172.17.0.1  # IP Docker bridge (для Linux)
# Для Mac/Windows используйте: host.docker.internal
POSTGRES_PORT=5432
```

**Для Linux** используйте один из вариантов:
- `172.17.0.1` - IP Docker bridge (по умолчанию)
- IP адрес хоста в Docker сети
- `host.docker.internal` - работает только на Mac/Windows, для Linux нужно добавить `extra_hosts`

### 4. Обновление docker-compose.yml

Контейнер `db` уже закомментирован в `docker-compose.yml`. Если нужно использовать внешний PostgreSQL, убедитесь что:

1. Секция `db:` закомментирована
2. `POSTGRES_HOST` указывает на хост
3. `extra_hosts` добавлен для Linux (если используете `host.docker.internal`)

### 5. Проверка подключения

Проверьте, что контейнеры могут подключиться к PostgreSQL:

```bash
# Запустите временный контейнер
docker run --rm -it --network freshair_freshair_network \
  -e POSTGRES_HOST=172.17.0.1 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your-password \
  postgres:15-alpine psql -h 172.17.0.1 -U postgres -d freshair
```

### 6. Запуск проекта

```bash
docker-compose up -d
```

## Альтернатива: Изменение порта контейнера

Если хотите использовать контейнер PostgreSQL, но на другом порту:

1. В `docker-compose.yml` измените порт маппинга:
```yaml
ports:
  - "5433:5432"  # Внешний порт 5433
```

2. В `.env` файле обновите порт:
```env
POSTGRES_PORT=5433  # Для подключения извне
```

Но внутри Docker сети используйте порт 5432.

## Troubleshooting

### Проблема: Connection refused

**Решение:**
- Проверьте `listen_addresses` в `postgresql.conf`
- Проверьте правила в `pg_hba.conf`
- Убедитесь, что firewall разрешает подключения

### Проблема: Authentication failed

**Решение:**
- Проверьте пароль пользователя
- Проверьте правила в `pg_hba.conf`
- Убедитесь, что пользователь существует и имеет права

### Проблема: Cannot connect from Docker (Linux)

**Решение:**
- Используйте `172.17.0.1` вместо `host.docker.internal`
- Или добавьте в `docker-compose.yml`:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Определение IP Docker bridge

```bash
# Узнайте IP Docker bridge
docker network inspect bridge | grep Gateway
```

## Безопасность

⚠️ **Важно для production:**

1. Используйте отдельного пользователя БД (не postgres)
2. Давайте минимальные необходимые права
3. Ограничьте доступ в `pg_hba.conf` только нужным сетям
4. Используйте сильные пароли
5. Настройте SSL подключения

## Проверка подключения

После настройки проверьте подключение:

```bash
# Из контейнера backend
docker-compose exec backend python manage.py dbshell

# Должно открыться psql shell
```

