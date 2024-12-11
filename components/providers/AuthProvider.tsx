//  /components/providers/AuthProvider.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types/types_db';
import type { ProductWithPrice, SubscriptionWithProduct } from '@/types/subscription';

// Context types
interface AuthContextType {
  user: User | null;
  userDetails: Tables<'users'> | null;
  products: ProductWithPrice[];
  subscription: SubscriptionWithProduct | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<Tables<'users'> | null>(null);
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await refreshUserData(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await refreshUserData(session.user.id);
        } else {
          setUser(null);
          setUserDetails(null);
          setSubscription(null);
        }
        router.refresh();
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, [supabase, router]);

  const refreshUserData = async (userId: string) => {
    try {
      const [userDetailsResponse, productsResponse, subscriptionResponse] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('products').select('*, prices(*)').eq('active', true),
        supabase.from('subscriptions')
          .select('*, prices(*, products(*))')
          .eq('user_id', userId)
          .in('status', ['trialing', 'active'])
          .single()
      ]);

      if (userDetailsResponse.data) setUserDetails(userDetailsResponse.data);
      if (productsResponse.data) setProducts(productsResponse.data);
      if (subscriptionResponse.data) setSubscription(subscriptionResponse.data);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/signin');
  };

  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session?.user) {
      await refreshUserData(session.user.id);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        userDetails,
        products,
        subscription,
        isLoading,
        signOut,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}