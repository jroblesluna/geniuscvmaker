import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener todos los planes (precios) activos
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'], // Expandir información del producto asociado
    });

    res.status(200).json({ plans: prices.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
