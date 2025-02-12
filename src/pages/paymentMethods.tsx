import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import {
  getFirestore,
  doc,
  getDoc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import { toast } from 'react-hot-toast';
import SvgCancel from '../components/svgCancel';
import { Contact, CreditCard } from '../interfaces/culqi';
import { PaymentMethod } from '../interfaces/stripe';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';
import { goSubscriptions } from '../utils/navigateRoutes';
import { capitalize, validateEmail } from '../utils/others';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';

const emptyContact = {
  name: '',
  number: '',
  expiry: '',
  security: '',
  email: '',
  errors: {
    name: '',
    number: '',
    expiry: '',
    security: '',
    email: '',
  },
};

function PaymentMethods({ auth }) {
  const { user } = auth;
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [contact, setContact] = useState<Contact>({ ...emptyContact });
  const [isLoading, setIsLoading] = useState(false);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_PK_KEY || '');

  const { name, number, expiry, security, email, errors } = contact;

  /*Stripe */
  // Need to be dinamic
  const [customerId, setCustomerId] = useState('');
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [clientSecret, setClientSecret] = useState('');

  const options = {
    locale: 'en' as StripeElementLocale,
  };
  useEffect(() => {
    callFirstime();
  }, []);

  const callFirstime = async () => {
    try {
      const res = await fetchUserProfile();
      await callPaymentMethods(res);
    } catch (error) {
      toast.error('Customer Id not found');
    }
  };

  const callPaymentMethods = async (customerId: string) => {
    fetch(`/api/list-payment-methods?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data.paymentMethods.data);
        setIsLoading(true);
      })
      .catch((err) => console.error(err));
  };

  async function fetchUserProfile() {
    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      console.log('userDocSnapshot', userDocSnapshot);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setCustomerId(userData.stripeCustomerId);

        return userData.stripeCustomerId;
      } else {
        console.log("The user document doesn't exist");
        return '';
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
  }

  // Input field onChange handler
  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleAddCard = () => {
    contact.name = user.displayName.toUpperCase();
    contact.email = user.email;

    setShowModal(true);
  };

  const handleModalClose = async () => {
    setContact({ ...emptyContact });
    setShowModal(false);
  };

  function SetupForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [cardComplete, setCardComplete] = useState(false);

    useEffect(() => {
      if (clientSecret === '' && customerId !== '') {
        fetch('/api/create-setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerId,
            email: '',
            name: '',
          }),
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

      if (!cardComplete) {
        toast.error('Please enter your card details.');
        return;
      }

      if (!stripe || !elements || !clientSecret) {
        toast.error('Falta datos');
        return;
      }

      const cardElement = elements.getElement(CardElement);

      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: name,
            email: email,
          },
        },
      });

      if (error) {
        toast.error('Error saving card');
        console.log('Error saving card', error.message);
      } else {
        toast.success('Card saved successfully');
        console.log('Card saved successfully:', setupIntent);
        callPaymentMethods(customerId);
        handleModalClose();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="min-h-[20vh] flex flex-col gap-5">
        <CardElement
          className="bg-[#E4E4E7] justify-center  h-10 p-2 flex flex-col border"
          onChange={(event) => {
            setCardComplete(event.complete);
          }}
        />
        <button
          type="submit"
          disabled={!stripe}
          className="w-full bg-blue-700 text-white hover:opacity-80 p-2 font-bold rounded-md"
        >
          Add Card
        </button>
      </form>
    );
  }

  async function handleRemoveCard(id: string): Promise<void> {
    try {
      const response = await fetch('/api/delete-payment-method', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error deleting card');
        console.error('Error deleting card:', errorData.error);
        // Aquí puedes mostrar un mensaje de error al usuario
        return;
      }
      toast.success('Card removed successfully');
      callPaymentMethods(customerId);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }
  return (
    <div className="container mx-auto px-6 flex flex-col justify-between min-h-[90vh]">
      <div className="flex flex-col">
        <div className="mb-5 flex  items-center justify-center ">
          <div className="text-3xl font-bold  mt-5">My Payment Methods</div>
        </div>
        {!isLoading ? (
          <div className="text-center flex flex-col items-center h-[50vh] justify-center  mx-auto  ">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : (
          <>
            <div className="w-full flex flex-col sm:flex-row justify-between gap-3 items-center">
              {!cards || cards.length === 0 ? (
                <div>You need to have at least one registered Card to buy a Subscription.</div>
              ) : (
                <div>View and manage the payment method s in your account.</div>
              )}
              <Button className="appWhiteOnBlue  w-full sm:w-60" onClick={handleAddCard}>
                Register New Card
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 justify-items-center  ">
              {!cards || cards.length === 0 ? (
                <div
                  className="bg-[#cdf3f9] cursor-pointer border-sky-300 hover:opacity-85 shadow-lg rounded-md px-4 py-4 w-full  border-2 min-h-[200px] flex flex-col items-center justify-center"
                  onClick={handleAddCard}
                >
                  <div className="flex flex-col items-center text-sky-500">
                    <span className="text-6xl">+</span>
                    <span>Register New Card</span>
                  </div>
                </div>
              ) : (
                <>
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-[#3d71f2] text-white hover:border-gray-500 shadow-lg rounded-md px-4 py-4 w-full  border-2 min-h-[200px] flex flex-col justify-between"
                    >
                      <div className="flex flex-cols-2 items-start">
                        <div className="w-full flex flex-row gap-1 justify-between">
                          <div className="flex flex-col  items-start">
                            <span className="text-md font-bold ">
                              {capitalize(card.card.brand)}
                            </span>
                            <img
                              src={`https://cdn-icons-png.flaticon.com/256/9334/9334627.png`}
                              alt={card.card.brand}
                              width={100}
                              className="h-16  w-fit bg-transparent "
                            />
                          </div>
                          <div className="flex flex-col  justify-start   items-end  ">
                            <Button
                              isIconOnly
                              className="text-red-500"
                              variant="light"
                              size="sm"
                              onClick={() => handleRemoveCard(card.id)}
                            >
                              <SvgCancel />
                            </Button>
                            <img
                              src={`/assets/svg/${card.card.brand.toLowerCase()}.svg`}
                              alt={card.card.brand}
                              width={65}
                              className="h-14 rounded-md "
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col py-2 font-bold">
                        <div>
                          <span>{card.billing_details.name}</span>
                        </div>
                        <div className="flex flex-row items-center  justify-between">
                          <span className=" ">{`**** **** **** ${card.card.last4}`}</span>
                          <span>{` ${card.card.exp_month}/${card.card.exp_year}`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {cards.length !== 0 && (
              <div className="mt-4 w-full flex justify-end mb-10 ">
                <Button
                  className="appBlackOnCitrine  w-full sm:w-60"
                  onClick={goSubscriptions}
                >
                  Buy Subscriptions
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleModalClose} backdrop="blur">
        <ModalContent>
          <div className="p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Add New Card</h2>
            <div className="grid grid-cols-1">
              <Input
                className="h-20"
                key="cardholderName"
                label="Card Holder Name"
                name="name"
                value={name}
                variant="flat"
                radius="none"
                size="sm"
                maxLength={50}
                onChange={handleChange}
                errorMessage={errors.name}
              />
              <Input
                className="h-20"
                key="cardholderEmail"
                label="Card Holder Email"
                name="email"
                value={email}
                variant="flat"
                radius="none"
                size="sm"
                maxLength={50}
                onChange={handleChange}
                errorMessage={errors.email}
              />

              <Elements stripe={stripePromise} options={options}>
                <SetupForm />
              </Elements>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default withProtected(PaymentMethods);
