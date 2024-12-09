// /utils/cookies.ts

import { parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';

// Function to parse cookies from the request
export function parseCookies(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie');
  return cookieHeader ? parse(cookieHeader) : {};
}

// Function to set cookies in the response
export function setCookie(
  res: NextResponse,
  name: string,
  value: any,
  options: any = {}
) {
  const defaultOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const stringValue =
    typeof value === 'string' && value.startsWith('base64-')
      ? value
      : typeof value === 'object'
      ? 'j:' + JSON.stringify(value)
      : String(value);

  if (mergedOptions.maxAge) {
    mergedOptions.expires = new Date(Date.now() + mergedOptions.maxAge * 1000);
  }

  res.cookies.set(name, stringValue, mergedOptions);
}


// Function to get a specific cookie
export function getCookie(req: NextRequest, name: string) {
  console.log('getCookie called with name:', name);
  const cookies = parseCookies(req);
  const value = cookies[name];

  if (!value) return null;

  // Handle base64 encoded values
  if (value.startsWith('base64-')) {
    return parseBase64Cookie(value);
  }

  // Handle JSON encoded values
  if (value.startsWith('j:')) {
    try {
      return JSON.parse(value.slice(2));
    } catch (e) {
      console.error('Failed to parse cookie value:', e);
      return null;
    }
  }

  return value;
}


// Function to delete a cookie
export function deleteCookie(res: NextResponse, name: string, options: any = {}) {
  res.cookies.delete(name);
}

// Function to check if a cookie exists
export function hasCookie(req: NextRequest, name: string): boolean {
  const cookies = parseCookies(req);
  return name in cookies;
}

// Function to parse base64 cookie if needed
export function parseBase64Cookie(value: string): string | null {
  if (!value || !value.startsWith('base64-')) {
    return value;
  }

  try {
    return Buffer.from(value.substring(7), 'base64').toString('utf-8');
  } catch (e) {
    console.error('Failed to decode base64 cookie:', e);
    return null;
  }
}
