// API base is relative to leverage Vite's proxy for HTTPS Mixed Content bypass
const API_BASE = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('unicom_user_token');
  },

  setToken(token) {
    localStorage.setItem('unicom_user_token', token);
  },

  clearToken() {
    localStorage.removeItem('unicom_user_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.code = data.code;
      throw err;
    }
    return data;
  },

  // Auth
  requestOtp(phone, mode) {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, mode })
    });
  },

  verifyFirebaseToken(idToken, deviceId) {
    return this.request('/auth/verify-firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken, deviceId })
    });
  },

  verifyOtp(phone, code, deviceId) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, deviceId })
    });
  },

  devDemoLogin(userId, deviceId) {
    return this.request('/auth/dev-demo-login', {
      method: 'POST',
      body: JSON.stringify({ userId, deviceId })
    });
  },

  getProfile() {
    return this.request('/auth/profile');
  },

  updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  blockUser(blockedId) {
    return this.request('/users/block', { method: 'POST', body: JSON.stringify({ blockedId }) });
  },

  unblockUser(blockedId) {
    return this.request(`/users/block/${blockedId}`, { method: 'DELETE' });
  },

  getBlockedUsers() {
    return this.request('/users/blocked');
  },

  muteChat(chatId) {
    return this.request('/chat/mute', { method: 'POST', body: JSON.stringify({ chatId }) });
  },

  unmuteChat(chatId) {
    return this.request(`/chat/mute/${chatId}`, { method: 'DELETE' });
  },

  getChatMedia(chatId) {
    return this.request(`/chat/media/${chatId}`);
  },

  deleteAccount() {
    return this.request('/auth/account', {
      method: 'DELETE'
    });
  },

  // Chats & Messaging
  getConversations() {
    return this.request('/chat/conversations');
  },

  getMessages(contactId, page = 1) {
    return this.request(`/chat/messages/${contactId}?page=${page}&limit=50`);
  },

  sendMessage(messageData) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },

  reactToMessage(messageId, emoji) {
    return this.request(`/chat/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    });
  },

  deleteMessage(messageId) {
    return this.request(`/chat/messages/${messageId}`, {
      method: 'DELETE'
    });
  },

  uploadFile(file, type = 'chat') {
    const formData = new FormData();
    // Use file.name if it exists and has an extension, otherwise build one from mimetype
    let fileName = file.name || '';
    if (!fileName || !fileName.includes('.')) {
      const ext = file.type ? file.type.split('/')[1] : 'bin';
      fileName = fileName ? `${fileName}.${ext}` : `upload.${ext}`;
    }
    // Handle edge case where type is image/jpeg but browser returns just jpeg
    if (fileName.endsWith('.jpeg')) fileName = fileName.replace('.jpeg', '.jpg');
    
    formData.append('file', file, fileName);
    return this.request(`/storage/upload?type=${type}`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // Calls
  joinCall(callId) {
    return this.request(`/calls/${callId}/join`, {
      method: 'POST'
    });
  },

  initiateCall(receiverId) {
    return this.request('/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ receiverId })
    });
  },

  endCall(callId, durationSeconds, avgLatencyMs) {
    return this.request('/calls/end', {
      method: 'POST',
      body: JSON.stringify({ callId, durationSeconds, avgLatencyMs })
    });
  },

  getCallHistory() {
    return this.request('/calls/history');
  },

  deleteCallLog(callId) {
    return this.request(`/calls/${callId}`, { method: 'DELETE' });
  },

  reportCallIssue(callId, reason, details) {
    return this.request('/calls/report-issue', {
      method: 'POST',
      body: JSON.stringify({ callId, reason, details })
    });
  },

  // Payments & USDT
  getPlansAndWallet() {
    return this.request('/payments/plans-wallet');
  },

  submitUsdtPayment(planId, txHash) {
    return this.request('/payments/submit-usdt', {
      method: 'POST',
      body: JSON.stringify({ planId, txHash })
    });
  },

  createStripeCheckout(planId) {
    return this.request('/payments/stripe-checkout', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  },

  // Support
  createTicket(category, subject, initialMessage) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ category, subject, initialMessage })
    });
  },

  getUserTickets() {
    return this.request('/support/tickets');
  },

  replyTicket(ticketId, message) {
    return this.request(`/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
};
