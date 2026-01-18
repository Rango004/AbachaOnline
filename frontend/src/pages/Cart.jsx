import { useContext, useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { CartContext } from '../services/CartContext';
import { getNetworkStatus } from '../services/NativeBridge';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getTotal } = useContext(CartContext);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkNetworkStatus();
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
    };
  }, []);

  const checkNetworkStatus = async () => {
    const { connected } = await getNetworkStatus();
    setIsOffline(!connected);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Allow checkout even when offline - Checkout page will handle queuing
    route('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div class="page cart-page">
        <div class="container">
          <h2>Shopping Cart</h2>
          <div class="empty-cart">
            <p>Your cart is empty</p>
            <a href="/products" class="btn-primary">Browse Products</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="page cart-page">
      <div class="container">
        {/* Offline Mode Banner */}
        {isOffline && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📡</span>
            <span style={{ color: '#e65100', fontWeight: '500' }}>
              Offline mode - Your cart is saved locally. You can still checkout and your order will be placed when you're back online.
            </span>
          </div>
        )}

        <h2>Shopping Cart ({cart.length} items)</h2>

        <div class="cart-items">
          {cart.map(item => (
            <div key={item.id} class="cart-item">
              <div class="item-info">
                <h3>{item.name}</h3>
                <p class="item-price">Le {parseFloat(item.price).toFixed(2)}</p>
              </div>

              <div class="item-controls">
                <div class="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  class="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>

              <div class="item-subtotal">
                Le {(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div class="cart-summary">
          <div class="total">
            <span>Total:</span>
            <strong>Le {getTotal().toFixed(2)}</strong>
          </div>

          <button class="btn-checkout" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
