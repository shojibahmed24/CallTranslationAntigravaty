const API_BASE = 'http://localhost:5000/api';

export const adminApi = {
  getToken() {
    return localStorage.getItem('unicom_admin_token');
  },

  setToken(token) {
    localStorage.setItem('unicom_admin_token', token);
  },

  clearToken() {
    localStorage.removeItem('unicom_admin_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  },

  // Auth
  login(email, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  verify2FA(twoFactorToken, code) {
    return this.request('/admin/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ twoFactorToken, code })
    });
  },

  // Overview & Telemetry
  getOverview() {
    return this.request('/admin/overview');
  },

  getTelemetry() {
    return this.request('/admin/telemetry');
  },

  // Users
  getUsers(search = '') {
    return this.request(`/admin/users?search=${encodeURIComponent(search)}`);
  },

  updateUserQuota(userId, payload) {
    return this.request(`/admin/users/${userId}/quota`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // USDT Payments
  getPayments(status = '') {
    return this.request(`/admin/payments?status=${status}`);
  },

  reviewPayment(paymentId, action, reason = '') {
    return this.request(`/admin/payments/${paymentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  },

  // Settings & Audits
  getSettings() {
    return this.request('/admin/settings');
  },

  updateSettings(settings, confirmationPassword) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings, confirmationPassword })
    });
  },

  getAuditLogs() {
    return this.request('/admin/audit-logs');
  },

  // Support
  getSupportTickets() {
    return this.request('/admin/support/tickets');
  },

  replyTicket(ticketId, message, status = 'in_progress') {
    return this.request(`/admin/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message, status })
    });
  }
};
