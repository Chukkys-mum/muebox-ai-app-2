// app/dashboard/signin/[id]/page.tsx

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

interface SignInPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ disable_button?: boolean }>;
}

export default async function SignIn({
  params,
  searchParams
}: SignInPageProps) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();
  const supabase = createClient();
  
  // Use Promise.all to await all async operations
  const [resolvedParams, resolvedSearchParams, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies()
  ]);

  const preferredSignInView = cookieStore.get('preferredSignInView')?.value || null;
  const { data: { session } } = await supabase.auth.getSession();

  // First, validate the view type
  const id = resolvedParams.id;
  if (!id || !viewTypes.includes(id)) {
    const defaultView = getDefaultSignInView(preferredSignInView);
    return redirect(`/dashboard/signin/${defaultView}`);
  }

  // Handle auth redirects
  if (session?.user && id !== 'update_password') {
    return redirect('/dashboard/main');
  }
  
  if (!session?.user && id === 'update_password') {
    return redirect('/dashboard/signin');
  }

  console.log('Rendering SignIn page', {
    requestedView: id,
    viewProp: id,
    user: session?.user ? 'Authenticated' : 'Not authenticated'
  });

  return (
    <DefaultAuth viewProp={id}>
      <AuthUI
        viewProp={id}
        user={session?.user || null} // Convert undefined to null
        allowPassword={allowPassword}
        allowEmail={allowEmail}
        redirectMethod={redirectMethod}
        disableButton={resolvedSearchParams.disable_button}
        allowOauth={allowOauth}
      />
    </DefaultAuth>
  );
}