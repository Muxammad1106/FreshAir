# Быстрое решение проблемы с PostgreSQL

## Проблема
Порт 5432 уже занят локальным PostgreSQL на сервере.

## Решение: Использование внешнего PostgreSQL

### Шаг 1: Создайте базу данных

```bash
sudo -u postgres psql
```

В psql:
```sql
CREATE DATABASE freshair;
CREATE USER freshair_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE freshair TO freshair_user;
\q
```

### Шаг 2: Настройте PostgreSQL для подключений от Docker

#### Найти версию PostgreSQL:
```bash
sudo -u postgres psql -c "SHOW server_version;"
```

#### Измените конфиг (замените 15 на вашу версию):
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Найдите и измените:
```
listen_addresses = '*'
```

#### Измените pg_hba.conf:
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Добавьте в конец:
```
host    freshair    freshair_user    172.17.0.0/16    md5
```

#### Перезапустите:
```bash
sudo systemctl restart postgresql
```

### Шаг 3: Обновите .env файл

```bash
nano .env
```

Измените:
```env
POSTGRES_DB=freshair
POSTGRES_USER=freshair_user
POSTGRES_PASSWORD=your-password
POSTGRES_HOST=172.17.0.1
POSTGRES_PORT=5432
```

### Шаг 4: Запустите проект

```bash
docker-compose up -d
```

### Шаг 5: Примените миграции

```bash
docker-compose exec backend python manage.py migrate
```

## Проверка

```bash
# Проверка подключения
docker-compose exec backend python manage.py dbshell
```

Если все работает, вы увидите psql prompt.

## Альтернатива: Изменить порт контейнера

Если хотите использовать контейнер PostgreSQL на другом порту:

В `docker-compose.yml` раскомментируйте секцию `db:` и измените:
```yaml
ports:
  - "5433:5432"  # Внешний порт 5433
```

---

Подробная документация: [docs/deployment/external-postgres.md](docs/deployment/external-postgres.md)

