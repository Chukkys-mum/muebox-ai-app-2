// /app/api/webhooks/route.ts

import { stripe } from '@/utils/stripe/config';
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from '@/utils/supabase/admin';
import { handleSubscriptionCredits } from '@/utils/stripe/credits';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import type { Stripe } from 'stripe';
import { SimplifiedSubscription } from '@/types';

// Helper to get account_id for customer
async function getAccountIdFromCustomer(customerId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('account_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) {
    throw new Error(`Unable to find account_id for customer ${customerId}`);
  }

  return data.account_id;
}

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

  const rawHeaders = await headers();
  const sig = rawHeaders.get('Stripe-Signature');

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret.');
    return new Response('Webhook Error: Missing signature or secret.', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`❌ Error constructing Stripe event: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
    console.error('❌ Unknown error:', err);
    return new Response('Webhook Error: Unknown error occurred.', { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated': {
          const product = event.data.object as Stripe.Product;
          await upsertProductRecord(product);
          break;
        }

        case 'price.created':
        case 'price.updated': {
          const price = event.data.object as any; // Use any temporarily
          const account_id = price.metadata?.account_id || 
            process.env.DEFAULT_ACCOUNT_ID;
          if (!account_id) {
            throw new Error('No account_id found for price');
          }
          await upsertPriceRecord(price, account_id);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer.id;
          
          const accountId = await getAccountIdFromCustomer(customerId);
          
          const simplified: SimplifiedSubscription = {
            id: subscription.id,
            status: subscription.status,
            trial_end: subscription.trial_end,
            trial_start: subscription.trial_start,
            items: {
              data: subscription.items.data.map((item: Stripe.SubscriptionItem) => ({
                id: item.id,
                price: {
                  id: item.price.id,
                  recurring: item.price.recurring || undefined
                }
              }))
            },
            created: subscription.created,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            canceled_at: subscription.canceled_at,
            cancel_at: subscription.cancel_at,
            ended_at: subscription.ended_at,
            cancel_at_period_end: subscription.cancel_at_period_end
          };
          
          await manageSubscriptionStatusChange(
            subscription.id,
            customerId,
            event.type === 'customer.subscription.created'
          );

          await handleSubscriptionCredits(
            accountId,
            simplified,
            event.type === 'customer.subscription.created'
          );
          break;
        }
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          if (session.mode === 'subscription' && session.subscription) {
            const customerId = typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id;
        
            if (!customerId) {
              throw new Error('No customer ID found in session');
            }
        
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription.toString()
            );
        
            const accountId = await getAccountIdFromCustomer(customerId);
        
            const simplified: SimplifiedSubscription = {
              id: subscription.id,
              status: subscription.status,
              trial_end: subscription.trial_end,
              trial_start: subscription.trial_start,
              items: {
                data: subscription.items.data.map((item: Stripe.SubscriptionItem) => ({
                  id: item.id,
                  price: {
                    id: item.price.id,
                    recurring: item.price.recurring || undefined
                  }
                }))
              },
              created: subscription.created,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              canceled_at: subscription.canceled_at,
              cancel_at: subscription.cancel_at,
              ended_at: subscription.ended_at,
              cancel_at_period_end: subscription.cancel_at_period_end
            };
        
            await manageSubscriptionStatusChange(
              subscription.id,
              customerId,
              true
            );
        
            await handleSubscriptionCredits(
              accountId,
              simplified,
              true
            );
          }
          break;
        }

        default:
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('❌ Webhook handler error:', error);
      return new Response(
        'Webhook handler failed. Check your function logs for details.',
        { status: 400 }
      );
    }
  } else {
    console.warn(`Ignored event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}