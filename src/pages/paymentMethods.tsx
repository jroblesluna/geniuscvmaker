import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import CardIconsList from '../components/cardIconsList';
import React, { useEffect, useState } from 'react';
import { withProtected } from '../hook/route';

interface Contact {
    name: string;
    number: string;
    expiry: string;
    security: string;
    email: string;
    errors: {
        name?: string;
        number?: string;
        expiry?: string;
        security?: string;
        email?: string;
    };
}

interface CreditCard {
    source: {
        card_number: string,
        iin: {
            card_brand: string,
            card_type: string,
            issuer: {
                name: string,
            },
        },
        last_four: string,
    },
}

const EmptyContact = {
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

function PaymentMethods() {
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [contact, setContact] = useState<Contact>(EmptyContact);

    // Input field onChange handler
    const handleChange = (e) => {
        console.log("Changing...", e);
        console.log("Changing Target...", e.target);
        console.log("Changing Target Name...", e.target.name);
        console.log("Changing Target Value...", e.target.value);
        setContact({ ...contact, [e.target.name]: e.target.value });
        console.log(contact);
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
        console.log("HIXXX");

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
        console.log("HI", contact);
        if (!number) {
            formIsValid = false;
            errors['number'] = 'Card number is required';
        } else {
            // Luhn algorithm validation
            const isValidCardNumber = validateCardNumber(number);
            console.log("Number length", number.length);
            if (!isValidCardNumber || number.length < 14) {
                console.log("Sorry card");
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

    // Form onSubmit handler
    const handleSubmit = (e) => {
        console.log("Submitting");
        e.preventDefault();
        const { name, number, expiry, security, email } = contact;

        if (handleValidation()) {
            setContact({ ...contact, errors: {} });
            console.log({
                name,
                number,
                expiry,
                security,
                email
            });
        }
    }

    const { name, number, expiry, security, email, errors } = contact;

    // Input onKeyDown numbers only handler
    const handleNumbersOnly = (e) => {

        console.log(e);
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
            console.log("ACEPTADO");
        } else {
            flag = true;
        }

        if (flag) {
            e.preventDefault();
        }
    }

    const getCardType = (number) => {
        console.log(number);
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
                return 'generic';
            }
        }
    }

    useEffect(() => {
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
                console.log(data.data);
                setCreditCards(data.data);
            } catch (error) {
                console.error('Error fetching credit cards:', error);
            }
        };

        fetchCards();
    }, []);

    const handleAddCard = () => {
        console.log(contact);
        setContact(EmptyContact)
        /*errors.name = "";
        errors.number = "";
        errors.expiry = "";
        errors.security = "";
        errors.email = "";*/
        setShowModal(true);
        console.log(contact);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    return (
        <div className='container mx-auto px-4'>
            <h1 className='text-3xl font-bold my-4 text-center'>My Payment Methods</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditCards.map((card, index) => (
                    <div key={index} className="bg-gradient-to-tr from-blue-950 to-blue-300 rounded-md shadow p-4">
                        <div className="text-sm text-white">
                            <p>{`Issuer: ${card.source.iin.issuer.name}`}</p>
                            <p>{`Card Type: ${card.source.iin.card_type}`}</p>
                        </div>
                        <div className="flex items-center justify-center m-4">
                            <span className="text-white text-xl font-mono font-bold">{`**** ${card.source.card_number.length === 16 ? '**** **** ' : '****** '}${card.source.card_number.length === 15 ? '*' : ''}${card.source.last_four}`}</span>
                        </div>
                        <div className="flex items-center justify-end">
                            <img
                                src={`/assets/svg/${card.source.iin.card_brand.toLowerCase()}.svg`}
                                alt={card.source.iin.card_brand}
                                className="bg-white h-8 p-0.5 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
            <div className='mt-4'>
                <Button className='appWhiteOnOrange' onClick={handleAddCard}>Add New Card</Button>
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
                                radius="none"
                                className="border-xl"
                                onClick={handleSubmit}
                            >ADD CARD</Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default withProtected(PaymentMethods);
