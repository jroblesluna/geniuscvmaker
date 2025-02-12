// pages/api/create-setup-intent.ts
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
    const { customerId, email, name } = req.body;

    let aux_customerId = customerId;

    if (!aux_customerId || typeof aux_customerId !== 'string') {
      return res.status(400).json({ error: 'El parámetro customerId es requerido' });
    }

    let setupIntent;
    if (aux_customerId == 'none') {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });

      setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        usage: 'off_session',
      });
      aux_customerId = customer.id;
    } else {
      setupIntent = await stripe.setupIntents.create({
        customer: aux_customerId,
        usage: 'off_session',
      });
    }

    res
      .status(200)
      .json({ setupIntent: setupIntent.client_secret, customerId: aux_customerId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
