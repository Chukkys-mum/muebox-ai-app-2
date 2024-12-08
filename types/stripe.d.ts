// types/stripe.d.ts

declare module 'stripe' {
    export = Stripe;
  
    namespace Stripe {
      interface Metadata {
        [key: string]: string | number | null | undefined;
      }
  
      interface Address {
        city: string | null;
        country: string | null;
        line1: string | null;
        line2: string | null;
        postal_code: string | null;
        state: string | null;
      }
  
      interface PaymentMethod {
        id: string;
        customer?: string;
        type: string;
        billing_details: {
          name: string | null;
          phone: string | null;
          email: string | null;
          address: Address | null;
        };
        [key: string]: any; // For additional fields based on type
      }
      
      interface DeletedProduct {
        id: string;
        object: 'product';
        deleted: boolean;
      }  

      interface Price {
        id: string;
        active: boolean;
        currency: string;
        product: string | Product | DeletedProduct; 
        type: 'one_time' | 'recurring';
        unit_amount: number | null;
        metadata: Metadata;
        recurring?: {
          interval: 'day' | 'week' | 'month' | 'year';
          interval_count: number;
          trial_period_days?: number | null;
          usage_type?: 'licensed' | 'metered';
        };
      }
  
      interface Product {
        id: string;
        active: boolean;
        name: string;
        description: string | null;
        images: string[];
        metadata: Metadata;
      }
  
      interface Subscription {
        id: string;
        status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
        customer: string;
        items: {
          data: Array<{
            id: string;
            price: Price;
            quantity?: number | null;
          }>;
        };
        default_payment_method?: PaymentMethod | string | null;
        cancel_at?: number | null;
        cancel_at_period_end: boolean;
        canceled_at?: number | null;
        current_period_start: number;
        current_period_end: number;
        created: number;
        ended_at?: number | null;
        trial_start?: number | null;
        trial_end?: number | null;
        metadata: Metadata;
      }
  
      interface Customer {
        id: string;
        email: string | null;
        name: string | null;
        metadata: Metadata;
        address: Address | null;
        phone: string | null;
        shipping: {
          address: Address | null;
          name: string | null;
          phone: string | null;
        } | null;
      }
  
      interface Event {
        type: string;
        data: {
          object: any;
        };
      }
  
      interface Checkout {
        Session: {
          create(params: any): Promise<any>;
          retrieve(sessionId: string): Promise<any>;
        };
      }
  
      interface BillingPortal {
        Session: {
          create(params: any): Promise<any>;
        };
      }
  
      interface Webhooks {
        constructEvent(
          payload: string | Buffer,
          header: string,
          secret: string
        ): Event;
      }
    }
  
    interface Stripe {
      checkout: Stripe.Checkout;
      customers: {
        create(params: any): Promise<Stripe.Customer>;
        retrieve(customerId: string): Promise<Stripe.Customer>;
        update(customerId: string, params: any): Promise<Stripe.Customer>;
        list(params?: { email?: string }): Promise<{ data: Stripe.Customer[] }>;
      };
      products: {
        create(params: any): Promise<Stripe.Product>;
        retrieve(productId: string): Promise<Stripe.Product>;
        update(productId: string, params: any): Promise<Stripe.Product>;
        list(): Promise<{ data: Stripe.Product[] }>;
      };
      prices: {
        create(params: any): Promise<Stripe.Price>;
        retrieve(priceId: string): Promise<Stripe.Price>;
        update(priceId: string, params: any): Promise<Stripe.Price>;
        list(): Promise<{ data: Stripe.Price[] }>;
      };
      subscriptions: {
        create(params: any): Promise<Stripe.Subscription>;
        retrieve(subscriptionId: string, params?: any): Promise<Stripe.Subscription>;
        update(subscriptionId: string, params: any): Promise<Stripe.Subscription>;
        list(params?: any): Promise<{ data: Stripe.Subscription[] }>;
      };
      paymentMethods: {
        retrieve(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
      };
      billingPortal: Stripe.BillingPortal;
      webhooks: Stripe.Webhooks;
    }
  }