// /context/layout.ts

import type { Tables } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { Dispatch, SetStateAction, createContext } from 'react';

interface PlanContextType {
  plan: {
    product: string;
    price: string;
  };
  setPlan: Dispatch<SetStateAction<{
    product: string;
    price: string;
  }>>;
}

interface OpenContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

type UserDetails = { [x: string]: any } | null;

export const PlanContext = createContext<PlanContextType>({
  plan: {
    product: 'prod_QfhYC6AAtI5IKW',
    price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
  },
  setPlan: () => {}
});

export const OpenContext = createContext<OpenContextType>({
  open: false,
  setOpen: () => {}
});

export const ProductsContext = createContext<ProductWithPrices[]>([]);

export const SubscriptionContext = createContext<SubscriptionWithProduct | null>(null);

export const UserContext = createContext<User | null>(null);

export const UserDetailsContext = createContext<UserDetails>(null);