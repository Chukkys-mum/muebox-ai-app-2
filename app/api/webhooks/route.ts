// /app/api/webhooks/route.ts

import { stripe } from '@/utils/stripe/config';
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from '@/utils/supabase/admin';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Define relevant Stripe event types
const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Safely retrieve the Stripe-Signature header
  const rawHeaders = await headers();
  const sig = rawHeaders.get('Stripe-Signature');

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret.');
    return new Response('Webhook Error: Missing signature or secret.', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Construct the Stripe event
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    // Safely handle unknown errors
    if (err instanceof Error) {
      console.error(`❌ Error constructing Stripe event: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    console.error('❌ Unknown error:', err);
    return new Response('Webhook Error: Unknown error occurred.', { status: 400 });
  }

  // Process relevant events
  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;

        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        }

        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription as string;
            await manageSubscriptionStatusChange(
              subscriptionId,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        }

        default:
          console.warn(`Unhandled relevant event type: ${event.type}`);
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      // Safely log errors
      console.error('❌ Webhook handler error:', error);
      return new Response(
        'Webhook handler failed. Check your function logs for details.',
        { status: 400 }
      );
    }
  } else {
    console.warn(`Ignored event type: ${event.type}`);
  }

  // Respond with success for processed events
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
