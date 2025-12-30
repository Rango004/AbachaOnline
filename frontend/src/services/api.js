const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

class API {
  constructor() {
    this.baseURL = `${API_BASE}/api/v1`;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for CSRF protection
      });

      const data = await response.json();

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

  async checkUser(phone) {
    return this.request(`/auth/check-user?phone=${encodeURIComponent(phone)}`);
  }

  async getProfile() {
    return this.request('/auth/profile');
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
    // Get CSRF token for protected POST request
    const csrfToken = await this.getCsrfToken();

    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return this.request('/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId, productData) {
    // Get CSRF token for protected PUT request
    const csrfToken = await this.getCsrfToken();

    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return this.request(`/products/${productId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId) {
    // Get CSRF token for protected DELETE request
    const csrfToken = await this.getCsrfToken();

    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return this.request(`/products/${productId}`, {
      method: 'DELETE',
      headers,
    });
  }

  async bulkImportProducts(products) {
    // Get CSRF token for protected POST request
    const csrfToken = await this.getCsrfToken();

    const body = { products };
    if (csrfToken) {
      body._csrf = csrfToken;
    }

    return this.request('/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createOrder(orderData) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers,
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(orderId, reason) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      headers,
    });
  }

  async processPayment(orderId, paymentMethod = 'orange_money') {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
      headers,
    });
  }

  async getOrderTracking(orderId) {
    return this.request(`/orders/${orderId}/tracking`);
  }

  async trackOrderByNumber(trackingNumber) {
    return this.request(`/orders/track/${trackingNumber}`);
  }

  async updateOrderStatus(orderId, status, notes, location) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes, location }),
      headers,
    });
  }

  async assignRider(orderId, riderId) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/assign-rider`, {
      method: 'POST',
      body: JSON.stringify({ rider_id: riderId }),
      headers,
    });
  }

  async claimOrder(orderId) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/claim`, {
      method: 'POST',
      headers,
    });
  }

  async autoAssignRider(orderId) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/orders/${orderId}/auto-assign`, {
      method: 'POST',
      headers,
    });
  }

  async verifyPickup(orderId, trackingNumber) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/rider-workflow/orders/${orderId}/verify-pickup`, {
      method: 'POST',
      body: JSON.stringify({ tracking_number: trackingNumber }),
      headers,
    });
  }

  async verifyDelivery(orderId, pickupCode) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/rider-workflow/orders/${orderId}/verify-delivery`, {
      method: 'POST',
      body: JSON.stringify({ pickup_code: pickupCode }),
      headers,
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
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/tokens/redeem', {
      method: 'POST',
      body: JSON.stringify({ pin_code: pinCode }),
      headers,
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
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers,
    });
  }

  async markAllAsRead() {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
      headers,
    });
  }

  async deleteNotification(notificationId) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers,
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
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
      headers,
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
    const csrfToken = await this.getCsrfToken();
    const body = { method };
    if (csrfToken) {
      body._csrf = csrfToken;
    }
    return this.request('/rider/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getRouteItinerary(routeId) {
    return this.request(`/rider/routes/${routeId}/itinerary`);
  }

  // CSRF Token management
  async getCsrfToken() {
    try {
      const response = await this.request('/csrf-token');
      return response.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  }

  // Admin Settings
  async getAdminSettings() {
    return this.request('/admin-panel/settings');
  }

  async updateAdminSetting(key, value, description = null) {
    // Get CSRF token for protected PUT request
    const csrfToken = await this.getCsrfToken();

    const body = { value, description };
    if (csrfToken) {
      body._csrf = csrfToken;
    }

    return this.request(`/admin-panel/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async updateRiderDeliveryFee(newFee) {
    return this.updateAdminSetting(
      'rider_delivery_fee',
      newFee,
      'Commission/fee paid to riders per delivery in Leone (Le)'
    );
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
    const csrfToken = await this.getCsrfToken();
    const body = eventData;
    if (csrfToken) {
      body._csrf = csrfToken;
    }
    return this.request('/merchant/predictions/custom-event', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async refreshPredictions() {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/merchant/predictions/refresh', {
      method: 'POST',
      headers,
    });
  }

  async refreshAllPredictions() {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request('/admin/predictions/refresh-all', {
      method: 'POST',
      headers,
    });
  }

  async refreshMerchantPredictions(merchantId) {
    const csrfToken = await this.getCsrfToken();
    const headers = {};
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return this.request(`/admin/predictions/refresh-merchant/${merchantId}`, {
      method: 'POST',
      headers,
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
