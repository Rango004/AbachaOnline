import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (user) {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]); // Clear cart if no saved cart for this user
      }
    } else {
      setCart([]); // Clear cart when logged out
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, user]);

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

      // Normalize the product object to always have 'id' field
      const normalizedProduct = { ...product, id: productId, quantity };
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

  const clearCart = () => {
    setCart([]);
    // Also clear from localStorage
    if (user) {
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
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
