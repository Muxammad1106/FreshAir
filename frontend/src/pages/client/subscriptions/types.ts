// ----------------------------------------------------------------------

export interface Subscription {
  id: number;
  order_id: number;
  order_number: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  monthly_amount_usd: number;
  start_date: string;
  next_payment_date: string;
  cancelled_at?: string;
  order: {
    id: number;
    status: string;
    rooms?: Array<{
      room: {
        name: string;
        room_type: string;
      };
      device_types: Array<{
        name: string;
      }>;
    }>;
  };
}

