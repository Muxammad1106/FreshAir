-- SQL скрипт для добавления поля price_usd в таблицу core_device_types
-- Выполните этот скрипт в вашей базе данных, если миграция не применяется автоматически

ALTER TABLE core_device_types 
ADD COLUMN price_usd NUMERIC(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN core_device_types.price_usd IS 'Цена устройства в USD';

