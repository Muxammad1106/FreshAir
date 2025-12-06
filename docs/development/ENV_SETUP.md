# Настройка переменных окружения

## Обновление .env файла

Для подключения к бэкенду на `localhost:8000`, обновите файл `.env` в корне папки `frontend`:

```env
# PORT
PORT=8083

# Backend API URL - ИЗМЕНИТЕ ЭТУ СТРОКУ
REACT_APP_HOST_API=http://localhost:8000
REACT_APP_ASSETS_API=http://localhost:8000

# MAP
REACT_APP_MAPBOX_API=

# FIREBASE (optional)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APPID=

# AWS AMPLIFY (optional)
REACT_APP_AWS_AMPLIFY_USER_POOL_ID=
REACT_APP_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID=
REACT_APP_AWS_AMPLIFY_REGION=

# AUTH0 (optional)
REACT_APP_AUTH0_CALLBACK_URL=
REACT_APP_AUTH0_DOMAIN=
REACT_APP_AUTH0_CLIENT_ID=
```

## Важно

1. После изменения `.env` файла, перезапустите dev server:
   ```bash
   npm start
   # или
   yarn start
   ```

2. Значение по умолчанию: если `REACT_APP_HOST_API` не установлен, будет использоваться `http://localhost:8000`

3. Файл `.env` находится в `.gitignore`, поэтому не будет закоммичен в репозиторий

## Текущая конфигурация API

Все API endpoints настроены для работы с бэкендом:
- Базовый путь: `/api/v1/`
- Формат токена: `Token {token}` (не Bearer)
- Автоматическое добавление токена в заголовки запросов

