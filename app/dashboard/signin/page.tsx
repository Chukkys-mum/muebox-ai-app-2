// /app/dashboard/signin/page.tsx

import { getDefaultSignInView } from '@/utils/auth-helpers/settings';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const cookieStore = await cookies(); // Use 'await' to get cookies
  const preferredSignInView = cookieStore.get('preferredSignInView')?.value || 'default';
  const defaultView = getDefaultSignInView(preferredSignInView);

  // Redirect to the appropriate sign-in view
  redirect(`/dashboard/signin/${defaultView}`);
}
