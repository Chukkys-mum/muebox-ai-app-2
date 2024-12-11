// /types/adapters.ts

import { Database, Json } from './types_db';
import { 
  Product, 
  Price, 
  ProductWithPrice, 
  PriceWithProduct, 
  SubscriptionWithProduct,
  StripeMetadata,
  Currency,
  SubscriptionStatus
} from './subscription';
import { JsonB } from './common';  // Import JsonB from common types

// Convert Json to JsonB type
function convertJsonToJsonB(json: Json | null): JsonB | undefined {
  if (json === null) return undefined;
  return json as JsonB;
}

// Database Types
type DbProduct = Database['public']['Tables']['products']['Row'];
type DbPrice = Database['public']['Tables']['prices']['Row'];
type DbSubscription = Database['public']['Tables']['subscriptions']['Row'];

// Helper to convert Json to StripeMetadata
function convertToStripeMetadata(metadata: Json | null): StripeMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;
  
  const result: StripeMetadata = {};
  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      result[key] = value;
    }
  });
  return result;
}

// Helper to ensure currency is valid
function validateCurrency(currency: string | null): Currency | undefined {
  if (!currency || currency.length !== 3) return undefined;
  return currency as Currency;
}

// Helper to validate subscription status
function validateSubscriptionStatus(status: string | null): SubscriptionStatus | undefined {
  if (!status) return undefined;
  
  const validStatuses = [
    'trialing', 'active', 'canceled', 'incomplete',
    'incomplete_expired', 'past_due', 'unpaid', 'paused'
  ] as const;
  
  return validStatuses.includes(status as SubscriptionStatus) 
    ? status as SubscriptionStatus 
    : undefined;
}

export function adaptProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    active: dbProduct.active ?? undefined,
    name: dbProduct.name ?? undefined,
    description: dbProduct.description ?? undefined,
    image: dbProduct.image ?? undefined,
    metadata: convertToStripeMetadata(dbProduct.metadata)
  };
}

export function adaptPrice(dbPrice: DbPrice): Price {
  return {
    id: dbPrice.id,
    product_id: dbPrice.product_id ?? undefined,
    active: dbPrice.active ?? undefined,
    description: dbPrice.description ?? undefined,
    unit_amount: dbPrice.unit_amount ?? undefined,
    currency: validateCurrency(dbPrice.currency),
    type: (dbPrice.type as Price['type']) ?? undefined,
    interval: dbPrice.interval ?? undefined,
    interval_count: dbPrice.interval_count ?? undefined,
    trial_period_days: dbPrice.trial_period_days,
    metadata: convertToStripeMetadata(dbPrice.metadata)
  };
}

export function adaptProductWithPrices(
  dbProduct: DbProduct & { prices: DbPrice[] }
): ProductWithPrice {
  return {
    ...adaptProduct(dbProduct),
    prices: dbProduct.prices.map(adaptPrice)
  };
}

export function adaptPriceWithProduct(
  dbPrice: DbPrice & { products: DbProduct | null }
): PriceWithProduct {
  return {
    ...adaptPrice(dbPrice),
    products: dbPrice.products ? adaptProduct(dbPrice.products) : undefined
  };
}

export function adaptSubscriptionWithProduct(
  dbSubscription: DbSubscription & { 
    prices: (DbPrice & { 
      products: DbProduct | null 
    }) | null 
  }
): SubscriptionWithProduct {
  const adaptedSubscription: SubscriptionWithProduct = {
    id: dbSubscription.id,
    account_id: dbSubscription.account_id,
    status: validateSubscriptionStatus(dbSubscription.status ?? null),
    metadata: convertJsonToJsonB(dbSubscription.metadata),
    price_id: dbSubscription.price_id ?? undefined,
    quantity: dbSubscription.quantity ?? undefined,
    cancel_at_period_end: dbSubscription.cancel_at_period_end ?? undefined,
    created: dbSubscription.created,
    current_period_start: dbSubscription.current_period_start,
    current_period_end: dbSubscription.current_period_end,
    ended_at: dbSubscription.ended_at ?? undefined,
    cancel_at: dbSubscription.cancel_at ?? undefined,
    canceled_at: dbSubscription.canceled_at ?? undefined,
    trial_start: dbSubscription.trial_start ?? undefined,
    trial_end: dbSubscription.trial_end ?? undefined,
    prices: dbSubscription.prices 
      ? adaptPriceWithProduct(dbSubscription.prices)
      : null
  };

  return adaptedSubscription;
}