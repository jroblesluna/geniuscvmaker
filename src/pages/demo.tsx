import React, { useEffect } from 'react';
import { withProtected } from '../hook/route';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { PaymentMethod } from '../interfaces/stripe';

function Demo() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_PK_KEY || '');

  const [customerId, setCustomerId] = useState('cus_RiiY5ZXxaH0CH9');
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [clientSecret, setClientSecret] = useState('');
  useEffect(() => {
    fetch(`/api/list-payment-methods?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => setCards(data.paymentMethods.data))
      .catch((err) => console.error(err));
  }, []);

  function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, currency: 'usd' }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: { card: elements?.getElement(CardElement)! },
      });

      if (result?.error) {
        toast.error(result.error.message || '');
      } else {
        if (result) {
          console.log(result);
          toast.success('Pago exitoso:', result.paymentIntent);
        }
      }

      setLoading(false);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 justify-end    ">
        <CardElement />
        <button
          type="submit"
          disabled={!stripe || loading}
          className="bg-blue-700 hover:opacity-80 text-white px-5 py-2"
        >
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
    );
  }

  function SetupForm() {
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
      if (clientSecret === '') {
        fetch(`/api/create-setup-intent?customerId=${customerId}`, {
          method: 'POST',
          body: JSON.stringify({}),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setClientSecret(data.setupIntent);
            setCustomerId(data.customerId);
          })
          .catch((error) => console.error('Error:', error));
      }
    }, [customerId]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || !clientSecret) {
        toast.error('Falta datos');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: 'Test User',
          },
        },
      });

      if (error) {
        toast.error('Error saving card');
        console.log('Error saving card', error.message);
      } else {
        toast.success('Card saved successfully');
        console.log('Card saved successfully:', setupIntent);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe}>
          Guardar Tarjeta
        </button>
      </form>
    );
  }
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 flex  items-center justify-center flex-col">
        <div className="text-3xl font-bold mb-4 mt-5">Demo</div>
        {/* <div className="w-1/2 shadow border p-5 min-h-[20vh]">
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div> */}
        <table className="border ">
          <thead className="border ">
            <tr className="border ">
              <th>Tipo de Tarjeta</th>
              <th>Número</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Visa (Aprobado)</td>
              <td>4242 4242 4242 4242</td>
              <td>Pago exitoso</td>
            </tr>
            <tr>
              <td>Visa (Requiere 3D Secure)</td>
              <td>4000 0025 0000 3155</td>
              <td>Simula autenticación SCA</td>
            </tr>
            <tr>
              <td>Mastercard</td>
              <td>5555 5555 5555 4444</td>
              <td>Pago exitoso</td>
            </tr>
            <tr>
              <td>American Express</td>
              <td>3782 822463 10005</td>
              <td>Formato de 15 dígitos</td>
            </tr>
            <tr>
              <td>Discover</td>
              <td>6011 1111 1111 1117</td>
              <td>Pago exitoso</td>
            </tr>
            <tr>
              <td>Tarjeta fallida</td>
              <td>4000 0000 0000 0002</td>
              <td>Pago rechazado</td>
            </tr>
          </tbody>
        </table>
        {/* <h1>ID:{customerId}</h1>
        <h1>ID:{clientSecret}</h1> */}
        {/* <div>
          <Elements stripe={stripePromise}>
            <h1>Guardar Tarjeta para Pagos Futuros</h1>
            <SetupForm />
          </Elements>
        </div> */}
        {/* <div>
          <h1>Tarjetas Guardadas</h1>
          {!cards || cards.length === 0 ? (
            <p>No hay tarjetas guardadas.</p>
          ) : (
            <ul>
              {cards.map((card) => (
                <li key={card.id}>
                  <p>Marca: {card.card.brand}</p>
                  <p>Final: **** {card.card.last4}</p>
                  <p>
                    Expira: {card.card.exp_month}/{card.card.exp_year}
                  </p>
                </li>
              ))}
              {JSON.stringify(cards)}
            </ul>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default withProtected(Demo);
