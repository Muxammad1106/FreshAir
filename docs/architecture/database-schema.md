# Схема базы данных

## Обзор

База данных использует PostgreSQL и состоит из нескольких основных групп таблиц, связанных с различными модулями приложения.

## Основные таблицы

### Пользователи (users)

#### `user_users`
Основная таблица пользователей.

```sql
CREATE TABLE user_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(20), -- CUSTOMER | INVESTOR
    company_id BIGINT REFERENCES core_companies(id),
    verified_at TIMESTAMP,
    confirmation_code UUID UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `user_tokens`
Токены для аутентификации пользователей.

```sql
CREATE TABLE user_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    key VARCHAR(500) UNIQUE NOT NULL,
    refresh VARCHAR(255),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Профили (core)

#### `core_customer_profiles`
Профили клиентов.

```sql
CREATE TABLE core_customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES user_users(id) ON DELETE CASCADE,
    phone VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_investor_profiles`
Профили инвесторов.

```sql
CREATE TABLE core_investor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES user_users(id) ON DELETE CASCADE,
    phone VARCHAR(255),
    budget_usd DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Помещения и заказы

#### `core_rooms`
Помещения клиентов.

```sql
CREATE TABLE core_rooms (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(20) NOT NULL, -- HOME | COMMERCIAL | INDUSTRIAL
    area_m2 FLOAT NOT NULL,
    ceiling_height_m FLOAT,
    volume_m3 FLOAT, -- Автоматически рассчитывается
    address TEXT,
    city VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_customer_orders`
Заказы клиентов.

```sql
CREATE TABLE core_customer_orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES core_rooms(id) ON DELETE CASCADE, -- Для обратной совместимости
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | APPROVED | INSTALLED | ACTIVE | CANCELLED
    total_cost DECIMAL(12,2),
    comment TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_order_rooms`
Связь заказов с помещениями (Many-to-Many).

```sql
CREATE TABLE core_order_rooms (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES core_customer_orders(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES core_rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(order_id, room_id)
);
```

### Устройства

#### `core_device_types`
Типы устройств (каталог).

```sql
CREATE TABLE core_device_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_category VARCHAR(20), -- PURIFIER | HUMIDIFIER | AROMA | COMBO
    recommended_max_area_m2 FLOAT,
    recommended_max_volume_m3 FLOAT,
    coverage_area_m2 FLOAT,
    power_watts FLOAT,
    supports_cleaning BOOLEAN DEFAULT FALSE,
    supports_humidifying BOOLEAN DEFAULT FALSE,
    supports_aroma BOOLEAN DEFAULT FALSE,
    price_usd DECIMAL(10,2) DEFAULT 0.00,
    min_investment_usd DECIMAL(10,2) DEFAULT 100.00,
    max_investment_usd DECIMAL(10,2) DEFAULT 1000.00,
    investment_profit_percentage FLOAT DEFAULT 25.0,
    investment_period_months INTEGER DEFAULT 6,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_device_instances`
Экземпляры устройств.

```sql
CREATE TABLE core_device_instances (
    id BIGSERIAL PRIMARY KEY,
    device_type_id BIGINT REFERENCES core_device_types(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES core_rooms(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ORDERED', -- ORDERED | IN_TRANSIT | INSTALLING | ACTIVE | DISABLED | MAINTENANCE
    serial_number VARCHAR(255) UNIQUE,
    internal_code VARCHAR(255),
    is_power_on BOOLEAN DEFAULT TRUE,
    installation_date TIMESTAMP,
    last_service_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_order_devices`
Связь заказов с устройствами.

```sql
CREATE TABLE core_order_devices (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES core_customer_orders(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES core_device_instances(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(order_id, device_id)
);
```

#### `core_order_room_device_types`
Типы устройств для каждой комнаты в заказе.

```sql
CREATE TABLE core_order_room_device_types (
    id BIGSERIAL PRIMARY KEY,
    order_room_id BIGINT REFERENCES core_order_rooms(id) ON DELETE CASCADE,
    device_type_id BIGINT REFERENCES core_device_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(order_room_id, device_type_id)
);
```

#### `core_device_metrics`
Метрики устройств.

```sql
CREATE TABLE core_device_metrics (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES core_device_instances(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    pm25 FLOAT, -- Качество воздуха
    humidity FLOAT, -- Влажность %
    cleaned_air_volume_m3 FLOAT, -- Объем очищенного воздуха
    filter_wear_percent FLOAT, -- Износ фильтра %
    liquid_level_percent FLOAT, -- Уровень жидкости % (для увлажнителей)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_device_metrics_device_timestamp ON core_device_metrics(device_id, timestamp DESC);
```

### Платежи

#### `core_payment_cards`
Платежные карты клиентов.

```sql
CREATE TABLE core_payment_cards (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    card_number_last4 VARCHAR(4) NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    brand VARCHAR(50), -- VISA | Mastercard | UZCARD и т.д.
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_payments`
Платежи.

```sql
CREATE TABLE core_payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES core_customer_orders(id) ON DELETE CASCADE,
    investment_id BIGINT REFERENCES core_investments(id) ON DELETE CASCADE,
    payment_card_id BIGINT REFERENCES core_payment_cards(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | PAID | FAILED
    amount DECIMAL(12,2) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Инвестиции

#### `core_investments`
Инвестиции инвесторов.

```sql
CREATE TABLE core_investments (
    id BIGSERIAL PRIMARY KEY,
    investor_id BIGINT REFERENCES user_users(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES core_device_instances(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | PAID | COMPLETED
    amount_usd DECIMAL(12,2) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `core_investment_stat_snapshots`
Снапшоты статистики инвестиций.

```sql
CREATE TABLE core_investment_stat_snapshots (
    id BIGSERIAL PRIMARY KEY,
    investment_id BIGINT REFERENCES core_investments(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES core_device_instances(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    cumulative_cleaned_air_volume_m3 FLOAT DEFAULT 0.0,
    cumulative_humidity_hours FLOAT DEFAULT 0.0,
    projected_return_amount DECIMAL(12,2),
    projected_return_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_investment_snapshots_investment_timestamp ON core_investment_stat_snapshots(investment_id, timestamp DESC);
```

### Компании

#### `core_companies`
Компании.

```sql
CREATE TABLE core_companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Связи между таблицами

### Customer Flow
```
User (CUSTOMER)
  ├── CustomerProfile (1:1)
  ├── Room (1:N)
  │     └── DeviceInstance (N:1)
  ├── CustomerOrder (1:N)
  │     ├── OrderRoom (1:N)
  │     │     └── OrderRoomDeviceType (1:N)
  │     └── Payment (1:N)
  └── PaymentCard (1:N)
```

### Investor Flow
```
User (INVESTOR)
  ├── InvestorProfile (1:1)
  └── Investment (1:N)
        └── DeviceInstance (N:1)
              └── DeviceMetric (1:N)
        └── InvestmentStatSnapshot (1:N)
```

## Индексы

Основные индексы для оптимизации:

- `user_users.email` - UNIQUE
- `user_tokens.key` - UNIQUE
- `core_device_instances.serial_number` - UNIQUE
- `core_device_metrics(device_id, timestamp DESC)` - составной индекс
- `core_investment_stat_snapshots(investment_id, timestamp DESC)` - составной индекс
- Внешние ключи автоматически создают индексы

## Миграции

Миграции базы данных находятся в:
- `backend/apps/core/migrations/`
- `backend/apps/users/migrations/`

Применение миграций:
```bash
python manage.py migrate
```

