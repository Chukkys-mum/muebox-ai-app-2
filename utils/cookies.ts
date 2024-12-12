// /utils/cookies.ts

import { parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Function to parse cookies from the request
export function parseCookies(req: NextRequest): Record<string, string> {
  try {
    const cookieHeader = req.headers.get('cookie');
    return cookieHeader ? parse(cookieHeader) : {};
  } catch (error) {
    logger.warn('Failed to parse cookies', { error });
    return {};
  }
}

// Function to set cookies in the response
export function setCookie(
  res: NextResponse,
  name: string,
  value: any,
  options: CookieOptions = {}
): void {
  try {
    const stringValue =
      typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

    if (options.maxAge) {
      options.expires = new Date(Date.now() + options.maxAge * 1000);
    }

    res.cookies.set(name, stringValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...options,
    });
  } catch (error) {
    logger.error('Failed to set cookie', { error, name, value, options });
  }
}

// Function to get a specific cookie
export function getCookie(req: NextRequest, name: string): any {
  try {
    const cookies = parseCookies(req);
    const value = cookies[name];
    if (value && value.startsWith('j:')) {
      return JSON.parse(value.slice(2));
    }
    return value;
  } catch (error) {
    logger.error('Failed to get cookie', { error, name });
    return null;
  }
}
