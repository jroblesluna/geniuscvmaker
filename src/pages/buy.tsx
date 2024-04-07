import { Button, Modal, ModalContent, ModalHeader, ModalFooter, ModalBody, Input, Checkbox } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import Plan from '../interfaces/culqi/Plan';
import { withProtected } from '../hook/route';
import SvgLoading from '../components/svgLoading';
import SvgLogo from '../components/svgLogo';

const benefits = {
    "genius-01": {
        main_benefit: 1000,
        others: [
            "5 Start from Scratch CV",
            "Unlimited Classic",
        ],
    },
    "genius-02": {
        main_benefit: 5000,
        others: [
            "10 Start from Scratch CV",
            "Unlimited Classic",
            "20 Optimizations",
        ],
    },
    "genius-03": {
        main_benefit: 50000,
        others: [
            "200 Start from Scratch CV",
            "Unlimited Classic",
            "200 Optimizations",
        ],
    }
}

const Plans = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        saveCard: false
    });

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

    const handleFormSubmit = async () => {
        try {
            const response = await fetch('/api/culqi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    culqiMethod: 'create.cards',
                    culqiBody: {
                        cardNumber: formData.cardNumber,
                        expiry: formData.expiry,
                        cvv: formData.cvv,
                        saveCard: formData.saveCard
                    }
                }),
            });
            const data = await response.json();
            console.log('Card created:', data);
        } catch (error) {
            console.error('Error creating card:', error);
        }
    };

    return (
        <div className="container mx-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans
                            .slice() // Copia para no modificar el estado original
                            .sort((a, b) => (a.short_name > b.short_name ? 1 : -1)) // Ordena por short_name
                            .map((plan: Plan) => (
                                <div key={plan.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">{plan.name}</h2>
                                        <p className="text-gray-500 mb-2">{plan.description}</p>
                                        <p>You get:</p>
                                        <p className='ml-4'><b>{benefits[plan.short_name].main_benefit} Tokens</b></p>
                                        <hr />
                                        <p>Gift:</p>
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
                                    <div className="mt-auto">
                                        <hr />
                                        <div className='h-full grid grid-cols-2 items-center m-2'>
                                            <p className="text-gray-700 font-semibold">Price: US$ {(plan.amount / 100).toFixed(2)} {plan.currency}</p>
                                            <Button onClick={() => setIsOpen(true)}>Subscribe</Button>
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
                                            <Input
                                                label="Card Number"
                                                value={formData.cardNumber}
                                                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                            />
                                            <Input
                                                label="Expiry"
                                                value={formData.expiry}
                                                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                            />
                                            <Input
                                                label="CVV"
                                                value={formData.cvv}
                                                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                            />
                                            <Checkbox
                                                checked={formData.saveCard}
                                                onChange={(e) => setFormData({ ...formData, saveCard: e.target.checked })}
                                            >
                                                Save this card
                                            </Checkbox>
                                            <Button type="submit">Submit</Button>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" onPress={onClose}>
                                            Cancel
                                        </Button>
                                        <Button color="success" onPress={handleFormSubmit}>
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

export default withProtected(Plans);
