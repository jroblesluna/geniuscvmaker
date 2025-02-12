// Define la interfaz para la dirección del billing
interface Address {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
}

// Interfaz para los detalles de facturación
interface BillingDetails {
  address: Address;
  email: string | null;
  name: string | null;
  phone: string | null;
}

interface CardChecks {
  address_line1_check: string | null;
  address_postal_code_check: string | null;
  cvc_check: string | null;
}

interface CardNetworks {
  available: string[];
  preferred: string | null;
}
export interface Card {
  brand: string;
  checks: CardChecks;
  country: string;
  display_brand: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  generated_from: any;
  last4: string;
  networks: CardNetworks;
  regulated_status: string;
  three_d_secure_usage: {
    supported: boolean;
  };
  wallet: any;
}

export interface PaymentMethod {
  id: string;
  object: string;
  allow_redisplay: string;
  billing_details: BillingDetails;
  card: Card;
  created: number;
  customer: string;
  livemode: boolean;
  metadata: Record<string, any>;
  type: string;
}

interface PaymentMethodsList {
  data: PaymentMethod[];
  has_more: boolean;
  url: string;
}

export interface PlanStripe {
  id: string;
  unit_amount: number;
  currency: string;
  product: {
    id: string;
    name: string;
    description: string;
    metadata: { main_benefit: string; short_name: string };
  };
}
