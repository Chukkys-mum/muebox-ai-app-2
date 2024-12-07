// /app/dashboard/signin/[id]/page.tsx

import { ErrorBoundary } from '@/components/error-boundary';
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

async function getViewProps(params: { id: string }) {
  const cookieStore = await cookies();
  const preferredSignInView = cookieStore.get('preferredSignInView');
  const viewTypes = getViewTypes();
  
  if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
    return params.id;
  }
  
  return getDefaultSignInView(preferredSignInView?.value || null);
}

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  try {
    const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
    const redirectMethod = getRedirectMethod();
    
    const supabase = createClient();
    const [sessionResult, viewProp] = await Promise.all([
      supabase.auth.getSession(),
      getViewProps(params)
    ]);

    const session = sessionResult.data.session;
    
    if (session && params.id !== 'update_password') {
      return redirect('/dashboard/main');
    }

    if (viewProp !== params.id) {
      return redirect(`/dashboard/signin/${viewProp}`);
    }

    if (!session && viewProp === 'update_password') {
      return redirect('/dashboard/signin');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    return (
      <ErrorBoundary fallback={<DefaultAuth viewProp="error"><div>Authentication Error</div></DefaultAuth>}>
        <DefaultAuth viewProp={viewProp}>
          <AuthUI
            viewProp={viewProp}
            user={user}
            allowPassword={allowPassword}
            allowEmail={allowEmail}
            redirectMethod={redirectMethod}
            disableButton={searchParams?.disable_button}
            allowOauth={allowOauth}
          />
        </DefaultAuth>
      </ErrorBoundary>
    );
  } catch (error) {
    if ((error as any)?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Sign in error:', error);
    return redirect('/dashboard/signin');
  }
}