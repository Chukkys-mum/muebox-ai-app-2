// /utils/stripe/credits.ts

import { stripe } from './config';
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/types_db';
import type { Tables } from '@/types/types_db';
import { SimplifiedSubscription } from '@/types/subscription';
import type { Stripe } from 'stripe';

// Credit allocation constants
export const TRIAL_CREDITS = 2000;
export const SUBSCRIPTION_CREDITS = 20000;
export const SUBSCRIPTION_PERIOD_DAYS = 28;

type Account = Tables<'accounts'>;

// Helper to check if subscription is in trial
const isInTrial = (subscription: SimplifiedSubscription): boolean => {
  return !!(subscription.trial_end && subscription.trial_end > Math.floor(Date.now() / 1000));
};

// Helper to determine credit amount based on subscription state
const determineCreditAmount = (subscription: SimplifiedSubscription): number => {
  if (isInTrial(subscription)) {
    return TRIAL_CREDITS;
  }
  return SUBSCRIPTION_CREDITS;
};

// Update account credits based on subscription status
export const updateAccountCredits = async (
  accountId: string,
  subscription: SimplifiedSubscription
): Promise<void> => {
  const supabase = createClient();
  
  const creditAmount = determineCreditAmount(subscription);
  const trialCredits = isInTrial(subscription) ? TRIAL_CREDITS : null;

  try {
    const { error } = await supabase
      .from('accounts')
      .update({
        credits: creditAmount,
        trial_credits: trialCredits,
      })
      .eq('id', accountId);

    if (error) {
      throw new Error(`Failed to update account credits: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating account credits:', error);
    throw error;
  }
};

// Handle credit updates for subscription changes
export const handleSubscriptionCredits = async (
  accountId: string,
  subscription: SimplifiedSubscription,
  isNewSubscription: boolean
): Promise<void> => {
  try {
    // For new subscriptions, set initial credits
    if (isNewSubscription) {
      await updateAccountCredits(accountId, subscription);
      return;
    }

    // For existing subscriptions, handle status changes
    switch (subscription.status) {
      case 'active':
        await updateAccountCredits(accountId, subscription);
        break;
      case 'canceled':
      case 'unpaid':
        await revokeCredits(accountId);
        break;
      case 'past_due':
        await handlePastDueCredits(accountId);
        break;
    }
  } catch (error) {
    console.error('Error handling subscription credits:', error);
    throw error;
  }
};

// Revoke all credits from an account
export const revokeCredits = async (accountId: string): Promise<void> => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('accounts')
      .update({
        credits: 0,
        trial_credits: null
      })
      .eq('id', accountId);

    if (error) {
      throw new Error(`Failed to revoke account credits: ${error.message}`);
    }
  } catch (error) {
    console.error('Error revoking credits:', error);
    throw error;
  }
};

// Handle credits for past due subscriptions
export const handlePastDueCredits = async (accountId: string): Promise<void> => {
  const supabase = createClient();
  
  try {
    // Get current account status
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('credits, trial_credits')
      .eq('id', accountId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch account: ${fetchError.message}`);
    }

    // Reduce credits by 50% for past due accounts
    const updatedCredits = Math.floor((account?.credits || 0) / 2);
    
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        credits: updatedCredits,
        trial_credits: null
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error(`Failed to update past due credits: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error handling past due credits:', error);
    throw error;
  }
};

// Check if account has sufficient credits
export const hasSufficientCredits = async (
  accountId: string,
  requiredCredits: number
): Promise<boolean> => {
  const supabase = createClient();
  
  try {
    const { data: account, error } = await supabase
      .from('accounts')
      .select('credits, trial_credits')
      .eq('id', accountId)
      .single();

    if (error) {
      throw new Error(`Failed to check account credits: ${error.message}`);
    }

    const totalCredits = (account?.credits || 0) + (account?.trial_credits || 0);
    return totalCredits >= requiredCredits;
  } catch (error) {
    console.error('Error checking credits:', error);
    throw error;
  }
};

// Consume credits for an operation
export const consumeCredits = async (
  accountId: string,
  amount: number
): Promise<void> => {
  const supabase = createClient();
  
  try {
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('credits, trial_credits')
      .eq('id', accountId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch account: ${fetchError.message}`);
    }

    // Determine which credits to use (trial first, then regular)
    let remainingAmount = amount;
    let newTrialCredits = account?.trial_credits || 0;
    let newCredits = account?.credits || 0;

    if (newTrialCredits > 0) {
      if (newTrialCredits >= remainingAmount) {
        newTrialCredits -= remainingAmount;
        remainingAmount = 0;
      } else {
        remainingAmount -= newTrialCredits;
        newTrialCredits = 0;
      }
    }

    if (remainingAmount > 0) {
      newCredits -= remainingAmount;
    }

    // Update the account with new credit values
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        credits: newCredits,
        trial_credits: newTrialCredits
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error(`Failed to update account credits: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error consuming credits:', error);
    throw error;
  }
};