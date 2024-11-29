// /app/dashboard/signin/[id]/page.tsx

import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  try {
    const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
    const viewTypes = getViewTypes();
    const redirectMethod = getRedirectMethod();
    
    // Get user session first
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Early return for authenticated users
    if (session && params.id !== 'update_password') {
      return redirect('/dashboard/main');
    }

    // Handle view type determination
    let viewProp: string;
    if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
      viewProp = params.id;
    } else {
      const cookieStore = await cookies();
      const preferredSignInView = cookieStore.get('preferredSignInView');
      viewProp = getDefaultSignInView(preferredSignInView?.value || null);
      return redirect(`/dashboard/signin/${viewProp}`);
    }

    // Check for password update without session
    if (!session && viewProp === 'update_password') {
      return redirect('/dashboard/signin');
    }

    // Get user data for UI if needed
    const { data: { user } } = await supabase.auth.getUser();

    return (
      <DefaultAuth viewProp={viewProp}>
        <div>
          <AuthUI
            viewProp={viewProp}
            user={user}
            allowPassword={allowPassword}
            allowEmail={allowEmail}
            redirectMethod={redirectMethod}
            disableButton={searchParams?.disable_button}
            allowOauth={allowOauth}
          />
        </div>
      </DefaultAuth>
    );
  } catch (error) {
    // Only redirect if it's not already a redirect error
    if ((error as any)?.digest?.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    console.error('Sign in page error:', error);
    return redirect('/dashboard/signin');
  }
}