export type CreatePaymentResponse =
  | {
      success: true;
      message?: string;
      data?: {
        payment_id?: string;
        qrDataUrl?: string | null;
        expires_at?: string | null;
      };
    }
  | {
      status?: string;
      message?: string;
      error?: string;
      data?: any;
    }
  | any;