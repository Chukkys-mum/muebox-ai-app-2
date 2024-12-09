// utils/auth-helpers/settings.ts

// Boolean toggles to determine which auth types are allowed
const allowOauth = true;
const allowEmail = true;
const allowPassword = true;

// Prefer client-side redirects for better UX
const allowServerRedirect = false;

// Validate settings
if (!allowPassword && !allowEmail) {
  throw new Error('At least one of allowPassword and allowEmail must be true');
}

// View types based on allowed auth methods
const viewTypes = [
  'email_signin',
  'password_signin', 
  'forgot_password',
  'update_password',
  'signup'
];

export const getAuthTypes = () => {
  return { allowOauth, allowEmail, allowPassword };
};

export const getViewTypes = () => viewTypes;

export const getDefaultSignInView = (preferredSignInView: string | null = null) => {
  const defaultView = allowPassword ? 'password_signin' : 'email_signin';
  if (preferredSignInView && viewTypes.includes(preferredSignInView)) {
    return preferredSignInView;
  }
  return defaultView;
};

export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};