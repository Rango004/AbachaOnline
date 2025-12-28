const db = require('../config/database');

class RecommendationService {
  async getRecommendations(userId, limit = 10) {
    try {
      // 1. Get user's purchase history and preferences
      const userData = await this.getUserProfile(userId);
      const purchasedIds = userData.purchasedIds;
      const categoryPreferences = userData.categoryPreferences;

      // 2. If user is new (no purchase history), use location-based recommendations
      if (purchasedIds.length === 0) {
        return await this.getLocationBasedRecommendations(userId, limit);
      }

      // 3. Get recommendations from multiple sources
      const collaborativeBased = await this.getCollaborativeFilteringRecs(purchasedIds, limit);
      const contentBased = await this.getContentBasedRecs(categoryPreferences, purchasedIds, limit);
      const ratingBased = await this.getHighRatedProducts(purchasedIds, limit);
      const merchantBased = await this.getTopMerchantProducts(purchasedIds, limit);

      // 4. Combine all signals using hybrid scoring
      let recommendations = this.hybridScoring(
        collaborativeBased,
        contentBased,
        ratingBased,
        merchantBased,
        purchasedIds
      );

      // 5. Apply merchant diversity for fair representation
      recommendations = this.diversifyByMerchant(recommendations, limit);

      return recommendations.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId) {
    // Get purchase history - get one order per product, ordered by most recent
    const historyResult = await db.query(
      `SELECT oi.product_id, p.category
       FROM order_items oi
       JOIN (
         SELECT DISTINCT ON (oi2.product_id) oi2.product_id, o2.id as order_id, o2.created_at
         FROM order_items oi2
         JOIN orders o2 ON oi2.order_id = o2.id
         WHERE o2.student_id = $1 AND o2.order_status = 'delivered'
         ORDER BY oi2.product_id, o2.created_at DESC
       ) latest ON oi.product_id = latest.product_id AND oi.order_id = latest.order_id
       JOIN products p ON oi.product_id = p.id
       LIMIT 50`,
      [userId]
    );

    const purchasedIds = historyResult.rows.map(r => r.product_id);

    // Calculate category preferences based on purchase frequency
    const categoryScores = {};
    historyResult.rows.forEach(row => {
      if (row.category) {
        categoryScores[row.category] = (categoryScores[row.category] || 0) + 1;
      }
    });

    const categoryPreferences = Object.entries(categoryScores)
      .map(([category, count]) => ({ category, score: count }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 categories

    return { purchasedIds, categoryPreferences };
  }

  async getCollaborativeFilteringRecs(productIds, limit) {
    if (productIds.length === 0) return [];

    const result = await db.query(
      `SELECT oi2.product_id, p.name, p.price, p.category, p.avg_rating, p.review_count,
              u.name as merchant_name, u.id as merchant_id,
              COUNT(*) as co_purchase_freq
       FROM order_items oi1
       JOIN order_items oi2 ON oi1.order_id = oi2.order_id
       JOIN products p ON oi2.product_id = p.id
       LEFT JOIN users u ON p.merchant_id = u.id
       WHERE oi1.product_id = ANY($1)
       AND oi2.product_id != ALL($1)
       AND p.is_active = true
       GROUP BY oi2.product_id, p.name, p.price, p.category, p.avg_rating, p.review_count,
                u.name, u.id
       ORDER BY COUNT(*) DESC
       LIMIT $2`,
      [productIds, limit * 2]
    );

    return result.rows.map(r => ({
      product_id: r.product_id,
      name: r.name,
      price: parseFloat(r.price),
      category: r.category,
      rating: parseFloat(r.avg_rating) || 0,
      review_count: r.review_count || 0,
      merchant_id: r.merchant_id,
      merchant_name: r.merchant_name,
      co_purchase_freq: r.co_purchase_freq,
      signal: 'collaborative'
    }));
  }

  async getContentBasedRecs(categoryPreferences, excludeIds, limit) {
    if (categoryPreferences.length === 0) return [];

    const categories = categoryPreferences.map(p => p.category);

    const result = await db.query(
      `SELECT p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
              u.name as merchant_name, u.id as merchant_id
       FROM products p
       LEFT JOIN users u ON p.merchant_id = u.id
       WHERE p.category = ANY($1)
       AND p.is_active = true
       AND p.id != ALL($2)
       ORDER BY p.avg_rating DESC, p.review_count DESC
       LIMIT $3`,
      [categories, excludeIds, limit * 2]
    );

    return result.rows.map(r => ({
      product_id: r.id,
      name: r.name,
      price: parseFloat(r.price),
      category: r.category,
      rating: parseFloat(r.avg_rating) || 0,
      review_count: r.review_count || 0,
      merchant_id: r.merchant_id,
      merchant_name: r.merchant_name,
      signal: 'content-based'
    }));
  }

  async getHighRatedProducts(excludeIds, limit) {
    const result = await db.query(
      `SELECT p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
              u.name as merchant_name, u.id as merchant_id,
              COUNT(oi.id) as recent_orders
       FROM products p
       LEFT JOIN users u ON p.merchant_id = u.id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at > NOW() - INTERVAL '30 days'
       WHERE p.is_active = true
       AND p.id != ALL($1)
       AND p.avg_rating >= 3.5
       AND p.review_count > 0
       GROUP BY p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
                u.name, u.id
       ORDER BY p.avg_rating DESC, p.review_count DESC, COUNT(oi.id) DESC
       LIMIT $2`,
      [excludeIds, limit * 2]
    );

    return result.rows.map(r => ({
      product_id: r.id,
      name: r.name,
      price: parseFloat(r.price),
      category: r.category,
      rating: parseFloat(r.avg_rating) || 0,
      review_count: r.review_count || 0,
      merchant_id: r.merchant_id,
      merchant_name: r.merchant_name,
      recent_orders: r.recent_orders || 0,
      signal: 'rating-based'
    }));
  }

  async getTopMerchantProducts(excludeIds, limit) {
    const result = await db.query(
      `SELECT p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
              u.name as merchant_name, u.id as merchant_id,
              COUNT(oi.id) as sales_count
       FROM products p
       LEFT JOIN users u ON p.merchant_id = u.id
       LEFT JOIN order_items oi ON p.id = oi.product_id
       WHERE p.is_active = true
       AND p.id != ALL($1)
       AND p.avg_rating >= 2.0
       GROUP BY p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
                u.name, u.id
       ORDER BY COUNT(oi.id) DESC, p.avg_rating DESC
       LIMIT $2`,
      [excludeIds, limit * 2]
    );

    return result.rows.map(r => ({
      product_id: r.id,
      name: r.name,
      price: parseFloat(r.price),
      category: r.category,
      rating: parseFloat(r.avg_rating) || 0,
      review_count: r.review_count || 0,
      merchant_id: r.merchant_id,
      merchant_name: r.merchant_name,
      merchant_rating: 0,
      sales_count: r.sales_count || 0,
      signal: 'merchant-quality'
    }));
  }

  hybridScoring(collaborative, contentBased, ratingBased, merchantBased, excludeIds) {
    const scoreMap = {};

    // Weight factors for each signal type
    const weights = {
      'collaborative': 0.35,      // Products bought together
      'content-based': 0.25,       // Similar category products
      'rating-based': 0.25,        // High-rated products
      'merchant-quality': 0.15     // From trusted merchants
    };

    // Helper function to create base item object with merchant info
    const createItemObject = (item) => ({
      id: item.product_id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      category: item.category,
      rating: item.rating,
      avg_rating: item.rating,
      review_count: item.review_count,
      merchant_id: item.merchant_id,
      merchant_name: item.merchant_name,
      score: 0,
      signals: []
    });

    // Process collaborative filtering
    collaborative.forEach(item => {
      const key = item.product_id;
      if (scoreMap[key]) {
        scoreMap[key].signals.push('Frequently bought together');
      } else {
        scoreMap[key] = createItemObject(item);
        scoreMap[key].signals = ['Frequently bought together'];
      }
      // Normalize co-purchase frequency (0-10 scale)
      const freqScore = Math.min(10, item.co_purchase_freq * 2);
      scoreMap[key].score += freqScore * weights['collaborative'];
    });

    // Process content-based
    contentBased.forEach(item => {
      const key = item.product_id;
      if (scoreMap[key]) {
        scoreMap[key].signals.push('In your favorite categories');
      } else {
        scoreMap[key] = createItemObject(item);
        scoreMap[key].signals = ['In your favorite categories'];
      }
      // Category preference score (0-10 scale)
      scoreMap[key].score += Math.min(10, item.rating * 2) * weights['content-based'];
    });

    // Process rating-based
    ratingBased.forEach(item => {
      const key = item.product_id;
      if (scoreMap[key]) {
        scoreMap[key].signals.push('Highly rated');
      } else {
        scoreMap[key] = createItemObject(item);
        scoreMap[key].signals = ['Highly rated'];
      }
      // Rating score (0-10 scale, already 0-5)
      scoreMap[key].score += item.rating * 2 * weights['rating-based'];
    });

    // Process merchant quality
    merchantBased.forEach(item => {
      const key = item.product_id;
      if (scoreMap[key]) {
        scoreMap[key].signals.push(`From trusted merchant (${item.merchant_name})`);
      } else {
        scoreMap[key] = createItemObject(item);
        scoreMap[key].signals = [`From trusted merchant (${item.merchant_name})`];
      }
      // Merchant quality score (0-10 scale)
      scoreMap[key].score += item.merchant_rating * 2 * weights['merchant-quality'];
    });

    // Remove duplicates from signals
    Object.values(scoreMap).forEach(item => {
      item.signals = [...new Set(item.signals)];
    });

    // Sort by score and filter
    return Object.values(scoreMap)
      .filter(item => !excludeIds.includes(item.product_id))
      .sort((a, b) => b.score - a.score);
  }

  diversifyByMerchant(recommendations, limit) {
    // Group recommendations by merchant
    const merchantGroups = {};
    recommendations.forEach(item => {
      const merchantId = item.merchant_id || 'unknown';
      if (!merchantGroups[merchantId]) {
        merchantGroups[merchantId] = [];
      }
      merchantGroups[merchantId].push(item);
    });

    // Calculate max products per merchant for fair representation
    // For top 50: allow ~5 per merchant to get diverse options
    const maxPerMerchant = Math.max(2, Math.floor(limit / 10));

    // Build diverse list by selecting from different merchants
    const diverseList = [];
    const merchantIndices = {};

    // Initialize merchant indices
    Object.keys(merchantGroups).forEach(merchantId => {
      merchantIndices[merchantId] = 0;
    });

    // Round-robin through merchants to ensure diversity
    let merchantIds = Object.keys(merchantGroups);
    let currentMerchantIdx = 0;

    while (diverseList.length < limit && diverseList.length < recommendations.length) {
      // Cycle through merchants
      const merchantId = merchantIds[currentMerchantIdx % merchantIds.length];
      const merchantProducts = merchantGroups[merchantId];
      const currentIdx = merchantIndices[merchantId];

      // Add product if merchant hasn't exceeded quota
      if (currentIdx < merchantProducts.length && currentIdx < maxPerMerchant) {
        const product = { ...merchantProducts[currentIdx] };

        // Add merchant diversity signal for "similar items from other merchants"
        if (!product.signals) {
          product.signals = [];
        }
        if (currentIdx > 0) {
          // For additional items from same merchant, note they're similar items
          if (!product.signals.includes(`Similar items from ${product.merchant_name}`)) {
            product.signals.unshift(`Similar items from ${product.merchant_name}`);
          }
        }

        diverseList.push(product);
        merchantIndices[merchantId]++;
      }

      currentMerchantIdx++;

      // Break if we've cycled through all merchants and none have more items
      if (currentMerchantIdx >= merchantIds.length * maxPerMerchant) {
        break;
      }
    }

    // If we still need more items, add remaining highest-scored products
    if (diverseList.length < limit) {
      const addedIds = new Set(diverseList.map(p => p.product_id));
      const remaining = recommendations
        .filter(item => !addedIds.has(item.product_id))
        .slice(0, limit - diverseList.length);

      diverseList.push(...remaining);
    }

    return diverseList;
  }

  async getLocationBasedRecommendations(userId, limit = 10) {
    try {
      // 1. Get user's location
      const userLocationResult = await db.query(
        `SELECT latitude, longitude FROM users WHERE id = $1`,
        [userId]
      );

      if (userLocationResult.rows.length === 0 || !userLocationResult.rows[0].latitude) {
        // If user location not available, return top-rated products
        return await this.getTopRatedFallback(limit);
      }

      const userLat = parseFloat(userLocationResult.rows[0].latitude);
      const userLon = parseFloat(userLocationResult.rows[0].longitude);

      // 2. Get nearby merchants using distance calculation
      // Using Haversine formula: 6371 km is Earth's radius
      const nearbyMerchants = await db.query(
        `SELECT u.id, u.name, u.latitude, u.longitude,
                (6371 * acos(cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(u.latitude)))) AS distance
         FROM users u
         WHERE u.role = 'merchant'
         AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
         ORDER BY distance ASC
         LIMIT 5`,
        [userLat, userLon]
      );

      if (nearbyMerchants.rows.length === 0) {
        return await this.getTopRatedFallback(limit);
      }

      const merchantIds = nearbyMerchants.rows.map(m => m.id);

      // 3. Get balanced products from nearby merchants using DISTINCT ON for fair distribution
      const productsResult = await db.query(
        `WITH ranked_products AS (
          SELECT p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
                 u.name as merchant_name, u.id as merchant_id,
                 (6371 * acos(cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) +
                 sin(radians($1)) * sin(radians(u.latitude)))) AS distance,
                 ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY
                   COALESCE(p.avg_rating, 0) DESC,
                   COALESCE(p.review_count, 0) DESC,
                   p.id) as rn
          FROM products p
          JOIN users u ON p.merchant_id = u.id
          WHERE p.merchant_id = ANY($3)
          AND p.is_active = true
          AND p.stock_quantity > 0
        )
        SELECT id, name, price, category, avg_rating, review_count,
               merchant_name, merchant_id, distance
        FROM ranked_products
        WHERE rn <= $4
        ORDER BY COALESCE(avg_rating, 0) DESC, COALESCE(review_count, 0) DESC, distance ASC`,
        [userLat, userLon, merchantIds, Math.ceil(limit / merchantIds.length) + 2]
      );

      // 4. Score products by proximity and rating
      let recommendations = productsResult.rows.map(p => {
        const proximityScore = Math.max(0, 10 - (p.distance || 100)); // 0-10 based on distance
        const ratingScore = (p.avg_rating || 0) * 2; // 0-10 based on rating

        return {
          id: p.id,
          product_id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          category: p.category,
          rating: parseFloat(p.avg_rating) || 0,
          avg_rating: parseFloat(p.avg_rating) || 0,
          review_count: p.review_count || 0,
          merchant_id: p.merchant_id,
          merchant_name: p.merchant_name,
          distance: (p.distance || 0).toFixed(2),
          score: proximityScore * 0.4 + ratingScore * 0.6, // Weighted score
          signals: [
            `Near you (${(p.distance || 0).toFixed(1)} km away)`,
            p.avg_rating >= 4 ? 'Highly rated' : p.avg_rating >= 3 ? 'Well reviewed' : 'New merchant'
          ]
        };
      });

      // 5. Apply merchant diversity to ensure fair representation across merchants
      recommendations = this.diversifyByMerchant(recommendations, limit);

      return recommendations.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  async getTopRatedFallback(limit) {
    const result = await db.query(
      `SELECT p.id, p.name, p.price, p.category, p.avg_rating, p.review_count,
              u.name as merchant_name, u.id as merchant_id
       FROM products p
       JOIN users u ON p.merchant_id = u.id
       WHERE p.is_active = true
       AND p.stock_quantity > 0
       AND p.avg_rating IS NOT NULL
       ORDER BY p.avg_rating DESC, p.review_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(p => ({
      id: p.id,
      product_id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      category: p.category,
      rating: parseFloat(p.avg_rating) || 0,
      avg_rating: parseFloat(p.avg_rating) || 0,
      review_count: p.review_count || 0,
      merchant_id: p.merchant_id,
      merchant_name: p.merchant_name,
      score: (parseFloat(p.avg_rating) || 0) * 2,
      signals: ['Highly rated', 'Top pick']
    }));
  }

  async getDemandForecast(productId, days = 7) {
    // Simple moving average forecast
    const result = await db.query(
      `SELECT DATE(o.created_at) as date, SUM(oi.quantity) as quantity
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.product_id = $1
       AND o.created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(o.created_at)
       ORDER BY DATE(o.created_at)`,
      [productId]
    );

    if (result.rows.length === 0) {
      return { predicted_demand: 1, trend: 'stable' };
    }

    const quantities = result.rows.map(r => parseInt(r.quantity));
    const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length;
    const recent = quantities.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, quantities.length);

    return {
      predicted_demand: Math.ceil(avg * days),
      daily_average: Math.ceil(avg),
      trend: recent > avg ? 'increasing' : recent < avg ? 'decreasing' : 'stable'
    };
  }

  async getInventoryRecommendations(merchantId) {
    const result = await db.query(
      `SELECT p.id, p.name, p.stock_quantity,
              COUNT(oi.id) as orders_30d,
              SUM(oi.quantity) as sold_30d
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at > NOW() - INTERVAL '30 days'
       WHERE p.merchant_id = $1 AND p.is_active = true
       GROUP BY p.id
       ORDER BY COUNT(oi.id) DESC`,
      [merchantId]
    );

    const recommendations = [];

    for (const row of result.rows) {
      const forecast = await this.getDemandForecast(row.id, 7);
      const currentStock = row.stock_quantity || 0;
      const weeklyDemand = forecast.predicted_demand;

      let recommendation = 'maintain';
      let suggestedOrder = 0;

      if (currentStock < weeklyDemand * 0.5) {
        recommendation = 'restock';
        suggestedOrder = Math.ceil(weeklyDemand * 2 - currentStock);
      } else if (currentStock > weeklyDemand * 3) {
        recommendation = 'reduce';
      }

      recommendations.push({
        product_id: row.id,
        product_name: row.name,
        current_stock: currentStock,
        predicted_demand: weeklyDemand,
        recommendation,
        suggested_order: suggestedOrder,
        trend: forecast.trend
      });
    }

    return recommendations;
  }
}

module.exports = new RecommendationService();
