import type { PaymentAdapter, PaymentRequest, PaymentResult } from '@/lib/payments';

export class MockPaymentAdapter implements PaymentAdapter {
  name = 'mock';

  async charge(req: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `mock_${req.method}_${Date.now()}`;
    const completed = req.method === 'credit_card' || req.method === 'bank_transfer';
    return {
      transactionId,
      status: completed ? 'completed' : 'pending',
      amount: req.amount,
      currency: req.currency,
      paymentUrl: `/api/mock/payments/${transactionId}`,
      qrCode: req.method === 'promptpay' ? '/integrations/omise.svg' : undefined,
      raw: { mock: true, request: req, transactionId },
    };
  }

  async refund(transactionId: string) {
    return { success: true, refundId: `mock_refund_${transactionId}` };
  }

  async getStatus(transactionId: string): Promise<PaymentResult> {
    return { transactionId, status: 'completed', amount: 0, currency: 'THB', raw: { mock: true } };
  }

  async parseWebhook(body: any) {
    return {
      transactionId: body?.data?.id || body?.transactionId || `mock_webhook_${Date.now()}`,
      status: body?.data?.status || body?.status || 'successful',
      amount: Number(body?.data?.amount || body?.amount || 0) / (body?.data?.amount ? 100 : 1),
    };
  }
}
