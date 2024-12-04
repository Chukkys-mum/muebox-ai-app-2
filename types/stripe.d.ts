// types/stripe.d.ts
declare module 'stripe' {
    export = Stripe;
    
    interface Stripe {
        // Add your Stripe type definitions here
        Metadata: any;
        Address: any;
        PaymentMethod: {
            Type: any;
        };
        Price: {
            Type: any;
            Recurring: {
                Interval: any;
            };
        };
        Subscription: {
            Status: any;
        };
    }
}