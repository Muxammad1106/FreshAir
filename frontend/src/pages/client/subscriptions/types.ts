// ----------------------------------------------------------------------

export interface Subscription {
  id: number;
  order_id: number;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  monthly_amount_usd: number;
  start_date: string;
  next_payment_date: string;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    status: string;
    created_at: string;
    comment?: string | null;
    rooms?: Array<{
      id: number;
      room: {
        id: number;
        name: string;
        room_type: 'HOME' | 'COMMERCIAL' | 'INDUSTRIAL';
        area_m2: number;
        ceiling_height_m: number;
      };
      device_types: Array<{
        id: number;
        name: string;
        device_category: string;
      }>;
    }>;
  };
}

