-- SQL script to manually add coverage_area_m2 column
-- Run this if migration doesn't work: psql -d your_database_name -f add_coverage_area_manually.sql

ALTER TABLE core_device_types 
ADD COLUMN IF NOT EXISTS coverage_area_m2 DOUBLE PRECISION;

COMMENT ON COLUMN core_device_types.coverage_area_m2 IS 'Площадь покрытия устройства в м²';

