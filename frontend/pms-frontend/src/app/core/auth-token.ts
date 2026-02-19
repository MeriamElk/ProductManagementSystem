export const TOKEN_KEY = 'pms_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface JwtPayload { exp?: number; [key: string]: any }

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function isJwtFormat(token: string): boolean {
  return token.split('.').length === 3;
}

export function getTokenPayload(token: string): JwtPayload | null {
  try {
    if (!isJwtFormat(token)) return null;

    const [, payload] = token.split('.');
    if (!payload) return null;

    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = getTokenPayload(token);

  const exp = payload?.exp;
  if (!payload || !exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;
  if (!isJwtFormat(token)) return false;
  return !isTokenExpired(token);
}
