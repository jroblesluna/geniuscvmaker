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
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'El ID de la suscripción es requerido' });
    }

    // Cancelar la suscripción inmediatamente
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    res.status(200).json({ success: true, subscription: canceledSubscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
