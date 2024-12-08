// /utils/stripe/config.ts      (Stripe initialization)

import { Stripe } from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '';
const stripeConfig = {
  apiVersion: '2023-10-16' as const, // Latest stable Stripe API version
  typescript: true,
  appInfo: {
    name: 'Muebox Ai',
    version: '2.0.1',
    url: 'https://muebox.com'
  },
  telemetry: false
};

export const stripe = new (Stripe as any)(stripeSecretKey, stripeConfig);

// Export the stripe instance type for use in other files
export type StripeInstance = typeof stripe;