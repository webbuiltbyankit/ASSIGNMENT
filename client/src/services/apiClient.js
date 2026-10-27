import { appConfig } from '../config/appConfig';

/**
 * Standard HTTP Client for FORME API
 */
export async function apiClient(endpoint, {
  method = 'GET',
  body = null,
  headers = {},
  signal = null,
  timeout = appConfig.api.timeoutMs,
} = {}) {
  const url = `${appConfig.api.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (body && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // If external signal is provided, combine abort
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      credentials: 'same-origin', // HttpOnly session cookies are transmitted automatically
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Try parsing JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.code = data?.error?.code || `ERR_${response.status}`;
      error.details = data?.error?.details || null;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out or was cancelled');
      timeoutErr.status = 408;
      timeoutErr.code = 'ERR_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
}
