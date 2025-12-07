// ----------------------------------------------------------------------

/**
 * Get color for device category
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
 * Get device category label in English
 */
export function getDeviceCategoryLabel(category: string): string {
  switch (category) {
    case 'PURIFIER':
      return 'Purifier';
    case 'HUMIDIFIER':
      return 'Humidifier';
    case 'AROMA':
      return 'Aromatizer';
    case 'COMBO':
      return 'Combo';
    default:
      return category;
  }
}

