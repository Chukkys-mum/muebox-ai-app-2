// types/subscription.ts

import { WithTimestamps, WithStatus, JsonB, DbTimestamptz } from './common';
import type { Stripe } from 'stripe';
import { Json } from './types_db';  

export type AccountType = 'personal' | 'company';
export type PricingPlanInterval = 'day' | 'week' | 'month' | 'year';
export type PricingType = 'one_time' | 'recurring';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused';
export type AccountStatus = 'trial' | 'subscriber' | 'regular';

export interface StripeAddress {
  city?: string | null;
  country?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  state?: string | null;
}

export type SimplifiedSubscription = {
  id: string;
  status: SubscriptionStatus;
  trial_end: number | null;
  trial_start: number | null;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        recurring?: {
          interval?: PricingPlanInterval;
          interval_count?: number;
        } | null;
      };
    }>;
  };
  created: number;
  current_period_start: number;
  current_period_end: number;
  canceled_at: number | null;
  cancel_at: number | null;
  ended_at: number | null;
  cancel_at_period_end: boolean;
};

export interface StripeMetadata {
  [name: string]: string | number | null;
}

export interface StripePaymentMethod {
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Customer interface
export interface Customer {
  id: string; /* primary key */
  stripe_customer_id?: string;
}

// Account interface
export interface Account {
  id: string;
  type: AccountType;
  name: string;
  domain?: string;
  organization_number?: string;
  tax_id?: string;
  contact_emails?: string[];
  contact_phone?: string;
  website?: string;
  billing_address?: StripeAddress;
  payment_method?: StripePaymentMethod;
  currency?: string;
  display_picture?: string;
  banner_image?: string;
  timezone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  metadata?: JsonB;
  status: string;
  created_at: string;
  updated_at: string;
}

// Base Product interface aligned with database types
export interface Product {
  id: string;
  active: boolean | null;
  name: string | null;
  description: string | null;
  image: string | null;
  metadata: Json | null;
}

// Base Price interface aligned with database types
export interface Price {
  id: string;
  product_id: string | null;
  active: boolean | null;
  description: string | null;
  unit_amount: number | null;
  currency: string | null;
  type: PricingType | null;
  interval: PricingPlanInterval | null;
  interval_count: number | null;
  trial_period_days: number | null;
  metadata: Json | null;
  account_id: string;
}

// Price with Product interface
export interface PriceWithProduct extends Price {
  products: Product;
}

// Product with Price interface
export interface ProductWithPrice extends Product {
  prices?: PriceWithProduct[];
}

// Base Subscription interface
export interface Subscription {
  id: string;
  account_id: string;
  status: SubscriptionStatus | null;
  metadata: Json | null;
  price_id: string | null;
  quantity: number | null;
  cancel_at_period_end: boolean | null;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  credits: number | null;
  trial_credits?: number | null;
}

// Subscription with Price and Product
export interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

export type Currency = string & { length: 3 };
