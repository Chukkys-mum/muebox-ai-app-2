// utils/auth-helpers/server.ts

'use server';

import { getAuthTypes } from '@/utils/auth-helpers/settings';
import { getErrorRedirect, getStatusRedirect, getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function isValidEmail(email: string) {
  var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      pathName,
      'Hmm... Something went wrong.',
      'You could not be signed out.'
    );
  }

  return '/dashboard/signin';
}

export async function signInWithEmail(formData: FormData) {
  const cookieStore = await cookies();
  const callbackURL = getURL('/auth/callback');
  
  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      '/dashboard/signin/email_signin',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = await createClient();
  let options = {
    emailRedirectTo: callbackURL,
    shouldCreateUser: true
  };

  const { allowPassword } = getAuthTypes();
  if (allowPassword) options.shouldCreateUser = false;

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: options
    });

    if (error) {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/email_signin',
        'You could not be signed in.',
        error.message
      );
    } else if (data) {
      await cookieStore.set('preferredSignInView', 'email_signin', { path: '/' });
      redirectPath = getStatusRedirect(
        '/dashboard/signin/email_signin',
        'Success!',
        'Please check your email for a magic link. You may now close this tab.',
        true
      );
    } else {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/email_signin',
        'Hmm... Something went wrong.',
        'You could not be signed in.'
      );
    }
  } catch (error) {
    redirectPath = getErrorRedirect(
      '/dashboard/signin/email_signin',
      'An error occurred.',
      'Please try again.'
    );
  }

  return redirectPath;
}

export async function requestPasswordUpdate(formData: FormData) {
  try {
    const callbackURL = getURL('/auth/reset_password');
    const email = String(formData.get('email')).trim();
    let redirectPath: string;

    if (!isValidEmail(email)) {
      return getErrorRedirect(
        '/dashboard/signin/forgot_password',
        'Invalid email address.',
        'Please try again.'
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackURL
    });

    if (error) {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/forgot_password',
        error.message,
        'Please try again.'
      );
    } else if (data) {
      redirectPath = getStatusRedirect(
        '/dashboard/signin/forgot_password',
        'Success!',
        'Please check your email for a password reset link. You may now close this tab.',
        true
      );
    } else {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/forgot_password',
        'Hmm... Something went wrong.',
        'Password reset email could not be sent.'
      );
    }

    return redirectPath;
  } catch (error) {
    console.error('Password reset error:', error);
    return getErrorRedirect(
      '/dashboard/signin/forgot_password',
      'An unexpected error occurred.',
      'Please try again later.'
    );
  }
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = await cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  let redirectPath: string;

  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/password_signin',
        'Sign in failed.',
        error.message
      );
    } else if (data.user) {
      await cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
      redirectPath = getStatusRedirect('/dashboard/ai-chat', 'Success!', 'You are now signed in.');
    } else {
      redirectPath = getErrorRedirect(
        '/dashboard/signin/password_signin',
        'Hmm... Something went wrong.',
        'You could not be signed in.'
      );
    }
  } catch (error) {
    redirectPath = getErrorRedirect(
      '/dashboard/signin/password_signin',
      'An error occurred.',
      'Please try again.'
    );
  }

  return redirectPath;
}

export async function signUp(formData: FormData) {
  try {
    const callbackURL = getURL('/auth/callback');
    const email = String(formData.get('email')).trim();
    const password = String(formData.get('password')).trim();
    
    if (!isValidEmail(email) || !password || password.length < 6) {
      return getErrorRedirect(
        '/dashboard/signin/signup',
        'Invalid input',
        !isValidEmail(email) ? 'Invalid email format' : 'Password must be at least 6 characters'
      );
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackURL,
        data: {
          full_name: formData.get('full_name')?.toString() || '',
          avatar_url: ''
        }
      }
    });

    if (error?.message === 'User already registered') {
      return getErrorRedirect(
        '/dashboard/signin/password_signin',
        'Account exists', 
        'Please sign in with your password or reset it if forgotten.'
      );
    }

    if (error) {
      return getErrorRedirect('/dashboard/signin/signup', 'Sign up failed', error.message);
    }

    if (data.user) {
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          id: data.user.id,
          type: 'personal' as const,
          name: data.user.email!,
          status: 'active',
          trial_credits: 2000,
          credits: 0,
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString()
        });

      if (accountError) {
        console.error('Failed to create account:', accountError);
      }

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          id: `trial_${data.user.id}`,
          account_id: data.user.id,
          status: 'trialing' as const,
          credits: 0,
          trial_credits: 2000,
          created: new Date().toISOString(),
          trial_start: new Date().toISOString(), 
          trial_end: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString()
        });

      if (subscriptionError) {
        console.error('Failed to create subscription:', subscriptionError);
      }

      if (!data.session) {
        const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('Failed to sign in after signup:', signInError);
        } else {
          console.log('Successfully signed in after signup:', signInData);
        }
      }
    }

    const { data: { session } } = await supabase.auth.getSession();

    return getStatusRedirect(
      '/dashboard/ai-chat',
      'Success!', 
      session ? 'You are now signed in.' : 'Please check your email for confirmation.'
    );

  } catch (error) {
    console.error('Signup error:', error);
    return getErrorRedirect('/dashboard/signin/signup', 'Error', 'Please try again.');
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const password = String(formData.get('password')).trim();
    const passwordConfirm = String(formData.get('passwordConfirm')).trim();
    
    if (password !== passwordConfirm) {
      return getErrorRedirect(
        '/dashboard/signin/update_password',
        'Your password could not be updated.',
        'Passwords do not match.'
      );
    }

    if (!password) {
      return getErrorRedirect(
        '/dashboard/signin/update_password',
        'Your password could not be updated.',
        'Password cannot be empty.'
      );
    }

    const supabase = await createClient();
    const { error, data } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      return getErrorRedirect(
        '/dashboard/signin/update_password',
        'Your password could not be updated.',
        error.message
      );
    } else if (data.user) {
      return getStatusRedirect(
        '/',
        'Success!',
        'Your password has been updated.'
      );
    } else {
      return getErrorRedirect(
        '/dashboard/signin/update_password',
        'Hmm... Something went wrong.',
        'Your password could not be updated.'
      );
    }
  } catch (error) {
    console.error('Password update error:', error);
    return getErrorRedirect(
      '/dashboard/signin/update_password',
      'An unexpected error occurred.',
      'Please try again later.'
    );
  }
}

export async function updateEmail(formData: FormData) {
  try {
    const newEmail = String(formData.get('newEmail')).trim();
 
    if (!isValidEmail(newEmail)) {
      return getErrorRedirect(
        '/dashboard/settings',
        'Your email could not be updated.',
        'Invalid email address.'
      );
    }
 
    const supabase = await createClient();
    
    const callbackUrl = getURL(
      getStatusRedirect(
        '/dashboard/settings',
        'Success!',
        'Your email has been updated.'
      )
    );
 
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: callbackUrl
      }
    );
 
    if (error) {
      return getErrorRedirect(
        '/dashboard/settings',
        'Your email could not be updated.',
        error.message
      );
    }
 
    return getStatusRedirect(
      '/dashboard/settings',
      'Confirmation emails sent.',
      'You will need to confirm the update by clicking the links sent to both the old and new email addresses.'
    );
  } catch (error) {
    console.error('Email update error:', error);
    return getErrorRedirect(
      '/dashboard/settings',
      'An unexpected error occurred.',
      'Please try again later.'
    );
  }
}
 
export async function updateName(formData: FormData) {
  try {
    const fullName = String(formData.get('fullName')).trim();
 
    if (!fullName) {
      return getErrorRedirect(
        '/dashboard/settings',
        'Your name could not be updated.',
        'Name cannot be empty.'
      );
    }
 
    const supabase = await createClient();
    const { error, data } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
 
    if (error) {
      return getErrorRedirect(
        '/dashboard/settings',
        'Your name could not be updated.',
        error.message
      );
    } 
 
    if (!data.user) {
      return getErrorRedirect(
        '/dashboard/settings',
        'Hmm... Something went wrong.',
        'Your name could not be updated.'
      );
    }
 
    return getStatusRedirect(
      '/dashboard/settings',
      'Success!',
      'Your name has been updated.'
    );
 
  } catch (error) {
    console.error('Name update error:', error);
    return getErrorRedirect(
      '/dashboard/settings',
      'An unexpected error occurred.',
      'Please try again later.'
    );
  }
}