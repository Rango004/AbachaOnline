const db = require('../config/database');

class ProductService {
  async getProducts(filters = {}) {
    try {
      const {
        category,
        merchant_id,
        min_price,
        max_price,
        is_available,
        search,
        min_rating,
        sort_by,
        limit = 50,
        offset = 0
      } = filters;

      let query = `
        SELECT p.*,
               u.name as merchant_name,
               u.phone as merchant_phone,
               COALESCE(p.image_url, (p.images -> 0 ->> 'url')) as image,
               (p.images -> 0 ->> 'publicId') as public_id
        FROM products p
        LEFT JOIN users u ON p.merchant_id = u.id
        WHERE p.is_active = true
      `;
      const params = [];
      let paramIndex = 1;

      if (category) {
        query += ` AND p.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (merchant_id) {
        query += ` AND p.merchant_id = $${paramIndex}`;
        params.push(merchant_id);
        paramIndex++;
      }

      if (min_price !== undefined) {
        query += ` AND p.price >= $${paramIndex}`;
        params.push(min_price);
        paramIndex++;
      }

      if (max_price !== undefined) {
        query += ` AND p.price <= $${paramIndex}`;
        params.push(max_price);
        paramIndex++;
      }

      if (min_rating !== undefined) {
        query += ` AND p.avg_rating >= $${paramIndex}`;
        params.push(min_rating);
        paramIndex++;
      }

      if (search) {
        query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (sort_by === 'price_asc') {
        query += ` ORDER BY p.price ASC`;
      } else if (sort_by === 'price_desc') {
        query += ` ORDER BY p.price DESC`;
      } else if (sort_by === 'rating') {
        query += ` ORDER BY p.avg_rating DESC, p.review_count DESC`;
      } else if (sort_by === 'popular') {
        query += ` ORDER BY p.review_count DESC`;
      } else if (sort_by === 'newest') {
        query += ` ORDER BY p.created_at DESC`;
      } else {
        // Default: Randomize products for fair visibility across all merchants
        query += ` ORDER BY RANDOM()`;
      }

      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const result = await db.query(
        `SELECT p.*,
                u.name as merchant_name,
                u.phone as merchant_phone,
                u.zone_id as merchant_zone_id,
                COALESCE(p.image_url, (p.images -> 0 ->> 'url')) as image,
                (p.images -> 0 ->> 'publicId') as public_id
         FROM products p
         LEFT JOIN users u ON p.merchant_id = u.id
         WHERE p.id = $1`,
        [productId]
      );

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData, merchantId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const { name, description, price, category, images, stock_quantity } = productData;

      const merchantCheck = await client.query(
        'SELECT id, role FROM users WHERE id = $1',
        [merchantId]
      );

      if (merchantCheck.rows.length === 0) {
        throw new Error('Merchant not found');
      }

      if (merchantCheck.rows[0].role !== 'merchant') {
        throw new Error('Only merchants can create products');
      }

      const result = await client.query(
        `INSERT INTO products (merchant_id, name, description, price, category, images, stock_quantity, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [merchantId, name, description, price, category, JSON.stringify(images || []), stock_quantity || 0]
      );

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProduct(productId, updates, merchantId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const productCheck = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [productId]
      );

      if (productCheck.rows.length === 0) {
        throw new Error('Product not found');
      }

      if (productCheck.rows[0].merchant_id !== merchantId) {
        throw new Error('Unauthorized: You can only update your own products');
      }

      const allowedFields = ['name', 'description', 'price', 'category', 'images', 'stock_quantity', 'is_active'];
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(key === 'images' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(productId);

      const query = `
        UPDATE products
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await client.query(query, params);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteProduct(productId, merchantId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const productCheck = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [productId]
      );

      if (productCheck.rows.length === 0) {
        throw new Error('Product not found');
      }

      if (productCheck.rows[0].merchant_id !== merchantId) {
        throw new Error('Unauthorized: You can only delete your own products');
      }

      await client.query(
        'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1',
        [productId]
      );

      await client.query('COMMIT');

      return { message: 'Product deleted successfully', product_id: productId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCategories() {
    try {
      const result = await db.query(
        `SELECT DISTINCT category
         FROM products
         WHERE category IS NOT NULL AND is_active = true
         ORDER BY category`
      );

      return result.rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }

  async searchProducts(searchTerm, limit = 20) {
    try {
      const result = await db.query(
        `SELECT p.*,
                u.name as merchant_name
         FROM products p
         LEFT JOIN users u ON p.merchant_id = u.id
         WHERE (p.name ILIKE $1 OR p.description ILIKE $1)
           AND p.is_active = true
         ORDER BY p.created_at DESC
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getMerchantProducts(merchantId) {
    try {
      const result = await db.query(
        `SELECT * FROM products
         WHERE merchant_id = $1
         ORDER BY created_at DESC`,
        [merchantId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async bulkImportProducts(products, merchantId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const merchantCheck = await client.query(
        'SELECT id, role FROM users WHERE id = $1',
        [merchantId]
      );

      if (merchantCheck.rows.length === 0) {
        throw new Error('Merchant not found');
      }

      if (merchantCheck.rows[0].role !== 'merchant') {
        throw new Error('Only merchants can import products');
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < products.length; i++) {
        try {
          const { name, description, price, category, stock_quantity, image_url } = products[i];

          if (!name || !price) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Name and price are required`);
            continue;
          }

          if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Invalid price`);
            continue;
          }

          const images = image_url ? JSON.stringify([{ url: image_url, publicId: image_url }]) : null;

          await client.query(
            `INSERT INTO products (merchant_id, name, description, price, category, image_url, images, stock_quantity, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
            [merchantId, name, description || '', parseFloat(price), category || 'other', image_url || null, images, parseInt(stock_quantity) || 0]
          );

          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ProductService();
