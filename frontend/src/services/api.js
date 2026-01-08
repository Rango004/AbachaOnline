const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

class API {
  constructor() {
    this.baseURL = `${API_BASE}/api/v1`;
    this.token = localStorage.getItem('token');
    this.csrfToken = null;
    this.csrfTokenPromise = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      // Clear CSRF token when logging out
      this.csrfToken = null;
    }
  }

  // Fetch CSRF token with caching and deduplication
  async fetchCsrfToken() {
    // Return cached token if available
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // If already fetching, wait for the existing promise
    if (this.csrfTokenPromise) {
      return this.csrfTokenPromise;
    }

    // Fetch new token
    this.csrfTokenPromise = (async () => {
      try {
        const url = `${this.baseURL}/csrf-token`;
        const headers = {
          'Content-Type': 'application/json',
        };

        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          this.csrfToken = data.csrfToken;
          return this.csrfToken;
        }
        return null;
      } catch (error) {
        console.error('[API] Failed to fetch CSRF token:', error);
        return null;
      } finally {
        this.csrfTokenPromise = null;
      }
    })();

    return this.csrfTokenPromise;
  }

  // Invalidate CSRF token (e.g., after a 403 error)
  invalidateCsrfToken() {
    this.csrfToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Automatically add CSRF token for state-changing requests
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const publicAuthEndpoints = [
      '/auth/login',
      '/auth/login-pin',
      '/auth/login-email',
      '/auth/register',
      '/auth/verify-otp',
      '/auth/verify-login',
      '/auth/resend-otp',
      '/auth/refresh',
      '/auth/reset-password-request',
      '/auth/reset-password'
    ];

    // Add CSRF token for protected state-changing requests
    if (stateChangingMethods.includes(method) &&
        !publicAuthEndpoints.includes(endpoint)) {
      const csrfToken = await this.fetchCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for CSRF protection
      });

      const data = await response.json();

      // If CSRF token is invalid, invalidate cache and retry once
      if (response.status === 403 && data.code === 'EBADCSRFTOKEN') {
        this.invalidateCsrfToken();
        const newCsrfToken = await this.fetchCsrfToken();
        if (newCsrfToken) {
          headers['X-CSRF-Token'] = newCsrfToken;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData.message || retryData.error || 'Request failed');
          }
          return retryData;
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Axios-like helper methods for chatbot and other components
  async get(endpoint, options = {}) {
    const data = await this.request(endpoint, {
      ...options,
      method: 'GET',
    });
    return { data }; // Wrap for axios compatibility
  }

  async post(endpoint, body, options = {}) {
    const data = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data }; // Wrap for axios compatibility
  }

  async put(endpoint, body, options = {}) {
    const data = await this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return { data }; // Wrap for axios compatibility
  }

  async patch(endpoint, body, options = {}) {
    const data = await this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return { data }; // Wrap for axios compatibility
  }

  async delete(endpoint, options = {}) {
    const data = await this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
    return { data }; // Wrap for axios compatibility
  }

  async register(phone, name, pin, email = null, role = 'student') {
    const body = { phone, name, pin, role };
    if (email) {
      body.email = email;
    }
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async verifyOTP(phone, code) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async login(phone) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyLogin(phone, code) {
    const data = await this.request('/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async loginWithPIN(phone, pin) {
    const data = await this.request('/auth/login-pin', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async loginWithEmail(email, password) {
    const data = await this.request('/auth/login-email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  async checkUser(phone) {
    return this.request(`/auth/check-user?phone=${encodeURIComponent(phone)}`);
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async changePassword(currentPin, newPin) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPin, newPin }),
    });
  }

  async requestPasswordReset(identifier) {
    return this.request('/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async resetPassword(identifier, code, newPin) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, code, newPin }),
    });
  }

  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products?${params}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async getCategories() {
    return this.request('/products/categories');
  }

  async getMerchantProducts() {
    return this.request('/products/merchant/my-products');
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async bulkImportProducts(products) {
    return this.request('/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(orderId, reason) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async processPayment(orderId, paymentMethod = 'orange_money') {
    return this.request(`/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
  }

  async getOrderTracking(orderId) {
    return this.request(`/orders/${orderId}/tracking`);
  }

  async trackOrderByNumber(trackingNumber) {
    return this.request(`/orders/track/${trackingNumber}`);
  }

  async updateOrderStatus(orderId, status, notes, location) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes, location }),
    });
  }

  async assignRider(orderId, riderId) {
    return this.request(`/orders/${orderId}/assign-rider`, {
      method: 'POST',
      body: JSON.stringify({ rider_id: riderId }),
    });
  }

  async claimOrder(orderId) {
    return this.request(`/orders/${orderId}/claim`, {
      method: 'POST',
    });
  }

  async autoAssignRider(orderId) {
    return this.request(`/orders/${orderId}/auto-assign`, {
      method: 'POST',
    });
  }

  async verifyPickup(orderId, trackingNumber) {
    return this.request(`/rider-workflow/orders/${orderId}/verify-pickup`, {
      method: 'POST',
      body: JSON.stringify({ tracking_number: trackingNumber }),
    });
  }

  async verifyDelivery(orderId, pickupCode) {
    return this.request(`/rider-workflow/orders/${orderId}/verify-delivery`, {
      method: 'POST',
      body: JSON.stringify({ pickup_code: pickupCode }),
    });
  }

  async getRiderAvailableOrders() {
    return this.request('/rider-workflow/orders/available');
  }

  async getRiderActiveOrders() {
    return this.request('/rider-workflow/orders/active');
  }

  async getRiderOrderDetail(orderId) {
    return this.request(`/rider-workflow/orders/${orderId}`);
  }

  async claimOrderWorkflow(orderId) {
    return this.request(`/rider-workflow/orders/${orderId}/claim`, {
      method: 'POST',
    });
  }

  async getTokenBalance() {
    return this.request('/tokens/balance');
  }

  async redeemTokenPIN(pinCode) {
    return this.request('/tokens/redeem', {
      method: 'POST',
      body: JSON.stringify({ pin_code: pinCode }),
    });
  }

  async getTopupHistory(limit = 20) {
    return this.request(`/tokens/history?limit=${limit}`);
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getMerchantAudit() {
    return this.request('/admin/merchants');
  }

  async getRiderAudit() {
    return this.request('/admin/riders');
  }

  async getCustomerAudit() {
    return this.request('/admin/customers');
  }

  async getUserDetail(userId) {
    return this.request(`/admin/users/${userId}`);
  }

  async getOrderAudit(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/orders?${params}`);
  }

  async toggleUserStatus(userId, isVerified) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified: isVerified }),
    });
  }

  async refundOrder(orderId) {
    return this.request(`/admin/orders/${orderId}/refund`, {
      method: 'POST',
    });
  }

  async requestRefund(orderId, reason, photo, refundType) {
    return this.request(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason, photo, refund_type: refundType }),
    });
  }

  async initiateReturn(refundId, returnNotes) {
    return this.request(`/orders/refund-requests/${refundId}/initiate-return`, {
      method: 'POST',
      body: JSON.stringify({ return_notes: returnNotes }),
    });
  }

  async merchantVerifyReturn(refundId, verificationNotes) {
    return this.request(`/orders/refund-requests/${refundId}/verify-return`, {
      method: 'POST',
      body: JSON.stringify({ verification_notes: verificationNotes }),
    });
  }

  async getMerchantRefundRequests() {
    return this.request('/orders/refund-requests');
  }

  async approveRefund(refundId, response) {
    return this.request(`/orders/refund-requests/${refundId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  async rejectRefund(refundId, response) {
    return this.request(`/orders/refund-requests/${refundId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  async urgeRefund(refundId) {
    return this.request(`/orders/refund-requests/${refundId}/urge`, {
      method: 'POST',
    });
  }

  async escalateRefund(refundId) {
    return this.request(`/orders/refund-requests/${refundId}/escalate`, {
      method: 'POST',
    });
  }

  async getRefundStatus(orderId) {
    return this.request(`/orders/${orderId}/refund-status`);
  }

  async getEscalatedRefunds() {
    return this.request('/admin/refund-requests/escalated');
  }

  async adminReviewRefund(refundId, decision, adminNotes) {
    return this.request(`/admin/refund-requests/${refundId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, adminNotes }),
    });
  }

  // Notification methods
  async getNotifications(limit = 50, offset = 0) {
    return this.request(`/notifications?limit=${limit}&offset=${offset}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getAdminRevenue() {
    return this.request('/analytics/admin/revenue');
  }

  async getAdminSystemHealth() {
    return this.request('/analytics/admin/system-health');
  }

  async getAdminRefundAnalytics() {
    return this.request('/analytics/admin/refunds');
  }

  async getAdminOrdersStatus() {
    return this.request('/analytics/admin/orders/status');
  }

  async getAdminMerchantPerformance(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/analytics/admin/merchants/performance?${params.toString()}`);
  }

  async getAdminRiderPerformance(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/analytics/admin/riders/performance?${params.toString()}`);
  }

  async getRefundAudit() {
    return this.request('/admin/refund-requests');
  }

  async updateRefundStatus(refundId, status) {
    return this.request(`/admin/refund-requests/${refundId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Merchant Analytics methods
  async getMerchantAnalytics(days = 30) {
    const params = new URLSearchParams({ days });
    return this.request(`/analytics/merchant?${params.toString()}`);
  }

  async getMerchantDailyRevenue(days = 30) {
    const params = new URLSearchParams({ days });
    return this.request(`/analytics/merchant/daily-revenue?${params.toString()}`);
  }

  async getTopProducts(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/analytics/merchant/top-products?${params.toString()}`);
  }

  async getCategoryStats(days = 30) {
    const params = new URLSearchParams({ days });
    return this.request(`/analytics/merchant/categories?${params.toString()}`);
  }

  async getMerchantReviews(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/analytics/merchant/reviews?${params.toString()}`);
  }

  // Merchant Payment/Payout methods
  async getMerchantBalance() {
    return this.request('/merchant-payments/balance');
  }

  async getMerchantTransactions(limit = 20) {
    const params = new URLSearchParams({ limit });
    return this.request(`/merchant-payments/transactions?${params.toString()}`);
  }

  async getMerchantPayouts() {
    return this.request('/merchant/payouts');
  }

  async getPendingPayoutAmount() {
    return this.request('/merchant/payouts/pending');
  }

  async requestMerchantPayout() {
    return this.request('/merchant/payouts/request', {
      method: 'POST',
    });
  }

  // Review methods
  async createReview(orderId, rating, comment) {
    return this.request(`/reviews/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async getProductReviews(productId) {
    return this.request(`/reviews/product/${productId}`);
  }

  async getMerchantReviewsCustomer(merchantId) {
    return this.request(`/reviews/merchant/${merchantId}`);
  }

  async getMerchantRating(merchantId) {
    return this.request(`/reviews/merchant/${merchantId}/rating`);
  }

  async getOrderReview(orderId) {
    return this.request(`/reviews/order/${orderId}`);
  }

  // Recommendations
  async getRecommendations(limit = 10) {
    return this.request(`/recommendations?limit=${limit}`);
  }

  // Wishlists
  async getWishlist(limit = 20, offset = 0) {
    return this.request(`/wishlists?limit=${limit}&offset=${offset}`);
  }

  async addToWishlist(productId) {
    return this.request('/wishlists', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/wishlists/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist() {
    return this.request('/wishlists', {
      method: 'DELETE',
    });
  }

  async isInWishlist(productId) {
    return this.request(`/wishlists/check/${productId}`);
  }

  async checkMultipleWishlist(productIds) {
    return this.request('/wishlists/check-multiple', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
  }

  async getWishlistCount() {
    return this.request('/wishlists/count');
  }

  // Delivery Addresses
  async getAddresses(limit = 20, offset = 0) {
    return this.request(`/addresses?limit=${limit}&offset=${offset}`);
  }

  async getAddress(id) {
    return this.request(`/addresses/${id}`);
  }

  async getDefaultAddress() {
    return this.request('/addresses/default');
  }

  async getLocations() {
    return this.request('/addresses/locations');
  }

  async createAddress(addressData) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id, addressData) {
    return this.request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id) {
    return this.request(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id) {
    return this.request(`/addresses/${id}/set-default`, {
      method: 'POST',
    });
  }

  // Merchant Settings
  async getMerchantSettings() {
    return this.request('/merchant/settings', {
      method: 'GET',
    });
  }

  async updateMerchantBasicInfo(basicInfo) {
    return this.request('/merchant/settings/basic-info', {
      method: 'PUT',
      body: JSON.stringify(basicInfo),
    });
  }

  async updateMerchantBankDetails(bankInfo) {
    return this.request('/merchant/settings/bank-details', {
      method: 'PUT',
      body: JSON.stringify(bankInfo),
    });
  }

  async updateMerchantLocation(location) {
    return this.request('/merchant/settings/location', {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  async updateMerchantBusinessHours(businessHours) {
    return this.request('/merchant/settings/business-hours', {
      method: 'PUT',
      body: JSON.stringify(businessHours),
    });
  }

  // Rider metrics methods
  async getRiderStatistics() {
    return this.request('/rider/statistics');
  }

  async getRiderEarnings() {
    return this.request('/rider/earnings');
  }

  // Route Optimization
  async optimizeRiderRoutes(method = 'clarke_wright') {
    return this.request('/rider/routes/optimize', {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  async getRouteItinerary(routeId) {
    return this.request(`/rider/routes/${routeId}/itinerary`);
  }

  // Admin Settings
  async getAdminSettings() {
    return this.request('/admin-panel/settings');
  }

  async updateAdminSetting(key, value, description = null) {
    return this.request(`/admin-panel/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  }

  async updateRiderDeliveryFee(newFee) {
    return this.updateAdminSetting(
      'rider_delivery_fee',
      newFee,
      'Commission/fee paid to riders per delivery in Leone (Le)'
    );
  }

  // Admin User Management
  async createAdminUser(phone, name, role) {
    return this.request('/admin-panel/users', {
      method: 'POST',
      body: JSON.stringify({ phone, name, role }),
    });
  }

  async createMerchantWithEmail(email, name, phone) {
    return this.request('/admin-panel/merchants/create-with-email', {
      method: 'POST',
      body: JSON.stringify({ email, name, phone }),
    });
  }

  async deleteAdminUser(userId) {
    return this.request(`/admin-panel/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Predictions methods
  async getWeeklyPredictions() {
    return this.request('/merchant/predictions/weekly');
  }

  async getProductPredictions(limit = 10) {
    const params = new URLSearchParams({ limit });
    return this.request(`/merchant/predictions/products?${params.toString()}`);
  }

  async getInventoryAlerts() {
    return this.request('/merchant/predictions/inventory-alerts');
  }

  async getPredictionEvents() {
    return this.request('/merchant/predictions/events');
  }

  async getForecastAccuracy(daysBack = 7) {
    const params = new URLSearchParams({ days_back: daysBack });
    return this.request(`/merchant/predictions/accuracy?${params.toString()}`);
  }

  async addCustomEvent(eventData) {
    return this.request('/merchant/predictions/custom-event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async refreshPredictions() {
    return this.request('/merchant/predictions/refresh', {
      method: 'POST',
    });
  }

  async refreshAllPredictions() {
    return this.request('/admin/predictions/refresh-all', {
      method: 'POST',
    });
  }

  async refreshMerchantPredictions(merchantId) {
    return this.request(`/admin/predictions/refresh-merchant/${merchantId}`, {
      method: 'POST',
    });
  }

  async getPredictionsQueueStats() {
    return this.request('/admin/predictions/queue/stats');
  }

  async getPredictionsJobStatus(jobId) {
    return this.request(`/admin/predictions/queue/job/${jobId}`);
  }
}

export default new API();
