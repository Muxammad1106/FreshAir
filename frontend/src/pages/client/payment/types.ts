// ----------------------------------------------------------------------

export type PaymentMethodType = 'UZCARD' | 'VISA' | 'Mastercard' | 'American Express' | 'Unknown';

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  last4: string; // Last 4 digits of card
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  brand?: string;
  created_at: string;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  UZCARD: 'Uzcard',
  VISA: 'Visa',
  Mastercard: 'Mastercard',
  'American Express': 'American Express',
  Unknown: 'Card',
};

export function getPaymentMethodLabel(type: PaymentMethodType | string): string {
  return PAYMENT_METHOD_LABELS[type as PaymentMethodType] || type || 'Card';
}

// ----------------------------------------------------------------------

export type TransactionType = 'PAYMENT' | 'REFUND' | 'SUBSCRIPTION';
export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'COMPLETED';

export interface Transaction {
  id: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  amount_usd?: number; // For backward compatibility
  description?: string;
  payment_card?: {
    brand?: string;
    card_number_last4: string;
  };
  payment_method?: {
    type: PaymentMethodType;
    last4: string;
  };
  order_id?: number;
  order?: {
    id: number;
  };
  created_at: string;
  paid_at?: string;
}

// ----------------------------------------------------------------------

export interface PaymentAnalyticsData {
  total_paid: number;
  total_payments: number;
  recent_30_days: {
    total: number;
    count: number;
  };
  recent_7_days: {
    total: number;
    count: number;
  };
  chart_data?: Array<{
    date: string;
    amount: number;
  }>;
}

