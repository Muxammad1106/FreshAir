// ----------------------------------------------------------------------

export interface Investment {
  id: number;
  device: DeviceInstance;
  amount_usd: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paid_at: string | null;
  cleaned_air_m3: number;
  humidified_hours: number;
  projected_return_usd: string | null;
  projected_return_date: string | null;
  created_at: string;
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

export interface DeviceType {
  id: number;
  name: string;
  device_category: 'PURIFIER' | 'HUMIDIFIER' | 'AROMA' | 'COMBO';
  recommended_max_area_m2: number;
  recommended_max_volume_m3: number;
  power_watts: number;
  supports_cleaning: boolean;
  supports_humidifying: boolean;
  supports_aroma: boolean;
  price_usd?: string | number;
  min_investment_usd?: string | number;
  max_investment_usd?: string | number;
  investment_profit_percentage?: number;
  investment_period_months?: number;
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

export interface AvailableDevice extends DeviceInstance {
  min_investment_usd: string;
  max_investment_usd: string;
  short_projection: {
    projected_return_usd: string;
    period_months: number;
    profit_percentage?: number;
  };
}

export interface InvestorDashboard {
  total_invested_usd: string;
  active_devices_count: number;
  total_cleaned_air_m3: number;
  total_humidified_hours: number;
  projected_return_total_usd: string;
  projected_return_date: string | null;
}

export interface InvestmentAnalytics {
  total_invested: number;
  total_projected_return: number;
  total_profit: number;
  profit_percentage: number;
  investments: InvestmentAnalyticsItem[];
  chart_data: ChartDataPoint[];
}

export interface InvestmentAnalyticsItem {
  investment_id: number;
  amount_usd: number;
  projected_return_usd: number;
  profit_usd: number;
  profit_percentage: number;
  period_months: number;
  projected_date: string;
}

export interface ChartDataPoint {
  date: string;
  invested: number;
  projected: number;
  profit: number;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

