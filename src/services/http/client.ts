import { apiBaseUrl } from '../config';
import { ServiceError } from '../types';

/**
 * Minimal fetch wrapper for the real backend. Only the transport lives here;
 * endpoints are defined in the individual http services.
 */
export async function http<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  if (!apiBaseUrl) throw new ServiceError('EXPO_PUBLIC_API_URL is not configured', 'unavailable');
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ServiceError('Network request failed', 'network');
  }
  if (response.status === 404) throw new ServiceError('Not found', 'not_found');
  if (!response.ok) throw new ServiceError(`Request failed (${response.status})`, 'unknown');
  return (await response.json()) as T;
}
