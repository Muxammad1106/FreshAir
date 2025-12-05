# Auth Service

Чистая архитектура для интеграции с бекендом аутентификации.

## Структура

### `services/auth.ts`
Основной сервис для работы с API аутентификации:
- `signIn(credentials)` - вход в систему
- `signUp(data)` - регистрация нового пользователя
- `getMe()` - получение данных текущего пользователя
- `signOut()` - выход из системы

### Типы
- `SignInRequest` - данные для входа
- `SignUpRequest` - данные для регистрации
- `AuthResponse` - ответ от API с токеном и данными пользователя
- `ApiError` - формат ошибок API

## Использование

```typescript
import { authService } from 'src/services';

// Вход
try {
  const response = await authService.signIn({
    email: 'user@example.com',
    password: 'password123'
  });
  // response содержит token, user, role, permissions
} catch (error) {
  // Обработка ошибки
}

// Регистрация
try {
  const response = await authService.signUp({
    email: 'user@example.com',
    password: 'password123',
    full_name: 'John Doe',
    role: 'CUSTOMER' // или 'INVESTOR'
  });
} catch (error) {
  // Обработка ошибки
}
```

## Интеграция с Auth Provider

Auth Provider (`auth/context/jwt/auth-provider.tsx`) использует `authService` для всех операций аутентификации. Компоненты используют хук `useAuthContext()` для доступа к методам `login`, `register`, `logout`.

## Масштабируемость

Архитектура позволяет легко:
- Добавлять новые методы аутентификации
- Расширять типы данных
- Обрабатывать различные форматы ошибок
- Интегрировать дополнительные API endpoints

