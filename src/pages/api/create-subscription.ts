import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { customerId, priceId, paymentMethodId } = req.body;

    if (!customerId || !priceId || !paymentMethodId) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('subscription.id:' + subscription.id);
    res.status(200).json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
