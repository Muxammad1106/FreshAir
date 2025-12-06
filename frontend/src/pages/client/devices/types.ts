// ----------------------------------------------------------------------

export interface DeviceType {
  id: number;
  name: string;
  device_category: 'PURIFIER' | 'HUMIDIFIER' | 'AROMA' | 'COMBO';
  recommended_max_area_m2: number;
  recommended_max_volume_m3: number;
  coverage_area_m2?: number;
  power_watts: number;
  supports_cleaning: boolean;
  supports_humidifying: boolean;
  supports_aroma: boolean;
  price_usd?: string | number;
}

export interface Room {
  id: number;
  name: string;
  room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
  area_m2: number;
  ceiling_height_m: number;
  volume_m3: number;
  address: string;
  city: string;
  notes?: string;
  created_at: string;
}

export interface DeviceMetric {
  id: number;
  device: number;
  timestamp: string;
  pm25?: number;
  humidity?: number;
  cleaned_air_volume_m3?: number;
  filter_wear_percent?: number;
  liquid_level_percent?: number;
}

export interface DeviceInstance {
  id: number;
  device_type: DeviceType;
  room: Room | null;
  status: string;
  serial_number: string;
  internal_code: string;
  is_power_on: boolean;
  last_metric: DeviceMetric | null;
  installation_date: string;
  last_service_date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

