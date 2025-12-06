# Production Settings Configuration

## Автоматическое создание settings_prod.py

При деплое проекта `settings_prod.py` автоматически создается из `settings_prod.py.example` если файл отсутствует.

## Процесс

1. **Шаблон настроек**: `backend/config/settings_prod.py.example` содержит все необходимые параметры
2. **Автоматическое создание**: При запуске контейнера `docker-entrypoint.sh` проверяет наличие `settings_prod.py` и создает его из example если нужно
3. **Использование**: Docker Compose автоматически использует `config.settings_prod` как модуль настроек Django

## Текущие настройки в settings_prod.py.example

### База данных
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fresh2',
        'USER': 'suv',
        'PASSWORD': 'suv',
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', 5432),
    }
}
```

### Другие настройки
- `FRONTEND_DOMAIN`: https://airly.life
- `DEBUG`: False (production)
- `STATIC_ROOT`: /static
- `MEDIA_ROOT`: /uploads

## Изменение настроек

### Вариант 1: Изменить example файл (рекомендуется)
1. Отредактируйте `backend/config/settings_prod.py.example`
2. Закоммитьте изменения
3. При следующем деплое файл будет создан с новыми настройками

### Вариант 2: Изменить существующий файл
1. Отредактируйте `backend/config/settings_prod.py` напрямую на сервере
2. Изменения будут сохранены (файл не перезаписывается если существует)

## Переменные окружения

Некоторые параметры можно переопределить через переменные окружения в `.env`:

```env
POSTGRES_HOST=172.17.0.1
POSTGRES_PORT=5432
FRONTEND_DOMAIN=https://airly.life
SENTRY_URL=your-sentry-dsn
EMAIL_HOST=smtp.mail.ru
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password
```

## Проверка

После деплоя проверьте что настройки применились:

```bash
docker-compose exec backend python manage.py shell
```

В shell:
```python
from django.conf import settings
print(settings.DATABASES['default']['NAME'])  # Должно быть 'fresh2'
print(settings.DATABASES['default']['USER'])  # Должно быть 'suv'
print(settings.DEBUG)  # Должно быть False
```

## Важно

- `settings_prod.py` не должен попадать в git (добавлен в `.gitignore`)
- `settings_prod.py.example` должен быть в git
- При первом деплое файл создается автоматически
- Файл не перезаписывается при последующих запусках (защита от потери изменений)

