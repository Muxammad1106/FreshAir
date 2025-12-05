// ----------------------------------------------------------------------

export interface Order {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'INSTALLED' | 'ACTIVE' | 'CANCELLED';
  created_at: string;
  comment?: string;
  rooms?: OrderRoom[];
  devices?: OrderDevice[];
}

export interface OrderRoom {
  id: number;
  room: {
    id: number;
    name: string;
    room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
    area_m2: number;
    ceiling_height_m: number;
  };
  device_types: DeviceType[];
}

export interface OrderDevice {
  id: number;
  device_type: DeviceType;
  room: Room | null;
  status: string;
}

export interface DeviceType {
  id: number;
  name: string;
  device_category: 'PURIFIER' | 'HUMIDIFIER' | 'AROMA' | 'COMBO';
  recommended_max_area_m2?: number | null;
  recommended_max_volume_m3?: number | null;
  power_watts?: number | null;
  supports_cleaning?: boolean;
  supports_humidifying?: boolean;
  supports_aroma?: boolean;
  price_usd?: string | number;
}

export interface Room {
  id: number;
  name: string;
  room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
  area_m2: number;
  ceiling_height_m: number;
}

