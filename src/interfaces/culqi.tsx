// Plan.tsx

export interface Plan {
    id: string;
    interval_unit_time: 1 | 2 | 3 | 4 | 5 | 6;
    interval_count: number;
    amount: number;
    currency: "PEN" | "USD";
    name: string;
    description: string;
    short_name: string;
    initial_cycles: object;
    metadata: object;
    image?: string;
    total_subscriptions: number;
    status: 1 | 2;
    creation_date: number;
    slug: string;
}

export interface Subscription {
    id: string,
    status: 1 | 2 | 3 | 4 | 5 | 6,
    creation_date: number,
    next_billing_date: number,
    current_period: number,
    trial_start: number,
    trial_end: number,
    active_card: string,
    plan: Plan,
    periods: object[],
    metadata: {
        plan_name:string,
        plan_currency:string,
        plan_amount:number,
    },
  }

export const getDefaultPlan = (): Plan => ({
    id: '',
    interval_unit_time: 3,
    interval_count: 0,
    amount: 0,
    currency: "USD",
    name: '',
    description: '',
    short_name: '',
    initial_cycles: [],
    metadata: [],
    total_subscriptions: 0,
    status: 1,
    creation_date: 0,
    slug: '',
});

export interface Contact {
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

export interface CreditCard {
    id: string,
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
    metadata: {
        name: string,
        expiry: string,
    },
}
