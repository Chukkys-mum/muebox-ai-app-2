// components/auth/AuthUI.tsx

'use client';

import { useEffect } from 'react';
import EmailSignIn from '@/components/auth-ui/EmailSignIn';
import ForgotPassword from '@/components/auth-ui/ForgotPassword';
import OauthSignIn from '@/components/auth-ui/OauthSignIn';
import PasswordSignIn from '@/components/auth-ui/PasswordSignIn';
import Separator from '@/components/auth-ui/Separator';
import SignUp from '@/components/auth-ui/Signup';
import UpdatePassword from '@/components/auth-ui/UpdatePassword';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

interface AuthUIProps {
  viewProp: string;
  user: User | null;
  allowPassword: boolean;
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
  allowOauth: boolean;
  error?: string;
  errorDescription?: string;
}

export default function AuthUI({
  viewProp,
  user,
  allowPassword,
  allowEmail,
  redirectMethod,
  disableButton,
  allowOauth,
  error,
  errorDescription
}: AuthUIProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: error,
        description: errorDescription,
      });
    }
  }, [error, errorDescription, toast]);

  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      <p className="text-[32px] font-bold text-foreground dark:text-white">
        {viewProp === 'signup'
          ? 'Sign Up'
          : viewProp === 'forgot_password'
          ? 'Forgot Password'
          : viewProp === 'update_password'
          ? 'Update Password'
          : viewProp === 'email_signin'
          ? 'Email Sign In'
          : 'Sign In'}
      </p>
      <p className="mb-2.5 mt-2.5 font-normal text-foreground dark:text-zinc-400">
        {viewProp === 'signup'
          ? 'Enter your email and password to sign up!'
          : viewProp === 'forgot_password'
          ? 'Enter your email to get a password reset link!'
          : viewProp === 'update_password'
          ? 'Choose a new password for your account!'
          : viewProp === 'email_signin'
          ? 'Enter your email to get a magic link!'
          : 'Enter your email and password to sign in!'}
      </p>
      {viewProp !== 'update_password' &&
        viewProp !== 'signup' &&
        allowOauth && (
          <>
            <OauthSignIn />
            <Separator />
          </>
        )}
      {viewProp === 'password_signin' && (
        <PasswordSignIn
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
        />
      )}
      {viewProp === 'email_signin' && (
        <EmailSignIn
          allowPassword={allowPassword}
          redirectMethod={redirectMethod}
          disableButton={disableButton}
        />
      )}
      {viewProp === 'forgot_password' && (
        <ForgotPassword
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
          disableButton={disableButton}
        />
      )}
      {viewProp === 'update_password' && (
        <UpdatePassword redirectMethod={redirectMethod} />
      )}
      {viewProp === 'signup' && (
        <SignUp
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
        />
      )}
    </div>
  );
}