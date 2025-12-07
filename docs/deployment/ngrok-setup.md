# Настройка ngrok для разработки

## Проблема с ngrok free tier

Ngrok free tier показывает страницу предупреждения при первом посещении. Это нормально и безопасно - нужно просто нажать "Visit Site" для продолжения.

## Решение проблемы "ERR_NGROK_6024"

### Вариант 1: Просто нажмите "Visit Site"

На странице предупреждения ngrok нажмите кнопку **"Visit Site"** или **"Продолжить"** - это безопасно, если вы сами запустили ngrok.

### Вариант 2: Использовать ngrok без предупреждения (платно)

Если используете платную версию ngrok, можно настроить кастомный домен и отключить предупреждение.

### Вариант 3: Использовать ngrok с флагом (для разработки)

При запуске ngrok можно добавить флаг для пропуска предупреждения (но это работает только для backend):

```bash
ngrok http 8001 --host-header=rewrite
```

Но для frontend лучше использовать платную версию или просто нажимать "Visit Site".

## Обновление ALLOWED_HOSTS при смене ngrok URL

Когда ngrok перезапускается, URL меняется. Нужно обновить:

### 1. В `settings.py`:

```python
_allowed_hosts_default = 'api.airly.life,localhost,127.0.0.1,НОВЫЙ-ngrok-домен.ngrok-free.app'
```

### 2. В `CORS_ALLOWED_ORIGINS`:

```python
CORS_ALLOWED_ORIGINS = [
    FRONTEND_DOMAIN,
    'https://НОВЫЙ-ngrok-домен.ngrok-free.app',
]
```

### 3. Или через переменную окружения:

В `.env`:
```env
ALLOWED_HOSTS=api.airly.life,localhost,127.0.0.1,НОВЫЙ-ngrok-домен.ngrok-free.app
CORS_ALLOWED_ORIGINS=https://airly.life,https://НОВЫЙ-ngrok-домен.ngrok-free.app
```

### 4. Перезапустить backend:

```bash
# Если Docker
docker-compose restart backend

# Если systemd
sudo systemctl restart freshair-backend
```

## Автоматическое обновление ngrok URL

Для автоматического обновления можно использовать скрипт, который:

1. Получает текущий ngrok URL через ngrok API
2. Обновляет настройки Django
3. Перезапускает сервис

Или использовать ngrok с фиксированным доменом (платная функция).

## Текущие ngrok домены

Добавлены в настройки:
- `8cef48143298.ngrok-free.app`
- `37d9e4e326d7.ngrok-free.app`

## Проверка работы

После добавления нового ngrok домена:

1. Нажмите "Visit Site" на странице предупреждения ngrok
2. Проверьте что сайт загружается
3. Проверьте что API запросы работают (в DevTools → Network)

## Важно

- Ngrok free tier меняет URL при каждом перезапуске
- Для production используйте реальный домен, не ngrok
- Страница предупреждения ngrok - это нормально для free tier


