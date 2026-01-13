import { createContext } from 'preact';
import { useState, useEffect, useContext, useCallback } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import OfflineSync from './OfflineSyncService';
import { getNetworkStatus } from './NativeBridge';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Load cart from IndexedDB when user changes
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]); // Clear cart when logged out
    }
  }, [user]);

  // Load cart from IndexedDB
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      await OfflineSync.initOfflineDB();
      const cachedCart = await OfflineSync.getOfflineCart();

      if (cachedCart && cachedCart.length > 0) {
        // Filter cart items for current user
        const userCart = cachedCart.filter(item => item.userId === user?.id || !item.userId);
        setCart(userCart);
        console.log(`[CartContext] Loaded ${userCart.length} items from cache`);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('[CartContext] Failed to load cart:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save cart to IndexedDB whenever it changes
  useEffect(() => {
    if (user && cart.length >= 0) {
      saveCart();
    }
  }, [cart, user]);

  const saveCart = async () => {
    try {
      await OfflineSync.initOfflineDB();
      await OfflineSync.saveCart(cart);
    } catch (err) {
      console.error('[CartContext] Failed to save cart:', err);
    }
  };

  const addToCart = (product, quantity = 1) => {
    // Require user to be logged in before adding to cart
    if (!user) {
      // Show alert and redirect to login
      if (confirm('Please login to add items to cart. Would you like to login now?')) {
        // Use Capacitor's router or preact-router to navigate
        if (typeof window !== 'undefined' && window.route) {
          window.route('/login');
        } else {
          window.location.href = '/login';
        }
      }
      return;
    }

    // Normalize product ID - handle both 'id' and 'product_id' fields
    const productId = product.id || product.product_id;

    if (!productId) {
      console.error('Product has no valid ID:', product);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => (item.id || item.product_id) === productId);

      if (existingItem) {
        return prevCart.map(item =>
          (item.id || item.product_id) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Normalize the product object to always have 'id' field and add userId
      const normalizedProduct = {
        ...product,
        id: productId,
        productId: productId, // For IndexedDB key
        quantity,
        userId: user?.id
      };
      return [...prevCart, normalizedProduct];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => (item.id || item.product_id) !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        (item.id || item.product_id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setCart([]);
    // Clear from IndexedDB
    try {
      await OfflineSync.initOfflineDB();
      const allCart = await OfflineSync.getOfflineCart();
      // Delete only this user's cart items
      for (const item of allCart) {
        if (item.userId === user?.id || !item.userId) {
          await OfflineSync.db.delete('cart', item.productId);
        }
      }
    } catch (err) {
      console.error('[CartContext] Failed to clear cart:', err);
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
