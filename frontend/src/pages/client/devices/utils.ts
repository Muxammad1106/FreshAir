// ----------------------------------------------------------------------

/**
 * Получить цвет для категории устройства
 */
export function getDeviceCategoryColor(category: string): 'primary' | 'info' | 'secondary' | 'success' | 'default' {
  switch (category) {
    case 'PURIFIER':
      return 'primary';
    case 'HUMIDIFIER':
      return 'info';
    case 'AROMA':
      return 'secondary';
    case 'COMBO':
      return 'success';
    default:
      return 'default';
  }
}

/**
 * Получить русское название категории устройства
 */
export function getDeviceCategoryLabel(category: string): string {
  switch (category) {
    case 'PURIFIER':
      return 'Очиститель';
    case 'HUMIDIFIER':
      return 'Увлажнитель';
    case 'AROMA':
      return 'Ароматизатор';
    case 'COMBO':
      return 'Комбо';
    default:
      return category;
  }
}

