import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Selection,
  CheckboxGroup,
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { Subscription } from '../interfaces/culqi';
import SvgLoading from '../components/svgLoading';
import SvgLogo from '../components/svgLogo';
import { doc, getDoc, getFirestore, updateDoc } from '@firebase/firestore';
import toast from 'react-hot-toast';
import { withProtected } from '../hook/route';
import { goPaymentMethods } from '../utils/navigateRoutes';
import { PaymentMethod } from '@stripe/stripe-js';
import { getCurrencySymbol } from '../utils/others';
import { PlanStripe } from '../interfaces/stripe';

const benefits = {
  'genius-01': {
    main_benefit: 100,
    others: [
      'Create 5 CV from Scratch, or',
      'Craft structure of 6 CV, or',
      'Analyze and optimize up to 5 CV, or',
      'Spotlight up to 4 CV.',
    ],
  },
  'genius-02': {
    main_benefit: 500,
    others: [
      'Create 25 CV from Scratch, or',
      'Craft structure of 33 CV, or',
      'Analyze and optimize up to 25 CV, or',
      'Spotlight up to 20 CV.',
    ],
  },
  'genius-03': {
    main_benefit: 5000,
    others: [
      'Create 250 CV from Scratch, or',
      'Craft structure of 333 CV, or',
      'Analyze and optimize up to 250 CV, or',
      'Spotlight up to 200 CV.',
    ],
  },
};

const MySubscriptions = ({ auth }) => {
  const { user } = auth;
  // status control
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // stripe
  const [planActiveName, setPlanActiveName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [plansStripe, setPlansStrip] = useState<PlanStripe[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<PlanStripe | undefined>(undefined);
  const [subscription, setSubscription] = useState<Subscription>();

  useEffect(() => {
    callFirstime();
  }, []);

  // initial data loading
  const callFirstime = async () => {
    try {
      setIsLoading(true);
      const res = await fetchUserProfile();
      await callPaymentMethods(res);
      await fetchActiveSubscriptions();
      await callPlanSubcription();
    } catch (error) {
      toast.error('Customer Id not found');
    } finally {
      setIsLoading(false);
    }
  };

  // Call for subscription plans
  const callPlanSubcription = async () => {
    fetch('/api/get-plans')
      .then((res) => res.json())
      .then((data) => {
        setPlansStrip(data.plans);
      })
      .catch((error) => console.error('Error al obtener planes:', error));
  };
  // Call for user Payment Methods
  const callPaymentMethods = async (customerId: string) => {
    fetch(`/api/list-payment-methods?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data.paymentMethods.data);
        let a = [];
        if (data.paymentMethods.data.length !== 0) {
          setSelectedCard(data.paymentMethods.data[0]);
        } else {
          setSelectedCard(undefined);
        }
      })
      .catch((err) => console.error(err));
  };
  // get customer ID of the user
  async function fetchUserProfile() {
    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
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
  // Gets if there is an active subscription
  const fetchActiveSubscriptions = async () => {
    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        console.log("The user document doesn't exist");
        return false;
      }

      const userData = userDocSnapshot.data();

      if (!userData.subscription) {
        return false;
      }

      await fetchSubscription(userData.subscription);
      return true;
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      toast.error("Can't get Active Subscriptions.");
      return false;
    }
  };
  // Gets the subscription data
  const fetchSubscription = async (subscriptionId: string) => {
    try {
      const res = await fetch('/api/get-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error('Error al obtener los planes de suscripción');
        setSubscription(undefined);
        return;
      }

      setPlanActiveName(data.productName || 'Plan desconocido');
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('No se pudo obtener los planes de suscripción.');
    }
  };

  // payment card selection
  function handleSelectedCardChange(keys: Selection) {
    const keyString = Array.from(keys).join(', ');
    if (keyString === 'new') {
      goPaymentMethods();
    } else {
      let newFavoriteCard = cards.find((card) => card.id === keyString);
      setSelectedCard(newFavoriteCard);
    }
  }
  // groups payment cards
  function renderDropdownItems() {
    const items = cards.map((card: PaymentMethod) => (
      <DropdownItem key={card.id} textValue={card.metadata.name} className="bg-gray-100">
        <div className="flex flex-row items-center gap-2">
          <img
            src={`/assets/svg/${card.card?.brand.toLowerCase()}.svg`}
            alt={card.card?.brand}
            width={35}
            className="h-10 rounded-md border-1"
          />
          {card.card?.brand} **** **** **** {card.card?.last4}
        </div>
      </DropdownItem>
    ));
    items.push(
      <DropdownItem
        key="new"
        textValue="new"
        className="bg-gray-100 h-10 snap-center self-center text-center items-center"
      >
        Add a New Payment Method
      </DropdownItem>
    );
    return items;
  }
  // Control the chosen payment card
  const handleSubscribe = (planId: string) => {
    let selectedPlan = plansStripe.find((plan) => plan.id === planId);
    if (selectedPlan) {
      setSelectedPlan(selectedPlan);
      setIsInvalid(true);
      setIsSubscriptionModalOpen(true);
    } else {
      toast.error('Error selecting plan.');
    }
  };
  // make the payment and subscription
  const handleSubscribeConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          priceId: selectedPlan?.id,
          paymentMethodId: selectedCard?.id,
        }),
      });

      const data = await res.json();

      if (data.subscriptionId) {
        const addTokens =
          benefits[selectedPlan?.product.metadata.short_name || ''].main_benefit;

        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        const currentTokens = docSnap.data()?.tokens || 0;
        const newTokens = currentTokens + addTokens;
        await updateDoc(userDocRef, {
          subscription: data.subscriptionId,
          tokens: newTokens,
        });
        toast.success(`Subscription was created: ${data.subscriptionId}`);
      } else {
        toast.error(data.merchant_message || 'Error al generar la suscripción');
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error?.merchant_message || error);
      toast.error('Ocurrió un error al procesar la suscripción');
    } finally {
      await fetchActiveSubscriptions();
      setIsSubscribing(false);
      setIsSubscriptionModalOpen(false);
      setIsLoading(false);
    }
  };

  const handleUpgradeSubscribeConfirm = async () => {
    setIsLoading(true);
    try {
      const resCancel = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription?.id }),
      });

      const dataCancel = await resCancel.json();

      if (dataCancel.success) {
        setIsLoading(true);
        setSubscription(undefined);
        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { subscription: '' });
        console.log('Suscripción cancelada:', dataCancel);
      } else {
        toast.error('Error cancelling subscription');
        console.error('Error:', dataCancel.error);
      }

      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          priceId: selectedPlan?.id,
          paymentMethodId: selectedCard?.id,
        }),
      });

      const data = await res.json();

      if (data.subscriptionId) {
        const addTokens =
          benefits[selectedPlan?.product.metadata.short_name || ''].main_benefit;

        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        const currentTokens = docSnap.data()?.tokens || 0;
        const newTokens = currentTokens + addTokens;
        await updateDoc(userDocRef, {
          subscription: data.subscriptionId,
          tokens: newTokens,
        });
        toast.success(`Subscription was Update: ${data.subscriptionId}`);
      } else {
        toast.error(data.merchant_message || 'Error al generar la suscripción');
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error?.merchant_message || error);
      toast.error('Ocurrió un error al procesar la suscripción');
    } finally {
      await fetchActiveSubscriptions();
      setIsSubscribing(false);
      setIsSubscriptionModalOpen(false);
      setIsLoading(false);
    }
  };
  // close de modal
  const handleCancelSubscription = async () => {
    setIsCancelSubscriptionModalOpen(true);
  };
  //make the delete of the subscription
  const handleCancelSubscriptionConfirm = async () => {
    setIsCancellingSubscription(true);

    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription?.id }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLoading(true);
        setSubscription(undefined);
        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { subscription: '' });
        toast.success('Subscription was deleted');
        console.log('Suscripción cancelada:', data);
      } else {
        toast.error('Error cancelling subscription');
        console.error('Error:', data.error);
      }
    } catch (error) {
      toast.error('Error deleting subscription');
      console.error('Error deleting subscription:', error?.merchant_message || error);
    } finally {
      await fetchActiveSubscriptions();
      setIsCancellingSubscription(false);
      setIsCancelSubscriptionModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8 flex  items-center justify-center">
        <div className="text-3xl font-bold mb-3 mt-5">Subscription Plans</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center relative">
          <div className="absolute z-20 w-5">
            <SvgLogo fillColor="#FF4F22" />
          </div>
          <div className="z-10 w-24">
            <SvgLoading fillColor="#FF4F22" />
          </div>
        </div>
      ) : (
        <>
          {subscription != undefined ? (
            <>
              <div className=" justify-start  -mt-10 w-full flex flex-col ">
                <div
                  className="    px-4  w-[90vw] flex md:flex-row  flex-col gap-4 items-center justify-between  mx-auto "
                  key={subscription.id}
                >
                  <div className="font-bold text-black flex flex-col gap-2">
                    <p className="text-xl font-bold md:text-start text-center text-orange-500">
                      Active Subscription
                    </p>
                    <p className="">{`${planActiveName} -  ${getCurrencySymbol(
                      subscription.plan.currency
                    )}  ${(subscription.plan.amount / 100).toFixed(2)}/month`}</p>
                  </div>
                  <Button
                    onClick={() => handleCancelSubscription()}
                    className="bg-red-600 text-white font-bold py-2 rounded-md"
                  >
                    Cancel Subscription
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-[90vw]  mx-auto mt-5">
                  {plansStripe &&
                    plansStripe
                      .slice()
                      .sort((a, b) =>
                        a.product.metadata.short_name > b.product.metadata.short_name ? 1 : -1
                      )
                      .map((plan: PlanStripe) => (
                        <div
                          key={plan.id}
                          className="bg-[#ffffff] rounded-xl shadow p-10 border  flex flex-col justify-between"
                        >
                          <div>
                            <h2 className="text-xl font-bold">{plan.product.name}</h2>
                            <p className="text-gray-600 mb-2">{plan.product.description}</p>
                            <p>
                              You get:{' '}
                              <b>
                                {benefits[plan.product.metadata.short_name].main_benefit}{' '}
                                Tokens/month
                              </b>
                            </p>
                            <div className="mt-4 ml-4">
                              <p>You can use tokens for:</p>
                              <ul className="list-disc  ml-0: sm:ml-4">
                                {benefits[plan.product.metadata.short_name] && (
                                  <>
                                    {benefits[plan.product.metadata.short_name].others.map(
                                      (benefit: string, index: number) => (
                                        <li key={index}>{benefit}</li>
                                      )
                                    )}
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="">
                              <Button
                                className={
                                  ' w-full ' +
                                  (plan.product.name === planActiveName
                                    ? 'bg-gray-500 cursor-not-allowed pointer-events-none font-bold text-white '
                                    : 'appWhiteOnOrange ')
                                }
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={plan.product.name === planActiveName}
                              >
                                Change your plan for {getCurrencySymbol(plan.currency)}{' '}
                                {(plan.unit_amount / 100).toFixed(2)}
                                /month
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
                <Modal
                  isOpen={isSubscriptionModalOpen}
                  onOpenChange={setIsSubscriptionModalOpen}
                  backdrop="blur"
                  scrollBehavior="inside"
                >
                  <ModalContent>
                    {(onSubscriptionModalClose) => (
                      <>
                        <ModalHeader className="mt-5 flex  justify-center">
                          Credit Card Details
                        </ModalHeader>
                        <ModalBody className="min-h-[37vh] flex flex-col justify-center">
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-nowrap">Payment Method</div>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`w-full justify-start ${
                                    selectedCard == undefined ? ' text-red-600' : ' text-black'
                                  }`}
                                  startContent={
                                    <img
                                      src={`/assets/svg/${selectedCard?.card?.brand.toLowerCase()}.svg`}
                                      alt={selectedCard?.card?.brand}
                                      className="h-6"
                                    />
                                  }
                                >
                                  {selectedCard
                                    ? `${selectedCard?.card?.brand} **** **** **** ${selectedCard?.card?.last4}`
                                    : 'Select a Payment Method'}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Single selection example"
                                variant="flat"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={
                                  selectedCard ? new Set([selectedCard.id]) : new Set([''])
                                }
                                onSelectionChange={handleSelectedCardChange}
                              >
                                {renderDropdownItems()}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                          <div className="mt-2">
                            You will authorize a recurring monthly charge of
                            <b>
                              {` ${getCurrencySymbol(selectedPlan?.currency)}${
                                (selectedPlan?.unit_amount || 1) / 100
                              } `}
                            </b>
                            for your <b>{selectedPlan?.product.name}</b> subscription, which
                            will issue not cumulative
                            <b>
                              {selectedPlan
                                ? ' ' +
                                  benefits[selectedPlan.product.metadata.short_name]
                                    .main_benefit +
                                  ' '
                                : ''}
                            </b>
                            Tokens each month.
                          </div>
                          <CheckboxGroup
                            isRequired
                            description="Please confirm your acceptance of each acknowledgment.                                            "
                            className="text-black"
                            label="You need to agree to full Terms & Conditions."
                            onValueChange={(value) => {
                              setIsInvalid(value.length < 1);
                            }}
                          >
                            <Checkbox isInvalid={isInvalid}>
                              I agree to the full Terms & Conditions.
                            </Checkbox>
                          </CheckboxGroup>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            isDisabled={isSubscribing}
                            className="appWhiteOnBlack"
                            onPress={onSubscriptionModalClose}
                          >
                            Cancel
                          </Button>
                          <Button
                            isLoading={isSubscribing}
                            isDisabled={isInvalid || selectedCard == undefined}
                            className="appWhiteOnOrange"
                            onPress={handleUpgradeSubscribeConfirm}
                          >
                            Subscribe
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </>
          ) : (
            <div className="flex w-fit mx-auto">
              <div className="w-full flex flex-col justify-center  ">
                {subscription == undefined && (
                  <div className=" items-center justify-center text-justify m-4 ">
                    You have no current active subscriptions, choose a Plan and subscribe in
                    order to get your Genius CV AI Tokens.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 max-w-fit ">
                  {plansStripe &&
                    plansStripe
                      .slice()
                      .sort((a, b) =>
                        a.product.metadata.short_name > b.product.metadata.short_name ? 1 : -1
                      )
                      .map((plan: PlanStripe) => (
                        <div
                          key={plan.id}
                          className="bg-[#ffffff] rounded-xl shadow p-10 border  flex flex-col justify-between"
                        >
                          <div>
                            <h2 className="text-xl font-bold">{plan.product.name}</h2>
                            <p className="text-gray-600 mb-2">{plan.product.description}</p>
                            <p>
                              You get:{' '}
                              <b>
                                {benefits[plan.product.metadata.short_name].main_benefit}{' '}
                                Tokens/month
                              </b>
                            </p>
                            <div className="mt-4 ml-4">
                              <p>You can use tokens for:</p>
                              <ul className="list-disc  ml-0: sm:ml-4">
                                {benefits[plan.product.metadata.short_name] && (
                                  <>
                                    {benefits[plan.product.metadata.short_name].others.map(
                                      (benefit: string, index: number) => (
                                        <li key={index}>{benefit}</li>
                                      )
                                    )}
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="">
                              <Button
                                className="appWhiteOnOrange w-full"
                                onClick={() => handleSubscribe(plan.id)}
                              >
                                Subscribe for {getCurrencySymbol(plan.currency)}{' '}
                                {(plan.unit_amount / 100).toFixed(2)}
                                /month
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>

                <Modal
                  isOpen={isSubscriptionModalOpen}
                  onOpenChange={setIsSubscriptionModalOpen}
                  backdrop="blur"
                  scrollBehavior="inside"
                >
                  <ModalContent>
                    {(onSubscriptionModalClose) => (
                      <>
                        <ModalHeader className="mt-5 flex  justify-center">
                          Credit Card Details
                        </ModalHeader>
                        <ModalBody className="min-h-[37vh] flex flex-col justify-center">
                          <div className="flex flex-row items-center gap-2">
                            <div className="text-nowrap">Payment Method</div>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className={`w-full justify-start ${
                                    selectedCard == undefined ? ' text-red-600' : ' text-black'
                                  }`}
                                  startContent={
                                    <img
                                      src={`/assets/svg/${selectedCard?.card?.brand.toLowerCase()}.svg`}
                                      alt={selectedCard?.card?.brand}
                                      className="h-6"
                                    />
                                  }
                                >
                                  {selectedCard
                                    ? `${selectedCard?.card?.brand} **** **** **** ${selectedCard?.card?.last4}`
                                    : 'Select a Payment Method'}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Single selection example"
                                variant="flat"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={
                                  selectedCard ? new Set([selectedCard.id]) : new Set([''])
                                }
                                onSelectionChange={handleSelectedCardChange}
                              >
                                {renderDropdownItems()}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                          <div className="mt-2">
                            You will authorize a recurring monthly charge of
                            <b>
                              {` ${getCurrencySymbol(selectedPlan?.currency)}${
                                (selectedPlan?.unit_amount || 1) / 100
                              } `}
                            </b>
                            for your <b>{selectedPlan?.product.name}</b> subscription, which
                            will issue not cumulative
                            <b>
                              {selectedPlan
                                ? ' ' +
                                  benefits[selectedPlan.product.metadata.short_name]
                                    .main_benefit +
                                  ' '
                                : ''}
                            </b>
                            Tokens each month.
                          </div>
                          <CheckboxGroup
                            isRequired
                            description="Please confirm your acceptance of each acknowledgment.                                            "
                            className="text-black"
                            label="You need to agree to full Terms & Conditions."
                            onValueChange={(value) => {
                              setIsInvalid(value.length < 1);
                            }}
                          >
                            <Checkbox isInvalid={isInvalid}>
                              I agree to the full Terms & Conditions.
                            </Checkbox>
                          </CheckboxGroup>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            isDisabled={isSubscribing}
                            className="appWhiteOnBlack"
                            onPress={onSubscriptionModalClose}
                          >
                            Cancel
                          </Button>
                          <Button
                            isLoading={isSubscribing}
                            isDisabled={isInvalid || selectedCard == undefined}
                            className="appWhiteOnOrange"
                            onPress={handleSubscribeConfirm}
                          >
                            Subscribe
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </div>
          )}
        </>
      )}
      <Modal
        isOpen={isCancelSubscriptionModalOpen}
        onOpenChange={setIsCancelSubscriptionModalOpen}
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onCancelSubscriptionModalClose) => (
            <>
              <ModalHeader>Cancel Subscription</ModalHeader>
              <ModalBody>
                We're sorry to see you go!
                <br />
                <br />
                If you cancel your subscription, we will host your already generated CVs for 30
                days for free. You can access and download them before they're deleted.
                <br />
                <br />
                Are you sure you want to cancel your subscription?
                <ModalFooter>
                  <Button
                    isDisabled={isCancellingSubscription}
                    className="appWhiteOnBlack"
                    onPress={onCancelSubscriptionModalClose}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    isLoading={isCancellingSubscription}
                    className="appWhiteOnOrange"
                    onPress={handleCancelSubscriptionConfirm}
                  >
                    Confirm cancellation
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default withProtected(MySubscriptions);
