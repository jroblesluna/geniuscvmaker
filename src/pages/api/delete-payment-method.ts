// pages/api/delete-payment-method.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { paymentMethodId } = req.body;

  if (!paymentMethodId) {
    return res.status(400).json({ error: 'El paymentMethodId es requerido' });
  }

  try {
    // Se desvincula el PaymentMethod del cliente
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    res.status(200).json({ paymentMethod });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
