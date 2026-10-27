import { apiClient } from './apiClient';

export const authService = {
  /**
   * Register a new customer
   */
  async register({ email, password, name }) {
    return apiClient('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
  },

  /**
   * Log in user
   */
  async login({ email, password }) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Fetch current authenticated user principal
   */
  async getMe() {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Logout user and clear session cookie
   */
  async logout() {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },
};
