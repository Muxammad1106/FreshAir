# Contributing Guide

Руководство для разработчиков, желающих внести вклад в проект FreshAir.

## Процесс разработки

### 1. Fork и Clone

```bash
# Fork репозитория на GitHub
# Затем клонируйте ваш fork
git clone https://github.com/YOUR_USERNAME/FreshAir.git
cd FreshAir
```

### 2. Создание ветки

```bash
git checkout -b feature/your-feature-name
# или
git checkout -b fix/bug-description
```

### 3. Настройка окружения

Следуйте инструкциям в [Development Setup](setup.md).

### 4. Внесение изменений

- Следуйте стандартам кода (см. ниже)
- Пишите чистый, читаемый код
- Добавляйте комментарии где необходимо
- Обновляйте документацию при необходимости

### 5. Тестирование

```bash
# Backend тесты
python manage.py test

# Frontend линтинг
npm run lint
```

### 6. Commit и Push

```bash
git add .
git commit -m "feat: описание ваших изменений"
git push origin feature/your-feature-name
```

### 7. Создание Pull Request

Создайте Pull Request на GitHub с описанием изменений.

## Стандарты кода

### Python (Backend)

1. **PEP 8** - следуйте стилю PEP 8
2. **Именование:**
   - Классы: `PascalCase`
   - Функции и переменные: `snake_case`
   - Константы: `UPPER_SNAKE_CASE`
3. **Длина строк:** максимум 120 символов
4. **Импорты:** отсортированы (isort)

**Пример:**
```python
from django.db import models
from toolkit.models import BaseModel


class CustomerOrder(BaseModel):
    """Заказ клиента."""
    
    STATUS_PENDING = 'PENDING'
    STATUS_APPROVED = 'APPROVED'
    
    customer = models.ForeignKey('users.User', models.CASCADE)
    status = models.CharField(max_length=20, default=STATUS_PENDING)
    
    def calculate_total_cost(self):
        """Рассчитывает общую стоимость заказа."""
        # ...
```

### TypeScript/React (Frontend)

1. **ESLint** - следуйте правилам ESLint
2. **Prettier** - автоматическое форматирование
3. **Именование:**
   - Компоненты: `PascalCase`
   - Функции и переменные: `camelCase`
   - Типы и интерфейсы: `PascalCase`
   - Константы: `UPPER_SNAKE_CASE`
4. **Типизация:** всегда используйте TypeScript типы

**Пример:**
```typescript
interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onView }) => {
  const handleClick = () => {
    onView(order);
  };

  return (
    <Card onClick={handleClick}>
      {/* ... */}
    </Card>
  );
};
```

## Архитектурные принципы

### Backend

1. **Разделение на apps:**
   - `core/` - основная бизнес-логика
   - `users/` - управление пользователями
   - `toolkit/` - общие утилиты

2. **Структура модуля:**
   ```
   app_name/
   ├── models.py          # Модели данных
   ├── views/             # API views
   │   ├── customer.py
   │   └── investor.py
   ├── serializers/       # DRF serializers
   ├── urls.py            # URL routing
   └── admin.py           # Django admin
   ```

3. **API Design:**
   - RESTful endpoints
   - Правильные HTTP методы
   - Консистентные ответы
   - Пагинация для списков

4. **Запросы к БД:**
   - Используйте `select_related` для ForeignKey
   - Используйте `prefetch_related` для ManyToMany
   - Избегайте N+1 запросов

### Frontend

1. **Структура компонентов:**
   ```
   components/
   ├── component-name/
   │   ├── component-name.tsx
   │   └── types.ts
   ```

2. **Разделение логики:**
   - Компоненты только для UI
   - Бизнес-логика в hooks или services
   - API запросы через `useGet`, `usePost` и т.д.

3. **Типизация:**
   - Все пропсы типизированы
   - Используйте типы из `types.ts`
   - Избегайте `any`

4. **Стилизация:**
   - Используйте Material-UI компоненты
   - Кастомные стили через `sx` prop
   - Используйте тему для цветов и размеров

## Code Review Checklist

Перед созданием PR проверьте:

### Общее
- [ ] Код следует стандартам проекта
- [ ] Нет комментарированного кода
- [ ] Нет console.log в production коде
- [ ] Документация обновлена

### Backend
- [ ] Миграции созданы и применены
- [ ] Тесты написаны (если необходимо)
- [ ] Нет SQL injection уязвимостей
- [ ] Оптимизированы запросы к БД
- [ ] Валидация входных данных
- [ ] Правильная обработка ошибок

### Frontend
- [ ] Компоненты переиспользуемые
- [ ] Нет дублирования кода
- [ ] TypeScript ошибок нет
- [ ] ESLint ошибок нет
- [ ] Код отформатирован (Prettier)
- [ ] Нет утечек памяти

### Безопасность
- [ ] Секретные данные не в коде
- [ ] Валидация на сервере
- [ ] CORS правильно настроен
- [ ] Аутентификация работает

## Pull Request Template

При создании PR используйте следующий шаблон:

```markdown
## Описание
Краткое описание изменений

## Тип изменений
- [ ] Новая функциональность
- [ ] Исправление бага
- [ ] Рефакторинг
- [ ] Документация
- [ ] Стили/UI улучшения

## Чек-лист
- [ ] Код следует стандартам проекта
- [ ] Я самостоятельно протестировал изменения
- [ ] Я обновил документацию
- [ ] Нет breaking changes (или они задокументированы)

## Скриншоты (если применимо)
Добавьте скриншоты для UI изменений

## Дополнительные заметки
Любые дополнительные комментарии
```

## Тестирование

### Backend Tests

```bash
# Запуск всех тестов
python manage.py test

# Тесты конкретного app
python manage.py test core

# Тесты конкретного файла
python manage.py test core.tests.test_models
```

### Frontend Tests

```bash
# Запуск тестов (если настроены)
npm test
```

## Работа с базами данных

### Миграции

```bash
# Создание миграций
python manage.py makemigrations

# Применение миграций
python manage.py migrate

# Откат миграций
python manage.py migrate app_name zero
```

### Фикстуры

```bash
# Загрузка фикстур
python manage.py loaddata apps/core/fixtures/freshair_data.yaml

# Экспорт данных
python manage.py dumpdata core --indent 2 > fixtures.json
```

## Общение

- Используйте Issues для багов и предложений
- Используйте Pull Requests для изменений
- Будьте вежливы и конструктивны
- Принимайте критику с благодарностью

## Вопросы?

Если у вас есть вопросы:
1. Проверьте документацию
2. Поищите в существующих Issues
3. Создайте новый Issue с вопросом

## Лицензия

Внося изменения, вы соглашаетесь, что ваш код будет лицензирован под той же лицензией, что и проект.

