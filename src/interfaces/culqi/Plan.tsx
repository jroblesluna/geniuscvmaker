// Plan.tsx

interface Plan {
    [x: string]: any;
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

export default Plan;
