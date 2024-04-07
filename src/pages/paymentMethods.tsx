import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

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

function PaymentMethods() {
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [cardFormData, setCardFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });

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
                setCreditCards(data.data);
            } catch (error) {
                console.error('Error fetching credit cards:', error);
            }
        };

        fetchCards();
    }, []);

    const handleAddCard = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleFormSubmit = async () => {
        // Call API to create a new card with cardFormData
        // Reset form data and close modal
        setCardFormData({
            cardNumber: '',
            expiry: '',
            cvv: '',
        });
        setShowModal(false);
    };

    return (
        <div className='container mx-auto px-4'>
            <h1 className='text-3xl font-bold my-4 text-center'>My Payment Methods</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditCards.map((card, index) => (
                    <div key={index} className="bg-white rounded shadow p-4">
                        <div className="flex items-center justify-between mb-4">
                            <img
                                src={`/assets/svg/${card.source.iin.card_brand.toLowerCase()}.svg`}
                                alt={card.source.iin.card_brand}
                                className="h-8" />
                            <span className="text-gray-600 text-md font-mono font-bold">{`**** ${card.source.card_number.length === 16 ? '**** **** **** ' : '****** '}${card.source.card_number.length === 15 ? '*' : ''}${card.source.last_four}`}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>{`Issuer: ${card.source.iin.issuer.name}`}</p>
                            <p>{`Card Type: ${card.source.iin.card_type}`}</p>
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
                        <h2 className="text-xl font-bold mb-4">Add New Card</h2>
                        <Input
                            label="Card Number"
                            variant="faded"
                            value={cardFormData.cardNumber}
                            onChange={(e) => setCardFormData({ ...cardFormData, cardNumber: e.target.value })}/>
                        <Input
                            label="Expiry Date"
                            placeholder='MM/YYYY'
                            variant="faded"
                            value={cardFormData.expiry}
                            onChange={(e) => setCardFormData({ ...cardFormData, expiry: e.target.value })}/>
                        <Input
                            label="CVV"
                            variant="faded"
                            value={cardFormData.cvv}
                            onChange={(e) => setCardFormData({ ...cardFormData, cvv: e.target.value })}/>
                        <Button onClick={handleFormSubmit}>Submit</Button>
                    </div>
                </ModalContent>
            </Modal>



        </div>
    );
}

export default PaymentMethods;
