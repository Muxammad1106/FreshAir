# UML Диаграммы

## Диаграмма классов - Основные модели

```mermaid
classDiagram
    class User {
        +String email
        +String role (CUSTOMER/INVESTOR)
        +DateTime verified_at
        +ForeignKey company
    }
    
    class CustomerProfile {
        +OneToOneField user
        +String phone
        +String address
    }
    
    class InvestorProfile {
        +OneToOneField user
        +String phone
        +Decimal budget_usd
    }
    
    class Room {
        +ForeignKey customer
        +String name
        +String room_type
        +Float area_m2
        +Float ceiling_height_m
        +Float volume_m3
    }
    
    class DeviceType {
        +String name
        +String device_category
        +Float coverage_area_m2
        +Boolean supports_cleaning
        +Boolean supports_humidifying
        +Boolean supports_aroma
        +Decimal min_investment_usd
        +Decimal max_investment_usd
        +Float investment_profit_percentage
    }
    
    class DeviceInstance {
        +ForeignKey device_type
        +ForeignKey room
        +ForeignKey customer
        +String status
        +String serial_number
        +Boolean is_power_on
    }
    
    class CustomerOrder {
        +ForeignKey customer
        +String status
        +Decimal total_cost
        +calculate_total_cost()
    }
    
    class Payment {
        +ForeignKey order
        +ForeignKey payment_card
        +String status
        +Decimal amount
        +DateTime paid_at
    }
    
    class Investment {
        +ForeignKey investor
        +ForeignKey device
        +String status
        +Decimal amount_usd
        +DateTime paid_at
    }
    
    class PaymentCard {
        +ForeignKey customer
        +String card_number_last4
        +String brand
        +Boolean is_default
    }
    
    User ||--o| CustomerProfile : has
    User ||--o| InvestorProfile : has
    User ||--o{ Room : owns
    User ||--o{ CustomerOrder : places
    User ||--o{ PaymentCard : has
    
    CustomerOrder ||--o{ Payment : has
    CustomerOrder }o--o{ DeviceInstance : contains
    CustomerOrder }o--o{ Room : contains
    
    DeviceInstance }o--|| DeviceType : is_type_of
    DeviceInstance }o--o| Room : installed_in
    
    Investment }o--|| DeviceInstance : invests_in
    Investment }o--|| User : investor
```

## Диаграмма последовательности - Создание заказа

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend API
    participant DB as Database
    participant Pay as Payment System
    
    C->>F: Создать заказ
    F->>B: POST /api/v1/core/customer/orders
    B->>DB: Создать CustomerOrder
    B->>DB: Создать OrderRoom
    B->>DB: Создать OrderRoomDeviceType
    DB-->>B: Order created
    B-->>F: Order data
    F-->>C: Показать заказ
    
    C->>F: Оплатить заказ
    F->>B: POST /api/v1/core/customer/orders/{id}/pay
    B->>DB: Получить заказ
    B->>DB: Создать Payment
    B->>DB: Обновить статус заказа на APPROVED
    B->>DB: Создать DeviceInstance для каждой комнаты
    B->>DB: Создать OrderDevice связи
    DB-->>B: Payment & Devices created
    B-->>F: Success response
    F-->>C: Заказ оплачен, устройства созданы
```

## Диаграмма последовательности - Инвестиция

```mermaid
sequenceDiagram
    participant I as Investor
    participant F as Frontend
    participant B as Backend API
    participant DB as Database
    
    I->>F: Просмотр доступных устройств
    F->>B: GET /api/v1/core/investor/devices/available
    B->>DB: Получить активные устройства
    DB-->>B: Device list
    B-->>F: Available devices
    F-->>I: Показать устройства
    
    I->>F: Создать инвестицию
    F->>B: POST /api/v1/core/investor/investments
    B->>DB: Создать Investment (PENDING)
    DB-->>B: Investment created
    B-->>F: Investment data
    F-->>I: Показать страницу оплаты
    
    I->>F: Подтвердить оплату
    F->>B: POST /api/v1/core/investor/investments/{id}/confirm-payment
    B->>DB: Обновить статус на PAID
    B->>DB: Установить paid_at
    DB-->>B: Investment updated
    B-->>F: Success
    F-->>I: Инвестиция активна
```

## Диаграмма состояний - Заказ клиента

```mermaid
stateDiagram-v2
    [*] --> PENDING: Создание заказа
    PENDING --> APPROVED: Оплата успешна
    PENDING --> CANCELLED: Отмена
    APPROVED --> INSTALLED: Установка устройств
    INSTALLED --> ACTIVE: Устройства активированы
    ACTIVE --> [*]
    CANCELLED --> [*]
```

## Диаграмма состояний - Устройство

```mermaid
stateDiagram-v2
    [*] --> ORDERED: Создание после оплаты
    ORDERED --> IN_TRANSIT: Отправка
    IN_TRANSIT --> INSTALLING: Доставка
    INSTALLING --> ACTIVE: Установка завершена
    ACTIVE --> DISABLED: Отключение
    ACTIVE --> MAINTENANCE: Обслуживание
    DISABLED --> ACTIVE: Включение
    MAINTENANCE --> ACTIVE: Обслуживание завершено
```

## Диаграмма компонентов

```mermaid
graph TB
    subgraph Frontend
        A[React App]
        B[MUI Components]
        C[Axios Client]
        D[React Router]
    end
    
    subgraph Backend
        E[Django Views]
        F[Serializers]
        G[Models]
        H[Admin]
    end
    
    subgraph Services
        I[PostgreSQL]
        J[Redis]
        K[Celery Worker]
    end
    
    A --> B
    A --> C
    A --> D
    C --> E
    E --> F
    F --> G
    G --> I
    E --> J
    K --> J
    K --> I
    H --> G
```

## Диаграмма развертывания

```mermaid
graph TB
    subgraph "Production Server"
        subgraph "Docker Network"
            FE[Frontend Container<br/>Nginx]
            BE[Backend Container<br/>Gunicorn]
            DB[(PostgreSQL Container)]
            RD[(Redis Container)]
            CW[Celery Worker]
            CB[Celery Beat]
        end
    end
    
    User[User Browser] -->|HTTPS| FE
    FE -->|HTTP| BE
    BE -->|SQL| DB
    BE -->|Cache| RD
    BE -->|Tasks| CW
    CB -->|Schedule| CW
    CW -->|Cache| RD
    CW -->|SQL| DB
```

## ER-диаграмма базы данных (основные таблицы)

```mermaid
erDiagram
    USER ||--o| CUSTOMER_PROFILE : has
    USER ||--o| INVESTOR_PROFILE : has
    USER ||--o{ ROOM : owns
    USER ||--o{ CUSTOMER_ORDER : places
    USER ||--o{ PAYMENT_CARD : has
    
    CUSTOMER_ORDER ||--o{ PAYMENT : has
    CUSTOMER_ORDER }o--o{ DEVICE_INSTANCE : contains
    CUSTOMER_ORDER }o--o{ ROOM : "order_rooms"
    
    DEVICE_INSTANCE }o--|| DEVICE_TYPE : "is_type_of"
    DEVICE_INSTANCE }o--o| ROOM : "installed_in"
    
    INVESTMENT }o--|| DEVICE_INSTANCE : "invests_in"
    INVESTMENT }o--|| USER : "investor"
    
    PAYMENT }o--|| PAYMENT_CARD : "uses"
    PAYMENT }o--|| CUSTOMER_ORDER : "for"
    
    USER {
        int id PK
        string email UK
        string role
        datetime verified_at
    }
    
    CUSTOMER_PROFILE {
        int id PK
        int user_id FK
        string phone
        string address
    }
    
    INVESTOR_PROFILE {
        int id PK
        int user_id FK
        decimal budget_usd
    }
    
    ROOM {
        int id PK
        int customer_id FK
        string name
        string room_type
        float area_m2
        float volume_m3
    }
    
    CUSTOMER_ORDER {
        int id PK
        int customer_id FK
        string status
        decimal total_cost
    }
    
    DEVICE_INSTANCE {
        int id PK
        int device_type_id FK
        int room_id FK
        int customer_id FK
        string status
        string serial_number
    }
    
    INVESTMENT {
        int id PK
        int investor_id FK
        int device_id FK
        string status
        decimal amount_usd
    }
```

## Примечания

Для визуализации этих диаграмм используйте:
- [Mermaid Live Editor](https://mermaid.live/)
- VS Code расширение "Markdown Preview Mermaid Support"
- GitHub/GitLab автоматически рендерят Mermaid диаграммы

