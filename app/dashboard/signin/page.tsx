// /app/dashboard/signin/page.tsx

import { getDefaultSignInView } from '@/utils/auth-helpers/settings';
import { redirect } from 'next/navigation';

export default function SignIn() {
  const defaultView = getDefaultSignInView();
  return redirect(`/dashboard/signin/${defaultView}`);
}