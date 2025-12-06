// ----------------------------------------------------------------------

export type PaymentMethodType = 'UZCARD' | 'VISA';

export interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  last4: string; // Последние 4 цифры карты
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  created_at: string;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  UZCARD: 'Uzcard',
  VISA: 'Visa',
};

export function getPaymentMethodLabel(type: PaymentMethodType): string {
  return PAYMENT_METHOD_LABELS[type] || type;
}

// ----------------------------------------------------------------------

export type TransactionType = 'PAYMENT' | 'REFUND' | 'SUBSCRIPTION';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: number;
  type: TransactionType;
  status: TransactionStatus;
  amount_usd: number;
  description: string;
  payment_method?: {
    type: PaymentMethodType;
    last4: string;
  };
  order_id?: number;
  created_at: string;
}

