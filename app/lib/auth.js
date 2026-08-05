import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from './authConstants';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable. Please add it to .env');
}

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE_SECONDS });
}

export function setAuthCookie(token) {
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS
  });
}

export function clearAuthCookie() {
  cookies().set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export function getCurrentUserId() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
}
