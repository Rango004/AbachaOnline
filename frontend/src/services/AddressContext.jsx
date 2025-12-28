import { createContext } from 'preact';
import { useState, useCallback, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import api from './api';

export const AddressContext = createContext();

export function AddressProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all locations (can be called independently)
  const loadLocations = useCallback(async () => {
    try {
      const locationsData = await api.getLocations();
      setLocations(locationsData);
    } catch (err) {
      console.error('Failed to load locations:', err);
      setError('Failed to load locations');
    }
  }, []);

  // Load addresses from API
  const loadAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setDefaultAddress(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load addresses with pagination
      const response = await api.getAddresses(50, 0);
      setAddresses(response.items || []);

      // Load default address
      try {
        const defaultResp = await api.getDefaultAddress();
        setDefaultAddress(defaultResp.address || null);
      } catch {
        setDefaultAddress(null);
      }

      // Load locations if not already loaded
      if (locations.length === 0) {
        await loadLocations();
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, locations.length, loadLocations]);

  // Create new address
  const createAddress = useCallback(async (addressData) => {
    try {
      setError(null);
      const newAddress = await api.createAddress(addressData);
      setAddresses([...addresses, newAddress]);

      // Update default if this is marked as default
      if (addressData.is_default) {
        setDefaultAddress(newAddress);
      }

      return newAddress;
    } catch (err) {
      const errorMsg = err.message || 'Failed to create address';
      setError(errorMsg);
      throw err;
    }
  }, [addresses]);

  // Update existing address
  const updateAddress = useCallback(async (id, addressData) => {
    try {
      setError(null);
      const updated = await api.updateAddress(id, addressData);

      // Update in list
      setAddresses(addresses.map(addr => addr.id === id ? updated : addr));

      // Update default if changed
      if (addressData.is_default) {
        setDefaultAddress(updated);
      } else if (defaultAddress?.id === id) {
        setDefaultAddress(null);
      }

      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Failed to update address';
      setError(errorMsg);
      throw err;
    }
  }, [addresses, defaultAddress]);

  // Delete address
  const deleteAddress = useCallback(async (id) => {
    try {
      setError(null);
      const deleted = await api.deleteAddress(id);

      // Remove from list
      setAddresses(addresses.filter(addr => addr.id !== id));

      // Update default if this was the default
      if (defaultAddress?.id === id) {
        // Try to set another address as default
        const remaining = addresses.filter(addr => addr.id !== id);
        if (remaining.length > 0) {
          setDefaultAddress(remaining[0]);
        } else {
          setDefaultAddress(null);
        }
      }

      return deleted;
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete address';
      setError(errorMsg);
      throw err;
    }
  }, [addresses, defaultAddress]);

  // Set address as default
  const setDefault = useCallback(async (id) => {
    try {
      setError(null);
      const updated = await api.setDefaultAddress(id);

      // Update list to reflect new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })));

      setDefaultAddress(updated);
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Failed to set default address';
      setError(errorMsg);
      throw err;
    }
  }, [addresses]);

  // Get address by ID
  const getAddressById = useCallback((id) => {
    return addresses.find(addr => addr.id === id);
  }, [addresses]);

  // Get location name by ID
  const getLocationName = useCallback((locationId) => {
    if (!locationId) return '';
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || '';
  }, [locations]);

  // Load addresses when user changes
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  const value = {
    addresses,
    defaultAddress,
    locations,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    getAddressById,
    getLocationName,
    loadAddresses,
    loadLocations,
    setError,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
}
