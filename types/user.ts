// types/user.ts

export const DEFAULT_USER_CREDITS = 10;

// You can add other user-related types and constants here
// User interface
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits?: number;
}


export interface UserPreferences {
  // ... user preference properties
}

// ... other user-related types and constants