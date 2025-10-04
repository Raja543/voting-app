import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  image?: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  isEmailVerified: boolean;
  provider: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export function createSession(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { 
    expiresIn: SESSION_DURATION,
    issuer: 'voting-app',
    audience: 'voting-app-users'
  });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'voting-app',
      audience: 'voting-app-users'
    }) as SessionUser;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): SessionUser | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getServerSession(): SessionUser | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    return verifySession(token);
  } catch (error) {
    console.error('Server session error:', error);
    return null;
  }
}

export function createSecureCookie(token: string) {
  return {
    name: 'auth-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION,
    path: '/'
  };
}

export function clearAuthCookie() {
  return {
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/'
  };
}

// Client-side session management
export class ClientSession {
  static setUser(user: SessionUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  static getUser(): SessionUser | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static clearUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  static async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      this.clearUser();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
