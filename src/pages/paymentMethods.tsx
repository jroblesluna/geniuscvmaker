import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { getFirestore, doc, getDoc, DocumentReference, collection, updateDoc } from "firebase/firestore";
import CardIconsList from '../components/cardIconsList';
import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';
import { toast } from 'react-hot-toast';
import SvgCancel from '../components/svgCancel';
import { useRouter } from 'next/router';
import SvgStar from '../components/svgStar';
import { Contact, CreditCard } from '../interfaces/culqi';

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
    }
};

function PaymentMethods({ auth }) {
    const { user } = auth;
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [contact, setContact] = useState<Contact>({ ...emptyContact });
    const [isLoading, setIsLoading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isFavoriting, setIsFavoriting] = useState(false);
    const [favoriteCard, setFavoriteCard] = useState('');
    const [userDocRef, setUserDocRef] = useState<DocumentReference | null>(null);

    const router = useRouter(); // Initialize Next.js router

    const { name, number, expiry, security, email, errors } = contact;

    const lookupFavoriteCard = async () => {
        console.log("fetchFavoriteCard");
        try {
            const firestore = getFirestore();
            const userDocRef = doc(firestore, "users", user.uid);
            setUserDocRef(userDocRef);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                console.log("favoriteCard", userData["favoriteCard"]);
                setFavoriteCard(userData["favoriteCard"] ?? '');
                return true;
            } else {
                console.log("The user document doesn't exist");
                return false;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return false;
        }
    };


    // Input field onChange handler
    const handleChange = (e) => {
        setContact({ ...contact, [e.target.name]: e.target.value });
    }

    // Input card expiry onKeyUp handler
    const handleCardExpiry = (e) => {
        let expiryDate = e.target.value;

        if (e.keyCode !== 8) {
            if (expiryDate > 1 && expiryDate.length === 1) {
                expiryDate = '0' + expiryDate + '/';
            } else if (expiryDate.length === 2) {
                expiryDate = expiryDate + '/';
            }

            setContact({ ...contact, expiry: expiryDate });
        } else {
            setContact({ ...contact, expiry: '' });
        }
    }

    // Input fields validation handler
    const handleValidation = () => {
        const { name, number, expiry, security, email, errors } = contact;
        let formIsValid = true;

        if (!name || name.length < 5) {
            formIsValid = false;
            errors['name'] = 'Cardholder name is required (At least 5 letters)';
        } else {
            errors['name'] = '';
        }

        // Validate email
        if (!email || !validateEmail(email)) {
            formIsValid = false;
            errors['email'] = 'Email is invalid';
        } else {
            errors['email'] = '';
        }

        if (!number) {
            formIsValid = false;
            errors['number'] = 'Card number is required';
        } else {
            // Luhn algorithm validation
            const isValidCardNumber = validateCardNumber(number);
            if (!isValidCardNumber || number.length < 14) {
                formIsValid = false;
                errors['number'] = 'Invalid card number';
            } else {
                errors['number'] = '';
            }
        }

        if (!expiry || expiry.length != 5) {
            formIsValid = false;
            errors['expiry'] = 'Expiry is required';
        } else {
            // Check if expiry date is in the future
            const [month, year] = expiry.split('/');
            const currentYear = new Date().getFullYear().toString().slice(-2);
            const currentMonth = new Date().getMonth() + 1;
            if (parseInt(year) < parseInt(currentYear) || (parseInt(year) === parseInt(currentYear) && parseInt(month) < currentMonth)) {
                formIsValid = false;
                errors['expiry'] = 'Expiry date must be in the future';
            } else {
                errors['expiry'] = '';
            }
        }

        if (!security) {
            formIsValid = false;
            errors['security'] = 'CVV is required';
        } else {
            errors['security'] = '';
        }

        setContact({ ...contact, errors: errors });
        return formIsValid;
    }

    // Luhn algorithm for credit card number validation
    const validateCardNumber = (cardNumber) => {
        console.log("Chacking...", cardNumber);
        let sum = 0;
        let shouldDouble = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    }

    // Regular expression for email validation
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    }

    async function createCulqiToken(card_number: string, cvv: string, expiration_month: string, expiration_year: string, email: string) {
        try {
            console.log("expiry");
            console.log(expiry);
            console.log("expiration_month", expiration_month);
            console.log("expiration_year", expiration_year);
            const response = await fetch('/api/culqi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: 'create.tokens',
                    culqiBody: {
                        "card_number": card_number,
                        "cvv": cvv,
                        "expiration_month": expiration_month,
                        "expiration_year": expiration_year,
                        "email": email,
                    }
                }),
            });
            const data = await response.json();
            console.log('Token data:', data);
            return (data);
        } catch (error) {
            console.error('Error creating token:', error);
            return null;
        }
    }

    async function createCulqiCard(customer_id: string, token_id: string, expiry: string, name: string) {
        console.log(customer_id);
        console.log(token_id);
        console.log(expiry);
        console.log(name);
        try {
            console.log("customer_id", customer_id);
            console.log("token_id", token_id);
            const response = await fetch('/api/culqi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: 'create.cards',
                    culqiBody: {
                        "customer_id": customer_id,
                        "token_id": token_id,
                        "metadata": {
                            "expiry": expiry,
                            "name": name,
                        }
                    }
                }),
            });
            const data = await response.json();
            console.log('Card data:', data);
            return (data);
        } catch (error) {
            console.error('Error creating card:', error);
            return null;
        }
    }

    async function deleteCulqiCard(culqiCardId: string) {
        try {
            console.log("culqiCardId", culqiCardId);
            const response = await fetch('/api/culqi', {
                method: 'POST',//Don't get confused, this is always POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: 'delete.cards',
                    culqiBody: {
                        "id": culqiCardId
                    }
                }),
            });
            const data = await response.json();
            console.log('Deleted Card:', data);
            return (data);
        } catch (error) {
            console.error('Error listing customer:', error);
            return null;
        }
    }

    async function listCulqiCustomerByEmail(email: string) {
        try {
            console.log("email", email);
            const response = await fetch('/api/culqi', {
                method: 'POST',//Don't get confused, this is always POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: 'list.customers',
                    culqiBody: {
                        "email": email
                    }
                }),
            });
            const data = await response.json();
            console.log('Customer data:', data);
            return (data);
        } catch (error) {
            console.error('Error listing customer:', error);
            return null;
        }
    }

    // Form onSubmit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, number, expiry, security, email } = contact;

        if (handleValidation()) {
            setIsLoading(true);
            console.log("contact.expiry", contact.expiry);
            let culqiToken = await createCulqiToken(contact.number, contact.security, contact.expiry.substring(0, 2), "20" + contact.expiry.substring(3, 5), contact.email);

            console.log("culqiToken", culqiToken);

            if (culqiToken.object == "error") {
                console.log(culqiToken.user_message);
                toast.error(culqiToken.user_message);
            }
            else {
                const culqiCustomerId = (await listCulqiCustomerByEmail(culqiToken.email)).data[0].id;

                let culqiCard = await createCulqiCard(culqiCustomerId, culqiToken.id, contact.expiry, contact.name);

                console.log("culqiCard", culqiCard);

                if (culqiCard.object == "error") {
                    console.log(culqiCard.merchant_message);
                    toast.error(culqiCard.merchant_message);
                }
                else {
                    toast.success("Your card was registered.");
                    await fetchCards();
                }
            }

            setContact({ ...emptyContact });
            setShowModal(false);
        }

    }

    // Input onKeyDown numbers only handler
    const handleNumbersOnly = (e) => {

        let flag;

        if ((e.keyCode === 8) ||
            (e.keyCode === 9) ||
            (e.keyCode === 16 && e.keyCode >= 9) ||
            (e.keyCode === 37) ||
            (e.keyCode === 39) ||
            (e.keyCode === 46) ||
            (e.keyCode >= 48 && e.keyCode <= 57) ||
            (e.keyCode >= 96 && e.keyCode <= 105)) {
            flag = false;
        } else {
            flag = true;
        }

        if (flag) {
            e.preventDefault();
        }
    }

    const getCardType = (number) => {
        if (number !== '' || number !== null) {
            const amexReg = new RegExp('^3[47]');
            const dinersReg = new RegExp('^3(?:0[0-5]|[68][0-9])[0-9]{11}$');
            const masterReg = new RegExp('^5[1-5][0-9]');
            const visaReg = new RegExp('^4');

            if (number.toString().match(amexReg)) {
                return 'amex';
            } else if (number.toString().match(dinersReg)) {
                return 'diners';
            } else if (number.toString().match(masterReg)) {
                return 'mastercard';
            } else if (number.toString().match(visaReg)) {
                return 'visa';
            } else {
                return 'undefined';
            }
        }
    }

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
            console.log(data);
            setCreditCards(data.data);
            setIsFavoriting(true);
            await lookupFavoriteCard();
            setIsFavoriting(false);
        } catch (error) {
            console.error('Error fetching credit cards:', error);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleAddCard = () => {
        contact.name = user.displayName.toUpperCase();
        contact.email = user.email;
        setIsLoading(false);
        setShowModal(true);
    };

    const handleModalClose = async () => {
        setContact({ ...emptyContact });
        setShowModal(false);
    };

    const handleRemoveCard = async (culqiCardId: string) => {
        setIsRemoving(true);
        let removalResponse = await deleteCulqiCard(culqiCardId);
        if (removalResponse.deleted) {
            toast.success("Card was successfully deleted.")
            await fetchCards();
        }
        else {
            toast.error(removalResponse.merchant_message);
        }
        setIsRemoving(false);
        console.log(removalResponse);
    }

    const handleSetFavoriteCard = async (culqiCardId: string) => {
        if (userDocRef && favoriteCard != culqiCardId) {
            setIsFavoriting(true);
            await updateDoc(userDocRef, { favoriteCard: culqiCardId });
            await lookupFavoriteCard();
            setIsFavoriting(false);
        }
    }

    function goSubscriptions() {
        router.push('/subscriptions')
    }

    return (
        <div className='container mx-auto px-6'>
            <h1 className=' text-3xl font-bold my-4 text-center'>My Payment Methods</h1>
            <div>You need to have at least one registered Card to buy a Subscription.</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 justify-items-center">
                {creditCards.map((card, index) => (
                    <div key={index} className="bg-gradient-to-tr from-blue-950 to-blue-300 rounded-md p-3 w-80 shadow-blue-950 shadow-md">
                        <div className="flex flex-cols-2 items-start">
                            <div className='w-full'>
                                <span className='text-md embossed'>{card.source.iin.issuer.name}</span>
                            </div>
                            <Button
                                isLoading={isRemoving}
                                isIconOnly
                                className='text-red-500'
                                variant='light'
                                size="sm"
                                onClick={() => handleRemoveCard(card.id)}>
                                <SvgCancel />
                            </Button>
                        </div>
                        <div className="flex items-center justify-center mt-4">
                            <span className="text-lg embossed">{`**** ${card.source.card_number.length === 16 ? '**** **** ' : '****** '}${card.source.card_number.length === 15 ? '*' : ''}${card.source.last_four}`}</span>
                        </div>
                        <div className="flex items-center justify-center mb-2">
                            <Button
                            isLoading={isFavoriting}
                                className='text-yellow-500 text-md'
                                variant="light"
                                onClick={() => handleSetFavoriteCard(card.id)}
                                startContent={
                                    <SvgStar fillColor={(card.id === favoriteCard) ? "#FFD122" : "transparent"} />
                                }>Mark Favorite</Button>
                        </div>
                        <div className="flex flex-cols-2 items-center">
                            <div className='w-full'>
                                <div className='text-gray-300'>
                                    <span className='text-md'>EXP:</span> <span className='text-xs embossed'>{card.metadata.expiry}</span>
                                </div>
                                <div className='text-sm embossed'>
                                    {card.metadata.name}
                                </div>
                            </div>
                            <img
                                src={`/assets/svg/${card.source.iin.card_brand.toLowerCase()}.svg`}
                                alt={card.source.iin.card_brand}
                                className="h-10 rounded-md border-1" />

                        </div>
                    </div>
                ))}
            </div>
            <div className='mt-4'>
                <Button className='appWhiteOnBlue' onClick={handleAddCard}>Register New Card</Button>
            </div>
            <div className='mt-4'>
                <Button className='appBlackOnCitrine' onClick={goSubscriptions}>Buy Subscriptions</Button>
            </div>
            <Modal
                isOpen={showModal}
                onClose={handleModalClose}
                backdrop="blur">
                <ModalContent>
                    <div className="p-4 flex flex-col gap-4">
                        <h2 className="text-xl font-bold">Add New Card</h2>
                        <div
                            className='grid grid-cols-1'>
                            <Input
                                className='h-20'
                                key="cardholderName"
                                label="Card Holder Name"
                                name="name"
                                value={name}
                                variant="flat"
                                radius='none'
                                size='sm'
                                maxLength={50}
                                onChange={handleChange}
                                errorMessage={errors.name}
                            />
                            <Input
                                className='h-20'
                                key="cardholderEmail"
                                label="Card Holder Email"
                                name="email"
                                value={email}
                                variant="flat"
                                radius='none'
                                size='sm'
                                maxLength={50}
                                onChange={handleChange}
                                errorMessage={errors.email}
                            />
                            <Input
                                autoFocus
                                className='h-20'
                                key="cardNumber"
                                label="Card Number"
                                name="number"
                                value={number}
                                variant="flat"
                                radius='none'
                                size='sm'
                                minLength={14}
                                maxLength={16}
                                onKeyDown={handleNumbersOnly}
                                onChange={handleChange}
                                errorMessage={errors.number}
                                endContent={<CardIconsList type={getCardType(number)} />}
                            />
                            <div className='grid grid-cols-2 gap-4'>
                                <Input
                                    className='h-20'
                                    key="cardExpiry"
                                    label="Expiry Date MM/YY"
                                    name="expiry"
                                    value={expiry}
                                    variant="flat"
                                    radius='none'
                                    size='sm'
                                    minLength={5}
                                    maxLength={5}
                                    onChange={handleChange}
                                    onKeyDown={handleNumbersOnly}
                                    onKeyUp={handleCardExpiry}
                                    errorMessage={errors.expiry}
                                />
                                <Input
                                    className='h-20'
                                    key="cardCvv"
                                    label="CVV / CVC / CID"
                                    name="security"
                                    value={security}
                                    variant="flat"
                                    radius='none'
                                    size='sm'
                                    minLength={3}
                                    maxLength={4}
                                    onKeyDown={handleNumbersOnly}
                                    onChange={handleChange}
                                    errorMessage={errors.security}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                            >ADD CARD</Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default withProtected(PaymentMethods);
