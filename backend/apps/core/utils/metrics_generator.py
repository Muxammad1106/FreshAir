"""
Утилита для генерации метрик устройств.
Генерирует реалистичные метрики на основе типа устройства.
"""
import random
from django.utils import timezone
from datetime import timedelta
from core.models import DeviceInstance, DeviceMetric, DeviceType


def generate_metric_for_device(device: DeviceInstance, timestamp=None):
    """
    Генерирует одну метрику для устройства.
    
    Args:
        device: Экземпляр DeviceInstance
        timestamp: Время метрики (по умолчанию текущее время)
    
    Returns:
        DeviceMetric: Созданная метрика
    """
    if timestamp is None:
        timestamp = timezone.now()
    
    device_type = device.device_type
    metric_data = {
        'device': device,
        'timestamp': timestamp,
    }
    
    # Для очистителей воздуха
    if device_type.supports_cleaning:
        # PM2.5: 5-50 мкг/м³ (хороший воздух: 5-15, средний: 15-35, плохой: 35-50)
        # Если устройство включено, PM2.5 должен быть ниже
        if device.is_power_on:
            pm25_base = random.uniform(5, 20)  # Хороший воздух при работе
        else:
            pm25_base = random.uniform(20, 50)  # Плохой воздух без очистки
        
        metric_data['pm25'] = round(pm25_base, 1)
        
        # Объём очищенного воздуха (м³) - зависит от времени работы
        # Предполагаем, что устройство очищает ~50-200 м³/час
        if device.is_power_on:
            # Если устройство работает, генерируем объём очищенного воздуха
            # За последний час (если есть предыдущая метрика)
            cleaned_volume = random.uniform(50, 200)
            metric_data['cleaned_air_volume_m3'] = round(cleaned_volume, 1)
        else:
            metric_data['cleaned_air_volume_m3'] = 0.0
        
        # Износ фильтра: увеличивается со временем
        # Получаем последнюю метрику для расчёта износа
        last_metric = DeviceMetric.objects.filter(device=device).order_by('-timestamp').first()
        if last_metric and last_metric.filter_wear_percent is not None:
            # Увеличиваем износ на 0.1-0.5% за метрику (если устройство работает)
            wear_increase = random.uniform(0.1, 0.5) if device.is_power_on else 0.0
            filter_wear = min(100.0, last_metric.filter_wear_percent + wear_increase)
        else:
            # Начальный износ: 10-30%
            filter_wear = random.uniform(10, 30)
        
        metric_data['filter_wear_percent'] = round(filter_wear, 1)
    
    # Для увлажнителей
    if device_type.supports_humidifying:
        # Влажность: 30-70% (комфортный диапазон: 40-60%)
        if device.is_power_on:
            humidity_base = random.uniform(45, 65)  # Комфортная влажность при работе
        else:
            humidity_base = random.uniform(30, 50)  # Низкая влажность без работы
        
        metric_data['humidity'] = round(humidity_base, 1)
        
        # Уровень жидкости в баке: уменьшается со временем
        last_metric = DeviceMetric.objects.filter(device=device).order_by('-timestamp').first()
        if last_metric and last_metric.liquid_level_percent is not None:
            # Уменьшаем уровень на 0.5-2% за метрику (если устройство работает)
            level_decrease = random.uniform(0.5, 2.0) if device.is_power_on else 0.0
            liquid_level = max(0.0, last_metric.liquid_level_percent - level_decrease)
        else:
            # Начальный уровень: 80-100%
            liquid_level = random.uniform(80, 100)
        
        metric_data['liquid_level_percent'] = round(liquid_level, 1)
        
        # Для увлажнителей также может быть износ фильтра (если это комбо)
        if device_type.device_category == DeviceType.DEVICE_COMBO:
            # Если это комбо-устройство, износ фильтра уже установлен выше
            pass
        elif not device_type.supports_cleaning:
            # Для чистых увлажнителей тоже может быть фильтр
            last_metric = DeviceMetric.objects.filter(device=device).order_by('-timestamp').first()
            if last_metric and last_metric.filter_wear_percent is not None:
                wear_increase = random.uniform(0.05, 0.3) if device.is_power_on else 0.0
                filter_wear = min(100.0, last_metric.filter_wear_percent + wear_increase)
            else:
                filter_wear = random.uniform(10, 30)
            metric_data['filter_wear_percent'] = round(filter_wear, 1)
    
    # Для ароматизаторов (обычно в комбо)
    if device_type.supports_aroma:
        # Уровень жидкости для арома может быть отдельным или совпадать с увлажнителем
        # Если это комбо, уровень жидкости уже установлен выше
        pass
    
    metric = DeviceMetric.objects.create(**metric_data)
    return metric


def generate_metrics_for_device(device: DeviceInstance, days=7, interval_hours=1):
    """
    Генерирует метрики для устройства за указанный период.
    
    Args:
        device: Экземпляр DeviceInstance
        days: Количество дней для генерации
        interval_hours: Интервал между метриками в часах
    
    Returns:
        list: Список созданных метрик
    """
    now = timezone.now()
    start_time = now - timedelta(days=days)
    
    metrics = []
    current_time = start_time
    
    while current_time <= now:
        metric = generate_metric_for_device(device, current_time)
        metrics.append(metric)
        current_time += timedelta(hours=interval_hours)
    
    return metrics


def ensure_device_has_recent_metrics(device: DeviceInstance, hours_back=1):
    """
    Убеждается, что у устройства есть свежие метрики.
    Если последняя метрика старше hours_back часов, создаёт новую.
    
    Args:
        device: Экземпляр DeviceInstance
        hours_back: Количество часов назад, после которых нужно создать новую метрику
    """
    last_metric = DeviceMetric.objects.filter(device=device).order_by('-timestamp').first()
    
    if not last_metric:
        # Нет метрик вообще - создаём первую
        generate_metric_for_device(device)
        return
    
    # Проверяем, не устарела ли последняя метрика
    threshold = timezone.now() - timedelta(hours=hours_back)
    if last_metric.timestamp < threshold:
        # Создаём новую метрику
        generate_metric_for_device(device)

