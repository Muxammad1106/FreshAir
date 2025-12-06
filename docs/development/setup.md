# Development Setup

Руководство по настройке окружения для разработки проекта FreshAir.

## Предварительные требования

### Backend
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- pip

### Frontend
- Node.js 18+
- npm или yarn

## Локальная разработка (без Docker)

### Backend Setup

1. **Клонирование репозитория**
   ```bash
   git clone <repository-url>
   cd FreshAir/backend
   ```

2. **Создание виртуального окружения**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # или
   venv\Scripts\activate  # Windows
   ```

3. **Установка зависимостей**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements.prod.txt
   ```

4. **Настройка базы данных**

   Создайте файл `config/settings_dev.py`:
   ```python
   from .settings import *
   
   DEBUG = True
   
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'freshair_dev',
           'USER': 'postgres',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': 5432,
       }
   }
   
   CELERY_BROKER_URL = 'redis://localhost:6379/0'
   CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
   ```

5. **Применение миграций**
   ```bash
   python manage.py migrate
   ```

6. **Загрузка фикстур**
   ```bash
   python manage.py loaddata apps/core/fixtures/freshair_data.yaml
   python manage.py loaddata apps/users/fixtures/freshair_users.yaml
   ```

7. **Создание суперпользователя**
   ```bash
   python manage.py createsuperuser
   ```

8. **Запуск сервера разработки**
   ```bash
   python manage.py runserver
   ```

9. **Запуск Celery** (в отдельном терминале)
   ```bash
   celery -A config worker --loglevel=info
   ```

10. **Запуск Celery Beat** (в отдельном терминале)
   ```bash
   celery -A config beat --loglevel=info
   ```

### Frontend Setup

1. **Переход в директорию frontend**
   ```bash
   cd ../frontend
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   # или
   yarn install
   ```

3. **Настройка переменных окружения**

   Создайте файл `.env.local`:
   ```env
   REACT_APP_HOST_API=http://localhost:8000
   ```

4. **Запуск dev сервера**
   ```bash
   npm start
   # или
   yarn start
   ```

   Приложение будет доступно на http://localhost:3000

## Тестовые данные

### Демо-аккаунт кастомера

- **Email**: `demo@freshair.com`
- **Password**: `password`

Этот аккаунт содержит полный набор тестовых данных:
- Профиль кастомера
- Несколько помещений
- Активные заказы
- Устройства с метриками
- История платежей (30+ транзакций)
- Платежные карты

### Другие тестовые аккаунты

**Кастомеры:**
- `customer1@freshair.com` / `password`
- `customer2@freshair.com` / `password`
- `customer3@freshair.com` / `password`

**Инвесторы:**
- `investor1@freshair.com` / `password`
- `investor2@freshair.com` / `password`

## Структура проекта

### Backend

```
backend/
├── apps/
│   ├── core/              # Основная бизнес-логика
│   │   ├── models.py      # Модели данных
│   │   ├── views/         # API views
│   │   ├── serializers/   # DRF serializers
│   │   └── fixtures/      # Тестовые данные
│   ├── users/             # Управление пользователями
│   ├── api/               # API endpoints (legacy)
│   └── toolkit/           # Общие утилиты
├── config/                # Настройки Django
│   ├── settings.py        # Основные настройки
│   ├── urls.py            # URL конфигурация
│   └── wsgi.py            # WSGI конфигурация
└── manage.py
```

### Frontend

```
frontend/
├── src/
│   ├── pages/
│   │   ├── client/        # Страницы для клиентов
│   │   └── investor/      # Страницы для инвесторов
│   ├── components/        # Переиспользуемые компоненты
│   ├── layouts/           # Layout компоненты
│   ├── routes/            # Роутинг
│   ├── utils/             # Утилиты
│   └── config-global.ts   # Глобальная конфигурация
├── public/                # Статические файлы
└── package.json
```

## Работа с кодом

### Backend

#### Создание миграций
```bash
python manage.py makemigrations
```

#### Применение миграций
```bash
python manage.py migrate
```

#### Django Shell
```bash
python manage.py shell
```

#### Запуск тестов
```bash
python manage.py test
```

#### Админка
```bash
# Доступ на http://localhost:8000/admin
```

### Frontend

#### Сборка для production
```bash
npm run build
# или
yarn build
```

#### Линтинг
```bash
npm run lint
# или
yarn lint
```

#### Исправление ошибок линтера
```bash
npm run lint:fix
# или
yarn lint:fix
```

#### Форматирование кода
```bash
npm run prettier
# или
yarn prettier
```

## Использование Docker для разработки

Альтернативно можно использовать Docker:

```bash
# Из корня проекта
docker-compose up -d

# Логи
docker-compose logs -f

# Выполнение команд
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py shell
```

## IDE настройки

### VS Code

Рекомендуемые расширения:
- Python
- ESLint
- Prettier
- Docker
- Django

### PyCharm

1. Откройте проект
2. Настройте интерпретатор Python (venv)
3. Настройте Django project
4. Настройте PostgreSQL database connection

## Отладка

### Backend

```bash
# Django debug toolbar (если установлен)
# Добавьте в INSTALLED_APPS и MIDDLEWARE

# Логирование
import logging
logger = logging.getLogger(__name__)
logger.debug('Debug message')
```

### Frontend

```bash
# React DevTools в браузере
# Console в браузере для отладки
console.log('Debug:', data);
```

## Git Workflow

```bash
# Создание ветки для фичи
git checkout -b feature/my-feature

# Коммит изменений
git add .
git commit -m "feat: описание изменений"

# Push
git push origin feature/my-feature

# Создание Pull Request
```

### Commit Messages

Используйте conventional commits:
- `feat:` - новая функциональность
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов
- `chore:` - обновление зависимостей и т.д.

## Полезные команды

### Backend

```bash
# Очистка кэша
python manage.py shell -c "from django.core.cache import cache; cache.clear()"

# Создание фикстур из БД
python manage.py dumpdata core --indent 2 > fixtures.json

# Проверка проекта
python manage.py check

# Сборка статики
python manage.py collectstatic
```

### Frontend

```bash
# Очистка node_modules и переустановка
rm -rf node_modules package-lock.json
npm install

# Очистка build
rm -rf build
npm run build
```

## Troubleshooting

### Проблема: База данных не подключается

**Решение:**
- Проверьте настройки в `settings_dev.py`
- Убедитесь, что PostgreSQL запущен
- Проверьте права доступа пользователя БД

### Проблема: Порты заняты

**Решение:**
```bash
# Проверка занятых портов
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Остановка процесса
kill -9 <PID>
```

### Проблема: Миграции конфликтуют

**Решение:**
```bash
# Откат миграций
python manage.py migrate app_name zero

# Применение заново
python manage.py migrate
```

### Проблема: Node modules проблемы

**Решение:**
```bash
# Полная очистка
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Дополнительные ресурсы

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

