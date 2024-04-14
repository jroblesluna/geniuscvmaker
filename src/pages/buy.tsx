import { Button, Modal, ModalContent, ModalHeader, ModalFooter, ModalBody, Checkbox, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Selection, CheckboxGroup } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { CreditCard, Plan, getDefaultPlan } from '../interfaces/culqi';
import SvgLoading from '../components/svgLoading';
import SvgLogo from '../components/svgLogo';
import { withProtected } from '../hook/route';
import { doc, getDoc, getFirestore } from '@firebase/firestore';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

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

const Buy = ({ auth }) => {
    const { user } = auth;
    const [isLoaded, setIsLoaded] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan>(getDefaultPlan);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        saveCard: false
    });

    const [selectedCard, setSelectedCard] = useState<CreditCard | undefined>(undefined);

    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

    const [isSubscribing, setIsSubscribing] = useState(false);

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
            .then(data => setPlans(data.data))
            .catch(error => console.error('Error al obtener la lista de planes:', error))
            .finally(() => setIsLoaded(true));
    }, []);

    async function lookupFavoriteCard() {
        console.log("lookupFavoriteCard");
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            console.log("userDocSnapshot is: ", userDocSnapshot);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                console.log("favoriteCard", userData["favoriteCard"]);
                return (userData["favoriteCard"] ?? '');
            } else {
                console.log("The user document doesn't exist");
                return "";
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
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
            console.log("Pre-Analyzing");
            console.log(data);
            setCreditCards(data.data);
            console.log("Querying Favorite");
            let favoriteCardId = await lookupFavoriteCard();
            console.log("Found favoriteCardId:", favoriteCardId)
            let favoriteCard = data.data.find(card => card.id === favoriteCardId);
            setSelectedCard(favoriteCard);
        } catch (error) {
            console.error('Error fetching credit cards:', error);
        }
    };


    useEffect(() => {
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
            setIsOpen(true);
        }
        else {
            toast.error('Error selecting plan.');
        }
    }

    const handleFormSubmit = async () => {
        try {
            setIsSubscribing(true);

/*
            fetch('/api/culqi', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: "create.subscriptions",
                    culqiBody: {}
                }),
            })
                .then(response => response.json())
                .then(data => setPlans(data.data))
                .catch(error => console.error('Error al obtener la lista de planes:', error))
                .finally(() => setIsLoaded(true));

*/
            setIsSubscribing(false);
            setIsOpen(false);
        } catch (error) {
            console.error('Error creating subscription:', error.merchant_message);
        }
    };


    function goPaymentMethods() {
        router.push('/paymentMethods')
    }


    return (
        <div className="px-4">
            <h1 className="text-3xl font-bold my-4 text-center">Subscription Plans</h1>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4">
                        {plans
                            .slice() // Copia para no modificar el estado original
                            .sort((a, b) => (a.short_name > b.short_name ? 1 : -1)) // Ordena por short_name
                            .map((plan: Plan) => (
                                <div key={plan.id} className="bg-[#ffb29f] rounded shadow p-4 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">{plan.name}</h2>
                                        <p className="text-gray-500 mb-2">{plan.description}</p>
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
                                            <Button className='appWhiteOnOrange w-full' onClick={() => handleSubscribe(plan.id)}>Subscribe by {plan.currency} {(plan.amount / 100).toFixed(2)}/month </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <Modal
                        isOpen={isOpen}
                        onOpenChange={setIsOpen}
                        backdrop="blur"
                        scrollBehavior="inside">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        Credit Card Details
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className='flex flex-row items-center gap-4'>
                                            <div className='text-nowrap'>Payment Method</div>
                                            <Dropdown>
                                                <DropdownTrigger>
                                                    <Button className=' w-full justify-start' startContent={(<img
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


                                        <CheckboxGroup
                                            isRequired
                                            description="Please confirm your acceptance of each acknowledgment.                                            "
                                            isInvalid={isInvalid}
                                            label="Ackowledgements"
                                            onValueChange={(value) => {
                                                setIsInvalid(value.length < 4);
                                            }}
                                        >
                                            <Checkbox isInvalid={isInvalid} value="authorization">I authorize a recurring monthly charge of <b>{selectedPlan?.currency} {(selectedPlan.amount / 100)}</b> for my <b>{selectedPlan.name}</b> subscription.</Checkbox>
                                            <Checkbox isInvalid={isInvalid} value="tokens">I acknowledge that the <b>{selectedPlan.name}</b> will issue <b>{benefits[selectedPlan.short_name].main_benefit} Tokens</b> each month for use on this platform, which are not cumulative.</Checkbox>
                                            <Checkbox isInvalid={isInvalid} value="tyc">I have read and agree to the full Terms & Conditions.</Checkbox>
                                            <Checkbox isInvalid={isInvalid} value="cancellation">I acknowledge that I can cancel this authorization at any time in the future.</Checkbox>
                                        </CheckboxGroup>



                                        <div></div >
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button isDisabled={isSubscribing} className="appWhiteOnBlack" onPress={onClose}>
                                            Cancel
                                        </Button>
                                        <Button isLoading={isSubscribing} isDisabled={isInvalid} className="appWhiteOnOrange" onPress={handleFormSubmit}>
                                            Subscribe
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            }
        </div>
    );
};

export default withProtected(Buy);

