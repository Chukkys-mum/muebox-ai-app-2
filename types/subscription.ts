// types/subscription.ts

import { WithTimestamps, WithStatus, JsonB, DbTimestamptz } from './common';
import type { Stripe } from 'stripe';

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

// Generic Stripe types that we need
export interface StripeAddress {
  city?: string | null;
  country?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  state?: string | null;
}

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

// Product interface
export interface Product {
  id: string; /* primary key */
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: StripeMetadata;
}

// Price interface
export interface Price {
  id: string; /* primary key */
  product_id?: string; /* foreign key to products.id */
  active?: boolean;
  description?: string;
  unit_amount?: number;
  currency?: Currency;
  type?: PricingType;
  interval?: PricingPlanInterval;
  interval_count?: number;
  trial_period_days?: number | null;
  metadata?: StripeMetadata;
  products?: Product;
}

// Currency type
export type Currency = string & { length: 3 };

// Product with Price interface
export interface ProductWithPrice extends Product {
  prices?: Price[];
}

// Price with Product interface
export interface PriceWithProduct extends Price {
  products?: Product;
}

// Subscription interface
export interface Subscription {
  id: string;
  account_id: string;
  status?: SubscriptionStatus;
  metadata?: JsonB;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: DbTimestamptz;
  current_period_start: DbTimestamptz;
  current_period_end: DbTimestamptz;
  ended_at?: DbTimestamptz;
  cancel_at?: DbTimestamptz;
  canceled_at?: DbTimestamptz;
  trial_start?: DbTimestamptz;
  trial_end?: DbTimestamptz;
  prices?: Price | null; // Change this to allow null
}

// Subscription with Price and Product
export interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

// You can add more subscription-related types or interfaces here as needed