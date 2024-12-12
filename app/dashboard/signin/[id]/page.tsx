// /app/dashboard/signin/[id]/page.tsx

import ErrorBoundary from '@/components/shared/error-boundary';
import DefaultAuth from '@/components/auth';
import AuthUI from '@/components/auth/AuthUI';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { cookies } from 'next/headers';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from '@/utils/auth-helpers/settings';

export default async function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();
  const supabase = await createClient();

  // Handle async param access with Promise.all
  const [requestedViewParams, searchParamsValue] = await Promise.all([
    Promise.resolve(params),
    Promise.resolve(searchParams),
  ]);

  const requestedView = String(requestedViewParams.id);
  const isValidView = viewTypes.includes(requestedView);

  // Handle view determination
  let viewProp: string;
  if (isValidView) {
    viewProp = requestedView;
  } else {
    // Get preferred view from cookies
    const cookieStore = await cookies();
    const preferredSignInView = cookieStore.get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);

    // Redirect to the correct view
    if (viewProp !== requestedView) {
      return redirect(`/dashboard/signin/${viewProp}`);
    }
  }

  // Check auth status
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user during signin:', error.message);
  }

  // Handle auth-based redirects
  if (user && viewProp !== 'update_password') {
    return redirect('/dashboard/ai-chat');
  }

  if (!user && viewProp === 'update_password') {
    return redirect('/dashboard/signin');
  }

  return (
    <DefaultAuth viewProp={viewProp}>
      <div>
        <AuthUI
          viewProp={viewProp}
          user={user}
          allowPassword={allowPassword}
          allowEmail={allowEmail}
          redirectMethod={redirectMethod}
          disableButton={searchParamsValue.disable_button}
          allowOauth={allowOauth}
        />
      </div>
    </DefaultAuth>
  );
}
