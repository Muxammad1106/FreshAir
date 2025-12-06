# Backend Dockerfile
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.prod.txt requirements.txt ./

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.prod.txt && \
    pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта
COPY . .

# Создаем директории для статики и медиа
RUN mkdir -p /app/static /app/media

# Устанавливаем переменные окружения по умолчанию
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-config.settings}

# Открываем порт
EXPOSE 8000

# Создаем entrypoint скрипт
RUN chmod +x /app/docker-entrypoint.sh || true

# Команда по умолчанию
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "config.wsgi:application"]

