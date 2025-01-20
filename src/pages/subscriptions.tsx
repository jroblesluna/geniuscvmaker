import { Button, Modal, ModalContent, ModalHeader, ModalFooter, ModalBody, Checkbox, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Selection, CheckboxGroup } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { CreditCard, Plan, Subscription, getDefaultPlan } from '../interfaces/culqi';
import SvgLoading from '../components/svgLoading';
import SvgLogo from '../components/svgLogo';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from '@firebase/firestore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { withProtected } from '../hook/route';

const benefits = {
    "genius-01": {
        main_benefit: 100,
        others: [
            "Create 5 CV from Scratch, or",
            "Craft structure of 6 CV, or",
            "Analyze and optimize up to 5 CV, or",
            "Spotlight up to 4 CV.",
        ],
    },
    "genius-02": {
        main_benefit: 500,
        others: [
            "Create 25 CV from Scratch, or",
            "Craft structure of 33 CV, or",
            "Analyze and optimize up to 25 CV, or",
            "Spotlight up to 20 CV.",
        ],
    },
    "genius-03": {
        main_benefit: 5000,
        others: [
            "Create 250 CV from Scratch, or",
            "Craft structure of 333 CV, or",
            "Analyze and optimize up to 250 CV, or",
            "Spotlight up to 200 CV.",
        ],
    }
}

const MySubscriptions = ({ auth }) => {
    const { user } = auth;
    const [isLoaded, setIsLoaded] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription>();
    const [selectedPlan, setSelectedPlan] = useState<Plan>(getDefaultPlan);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CreditCard | undefined>(undefined);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const router = useRouter(); // Initialize Next.js router

    useEffect(() => {
        fetch('/api/culqi', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                culqiMethod: "list.plans",
                culqiBody: {}
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Plans", data.data);
                setPlans(data.data);
            })
            .catch(error => console.error('Error al obtener la lista de planes:', error))
            .finally(() => setIsLoaded(true));
    }, []);

    async function lookupFavoriteCard() {
        console.log("lookupFavoriteCard");
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                return (userData["favoriteCard"] ?? '');
            } else {
                return "";
            }
        } catch (error) {
            return "";
        }
    };


    const fetchCards = async () => {
        try {
            const response = await fetch('/api/culqi', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: "list.cards",
                    culqiBody: {}
                }),
            });
            const data = await response.json();
            setCreditCards(data.data);
            let favoriteCardId = await lookupFavoriteCard();
            let favoriteCard = data.data.find(card => card.id === favoriteCardId);
            setSelectedCard(favoriteCard);
        } catch (error) {
            toast.error("Can't get Subscriptions Plans.");
        }
    };

    const fetchSubscription = async (culqiSubscriptionId: string) => {
        try {
            const response = await fetch('/api/culqi', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: "get.subscriptions",
                    culqiBody: {
                        "id": culqiSubscriptionId
                    }
                }),
            });
            const data = await response.json();
            console.log("fetchSubscription->data", data);
            if (data.status == 1) {
                setSubscription(data);
            }
            else {
                setSubscription(undefined);
            }
        } catch (error) {
            toast.error("Can't get Subscriptions Plans.");
        }
    };


    const fetchActiveSubscriptions = async () => {
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                console.log("userData.subscription", userData.subscription);
                await fetchSubscription(userData.subscription);
                return true;
            } else {
                console.log("The user document doesn't exist");
                return false;
            }
        } catch (error) {
            toast.error("Can't get Active Subscriptions.");
        }
    };




    useEffect(() => {
        fetchActiveSubscriptions();
        fetchCards();
    }, []);



    function handleSelectedCardChange(keys: Selection) {
        const keyString = Array.from(keys).join(', '); // Convert Set to array and join elements
        if (keyString === "new") {
            goPaymentMethods();
        }
        else {
            let newFavoriteCard = creditCards.find(card => card.id === keyString);
            setSelectedCard(newFavoriteCard);
        }
    }


    function renderDropdownItems() {
        const items = creditCards.map((card: CreditCard) => (
            <DropdownItem key={card.id} textValue={card.id} className='bg-gray-100'>
                <div className='flex flex-row items-center gap-2'><img
                    src={`/assets/svg/${card.source.iin.card_brand.toLowerCase()}.svg`}
                    alt={card.source.iin.card_brand}
                    className="h-10 rounded-md border-1" />{card.source.iin.card_brand} - {card.source.last_four}
                </div>
            </DropdownItem>
        ));
        items.push(<DropdownItem key="new" textValue='new' className='bg-gray-100 h-10 snap-center self-center text-center items-center'>Add a New Payment Method</DropdownItem>);
        return items;
    }

    const handleSubscribe = (planId: string) => {
        let selectedPlan = plans.find(plan => plan.id === planId);
        if (selectedPlan) {
            setSelectedPlan(selectedPlan);
            setIsInvalid(true);
            setIsSubscriptionModalOpen(true);
        }
        else {
            toast.error('Error selecting plan.');
        }
    }

    const handleSubscribeConfirm = async () => {
        try {
            setIsSubscribing(true);
            const response = await fetch('/api/culqi', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: "create.subscriptions",
                    culqiBody: {
                        card_id: selectedCard?.id,
                        plan_id: selectedPlan.id,
                        tyc: !{ isInvalid },
                        metadata: {
                            plan_name: selectedPlan.name,
                            plan_currency: selectedPlan.currency,
                            plan_amount: selectedPlan.amount,
                        }
                    }
                }),
            });
            const data = await response.json();
            if (data.id) {
                const firestore = getFirestore();
                const userDocRef = doc(firestore, "users", user.uid);
                await updateDoc(userDocRef, { subscription: data.id });
                toast.success(`Subscription was created: ${data.id}`);
                fetchActiveSubscriptions();
            } else {
                toast.error(data.merchant_message);
            }
        } catch (error) {
            console.error('Error creating subscription:', error.merchant_message);
        } finally {
            setIsSubscribing(false);
            setIsSubscriptionModalOpen(false);
        }
    };

    function goPaymentMethods() {
        router.push('/paymentMethods')
    }

    const handleCancelSubscription = async () => {
        console.log(subscription?.id);
        setIsCancelSubscriptionModalOpen(true);

    }
    const handleCancelSubscriptionConfirm = async () => {
        console.log(subscription?.id);
        let culqiSubscriptionId = subscription?.id;
        try {
            setIsCancellingSubscription(true);



            const response = await fetch('/api/culqi', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: "delete.subscriptions",
                    culqiBody: {
                        "id": culqiSubscriptionId
                    }
                }),
            });
            const data = await response.json();
            if (data.deleted) {
                toast.success("Subscription was successfully cancelled.");
            }
            else {
                toast.error(`Error: ${data.merchant_message}`);
            }


            console.log('Deleted Subscription:', data);
        } catch (error) {
            console.error('Error creating subscription:', error.merchant_message);
        } finally {
            setIsCancellingSubscription(false);
            setIsCancelSubscriptionModalOpen(false);
            fetchActiveSubscriptions();
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-center m-4">Subscription Plans</h1>
            {(subscription != undefined) ?
                <>
                    <h1 className="text-xl font-bold my-4 text-center">Active Subscriptions</h1>
                    <div className='flex justify-center'>
                        <div className='bg-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4 items-center justify-center max-w-fit' key={subscription.id}>
                            <div className='font-bold'>
                                {subscription.plan.name}<br />{subscription.plan.currency} {(subscription.plan.amount / 100).toFixed(2)}/month
                            </div>
                            <Button
                                color="danger"
                                size="lg"
                                onClick={() => handleCancelSubscription()}
                            >Cancel Subscription</Button>
                        </div>
                    </div>
                </>
                :
                <div className='text-justify m-4'>You have no current active subscriptions, choose a Plan and subscribe in order to get your Genius CV AI Tokens.</div>
            }

            {(!isLoaded) ?
                <div className="flex justify-center items-center relative">
                    <div className="absolute z-20 w-5">
                        <SvgLogo fillColor="#FF4F22" />
                    </div>
                    <div className="z-10 w-24">
                        <SvgLoading fillColor="#FF4F22" />
                    </div>
                </div> :
                <>
                    <div className='w-full flex justify-center mt-4'>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 max-w-fit ">
                            {plans && plans
                                .slice() // Copia para no modificar el estado original
                                .sort((a, b) => (a.short_name > b.short_name ? 1 : -1)) // Ordena por short_name
                                .map((plan: Plan) => (
                                    <div key={plan.id} className="bg-[#ffb29f] rounded-xl shadow p-4 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">{plan.name}</h2>
                                            <p className="text-gray-600 mb-2">{plan.description}</p>
                                            <p>You get: <b>{benefits[plan.short_name].main_benefit} Tokens/month</b></p>
                                            <div className='mt-4 ml-4'>
                                                <p>You can use tokens for:</p>
                                                <ul className="list-disc ml-4">
                                                    {benefits[plan.short_name] && (
                                                        <>
                                                            {benefits[plan.short_name].others.map((benefit: string, index: number) => (
                                                                <li key={index}>{benefit}</li>
                                                            ))}
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className=''>
                                                <Button className='appWhiteOnOrange w-full' onClick={() => handleSubscribe(plan.id)}>Subscribe for {plan.currency} {(plan.amount / 100).toFixed(2)}/month </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <Modal
                            isOpen={isCancelSubscriptionModalOpen}
                            onOpenChange={setIsCancelSubscriptionModalOpen}
                            placement='center'
                            backdrop='blur'
                            scrollBehavior='inside'
                        >
                            <ModalContent>
                                {(onCancelSubscriptionModalClose) => (
                                    <>
                                        <ModalHeader>Cancel Subscription</ModalHeader>
                                        <ModalBody>
                                            We're sorry to see you go!<br /><br />
                                            If you cancel your subscription, we will host your already generated CVs for 30 days for free. You can access and download them before they're deleted.<br /><br />
                                            Are you sure you want to cancel your subscription?
                                            <ModalFooter>
                                                <Button isDisabled={isCancellingSubscription} className="appWhiteOnBlack" onPress={onCancelSubscriptionModalClose}>
                                                    Keep Subscription
                                                </Button>
                                                <Button isLoading={isCancellingSubscription} className="appWhiteOnOrange" onPress={handleCancelSubscriptionConfirm}>
                                                    Confirm cancellation
                                                </Button>
                                            </ModalFooter>
                                        </ModalBody>
                                    </>
                                )}

                            </ModalContent>
                        </Modal>
                        <Modal
                            isOpen={isSubscriptionModalOpen}
                            onOpenChange={setIsSubscriptionModalOpen}
                            backdrop="blur"
                            scrollBehavior="inside">
                            <ModalContent>
                                {(onSubscriptionModalClose) => (
                                    <>
                                        <ModalHeader>Credit Card Details</ModalHeader>
                                        <ModalBody>
                                            <div className='flex flex-row items-center gap-4'>
                                                <div className='text-nowrap'>Payment Method</div>
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button className={`w-full justify-start ${(selectedCard == undefined) ? " text-red-600" : " text-gray-700"}`} startContent={(<img
                                                            src={`/assets/svg/${selectedCard?.source.iin.card_brand.toLowerCase()}.svg`}
                                                            alt={selectedCard?.source.iin.card_brand}
                                                            className="h-6" />)}>
                                                            {selectedCard ? `${selectedCard.source.iin.card_brand} - ${selectedCard.source.last_four}` : 'Select a Payment Method'}
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu
                                                        aria-label="Single selection example"
                                                        variant="flat"
                                                        disallowEmptySelection
                                                        selectionMode="single"
                                                        selectedKeys={selectedCard ? new Set([selectedCard.id]) : new Set([''])}
                                                        onSelectionChange={handleSelectedCardChange}>
                                                        {renderDropdownItems()}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                            <div>You will authorize a recurring monthly charge of <b>{selectedPlan?.currency} {(selectedPlan.amount / 100)}</b> for your <b>{selectedPlan.name}</b> subscription, which will issue not cumulative <b>{benefits[selectedPlan.short_name].main_benefit} Tokens</b> each month.</div>
                                            <CheckboxGroup
                                                isRequired
                                                description="Please confirm your acceptance of each acknowledgment.                                            "
                                                isInvalid={isInvalid}
                                                label="You need to agree to full Terms & Conditions."
                                                onValueChange={(value) => {
                                                    setIsInvalid(value.length < 1);
                                                }}>
                                                <Checkbox isInvalid={isInvalid} value="tyc">I agree to the full Terms & Conditions.</Checkbox>
                                            </CheckboxGroup>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button isDisabled={isSubscribing} className="appWhiteOnBlack" onPress={onSubscriptionModalClose}>
                                                Cancel
                                            </Button>
                                            <Button isLoading={isSubscribing} isDisabled={isInvalid || (selectedCard == undefined)} className="appWhiteOnOrange" onPress={handleSubscribeConfirm}>
                                                Subscribe
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </div>
                </>
            }
        </div>
    );
};

export default withProtected(MySubscriptions);

