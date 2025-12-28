import { useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { CartContext } from '../services/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getTotal } = useContext(CartContext);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
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
