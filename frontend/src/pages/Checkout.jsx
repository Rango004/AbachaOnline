import { useState, useContext, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { CartContext } from '../services/CartContext';
import { AddressContext } from '../services/AddressContext';
import api from '../services/api';

export default function Checkout() {
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const { addresses, defaultAddress, locations, loadAddresses } = useContext(AddressContext);

  const [addressMode, setAddressMode] = useState('saved'); // 'saved' or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [locationId, setLocationId] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddresses();
    if (defaultAddress?.id) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalDeliveryAddress = '';
      let finalNotes = notes;

      // Determine which address to use
      if (addressMode === 'saved' && selectedAddressId) {
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddr) {
          throw new Error('Selected address not found');
        }
        finalDeliveryAddress = selectedAddr.delivery_address;
        finalNotes = selectedAddr.notes || notes;
      } else if (addressMode === 'new') {
        if (!deliveryAddress.trim()) {
          throw new Error('Please enter a delivery address');
        }
        finalDeliveryAddress = deliveryAddress;

        // Save new address if checkbox is checked
        if (saveNewAddress) {
          try {
            await api.createAddress({
              address_label: addressLabel || 'Checkout Address',
              location_id: locationId || null,
              delivery_address: deliveryAddress,
              notes: notes || null,
              is_default: false
            });
          } catch (addrErr) {
            // Check if it's a duplicate address error
            if (addrErr.message?.includes('duplicate') || addrErr.message?.includes('unique constraint')) {
              console.warn('Address already saved:', addrErr);
              // Silently continue - address already exists, which is fine
            } else {
              console.error('Failed to save address:', addrErr);
              // Continue with order even if save fails for other reasons
            }
          }
        }
      } else {
        throw new Error('Please select or enter a delivery address');
      }

      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        delivery_address: finalDeliveryAddress,
        notes: finalNotes
      };

      const orderResponse = await api.createOrder(orderData);
      const orderId = orderResponse.order.id;

      // Process payment
      const paymentResponse = await api.processPayment(orderId, paymentMethod);

      // Clear cart
      clearCart();

      // Show success message
      alert(`Order #${orderId} placed successfully!\nPayment: ${paymentResponse.payment_method}\n${paymentResponse.message}`);

      // Redirect to orders page
      route('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    route('/cart');
    return null;
  }

  return (
    <div class="page checkout-page">
      <div class="container">
        <h2>Checkout</h2>

        <form onSubmit={handleSubmit}>
          <div class="checkout-section">
            <h3>Delivery Information</h3>

            {/* Address Mode Selector */}
            <div class="form-group">
              <label>Address Selection</label>
              <div class="address-mode-selector">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="addressMode"
                    value="saved"
                    checked={addressMode === 'saved'}
                    onChange={(e) => setAddressMode(e.target.value)}
                    disabled={addresses.length === 0}
                  />
                  <span>Use Saved Address ({addresses.length})</span>
                </label>

                <label class="radio-label">
                  <input
                    type="radio"
                    name="addressMode"
                    value="new"
                    checked={addressMode === 'new'}
                    onChange={(e) => setAddressMode(e.target.value)}
                  />
                  <span>Enter New Address</span>
                </label>
              </div>
            </div>

            {/* Saved Address Selection */}
            {addressMode === 'saved' && addresses.length > 0 && (
              <div class="form-group">
                <label>Select Address *</label>
                <select
                  value={selectedAddressId || ''}
                  onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}
                  required
                >
                  <option value="">-- Choose an address --</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.address_label}
                      {addr.location_name && ` (${addr.location_name})`}
                      {addr.is_default && ' [Default]'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* New Address Form */}
            {addressMode === 'new' && (
              <div class="new-address-form">
                <div class="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    placeholder="Room 205, Block A, Campus Hostel"
                    value={deliveryAddress}
                    onInput={(e) => setDeliveryAddress(e.target.value)}
                    required
                    rows="3"
                  />
                </div>

                <div class="form-group">
                  <label>Location (Optional)</label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    <option value="">-- No specific location --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label>Address Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Home, Hostel, Dorm"
                    value={addressLabel}
                    onInput={(e) => setAddressLabel(e.target.value)}
                  />
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                    />
                    <span>Save this address for future use</span>
                  </label>
                </div>
              </div>
            )}

            {/* General Notes */}
            <div class="form-group">
              <label>Delivery Notes (Optional)</label>
              <textarea
                placeholder="Special instructions for delivery (e.g., ring bell twice)"
                value={notes}
                onInput={(e) => setNotes(e.target.value)}
                rows="2"
              />
            </div>
          </div>

          <div class="checkout-section">
            <h3>Payment Method</h3>

            <div class="payment-options">
              <label class="radio-label">
                <input
                  type="radio"
                  name="payment"
                  value="orange_money"
                  checked={paymentMethod === 'orange_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Orange Money</span>
              </label>

              <label class="radio-label">
                <input
                  type="radio"
                  name="payment"
                  value="token_credits"
                  checked={paymentMethod === 'token_credits'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Token Credits</span>
              </label>

              <label class="radio-label">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            <p class="payment-info">
              Payment will fall back to next method if selected method fails.
            </p>
          </div>

          <div class="checkout-section">
            <h3>Order Summary</h3>

            <div class="order-items">
              {cart.map(item => (
                <div key={item.id} class="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>Le {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div class="order-total">
              <strong>Total: Le {getTotal().toFixed(2)}</strong>
            </div>
          </div>

          {error && <p class="message error">{error}</p>}

          <button type="submit" class="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
