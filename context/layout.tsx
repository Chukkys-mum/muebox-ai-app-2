// /context/layout.tsx

'use client'

import type { Tables } from '@/types/types_db';
import { User } from '@supabase/supabase-js';
import { Dispatch, SetStateAction, createContext, useContext, ReactNode, useState } from 'react';
import { ProductWithPrice, PriceWithProduct, SubscriptionWithProduct } from '@/types/subscription';

// Types remain the same
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

type UserDetails = Tables<'users'>;

// Create and export the Context objects
export const PlanContext = createContext<PlanContextType | null>(null);
export const OpenContext = createContext<OpenContextType | null>(null);
export const ProductsContext = createContext<ProductWithPrice[] | null>(null);
export const SubscriptionContext = createContext<SubscriptionWithProduct | null>(null);
export const UserContext = createContext<User | null>(null);
export const UserDetailsContext = createContext<UserDetails | null>(null);

// Provider Components
interface ProviderProps {
  children: ReactNode;
  value?: any;
  initialValue?: any;
}

export const UserProvider = ({ children, value }: ProviderProps) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const UserDetailsProvider = ({ children, value }: ProviderProps) => {
  return <UserDetailsContext.Provider value={value}>{children}</UserDetailsContext.Provider>;
};

export const ProductsProvider = ({ children, value }: ProviderProps) => {
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const SubscriptionProvider = ({ children, value }: ProviderProps) => {
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const PlanProvider = ({ children, initialValue }: ProviderProps) => {
  const [plan, setPlan] = useState(initialValue || {
    product: 'prod_QfhYC6AAtI5IKW',
    price: 'price_1PoM9GDWNoHJSR0zmwpicH8y'
  });

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const OpenProvider = ({ children }: ProviderProps) => {
  const [open, setOpen] = useState(false);
  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      {children}
    </OpenContext.Provider>
  );
};

// Hook exports
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used within a PlanProvider');
  return context;
};

export const useOpen = () => {
  const context = useContext(OpenContext);
  if (!context) throw new Error('useOpen must be used within an OpenProvider');
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within a ProductsProvider');
  return context;
};

// Export types
export type {
  PlanContextType,
  OpenContextType,
  UserDetails,
  SubscriptionWithProduct,
  ProductWithPrice,
  PriceWithProduct,
  ProviderProps
};