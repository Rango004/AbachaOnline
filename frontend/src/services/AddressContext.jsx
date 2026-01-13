import { createContext } from 'preact';
import { useState, useCallback, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import api from './api';
import OfflineSync from './OfflineSyncService';
import OfflineFirstAPI from './OfflineFirstAPI';
import { getNetworkStatus } from './NativeBridge';

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

      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Try to load from cache when offline
        console.log('[AddressContext] Offline - loading from cache');

        await OfflineSync.initOfflineDB();
        const cachedAddresses = await OfflineSync.db.getAll('addresses');

        if (cachedAddresses && cachedAddresses.length > 0) {
          setAddresses(cachedAddresses);

          // Find default address
          const defaultAddr = cachedAddresses.find(addr => addr.is_default);
          setDefaultAddress(defaultAddr || null);

          console.log(`[AddressContext] Loaded ${cachedAddresses.length} addresses from cache`);
        } else {
          setError('No cached addresses available offline');
        }

        setLoading(false);
        return;
      }

      // Online - fetch from server
      const response = await api.getAddresses(50, 0);
      const fetchedAddresses = response.items || [];
      setAddresses(fetchedAddresses);

      // Cache addresses
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.clear('addresses');
      for (const addr of fetchedAddresses) {
        await OfflineSync.db.add('addresses', addr);
      }

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

      // Try cache as fallback
      try {
        await OfflineSync.initOfflineDB();
        const cachedAddresses = await OfflineSync.db.getAll('addresses');
        if (cachedAddresses && cachedAddresses.length > 0) {
          setAddresses(cachedAddresses);
          const defaultAddr = cachedAddresses.find(addr => addr.is_default);
          setDefaultAddress(defaultAddr || null);
          console.log('[AddressContext] Using cached addresses after error');
        }
      } catch (cacheErr) {
        console.error('[AddressContext] Cache fallback failed:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user, locations.length, loadLocations]);

  // Create new address
  const createAddress = useCallback(async (addressData) => {
    try {
      setError(null);

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[AddressContext] Offline - queuing address creation');

        // Create optimistic address with temp ID
        const tempAddress = {
          id: `temp_${Date.now()}`,
          ...addressData,
          user_id: user?.id,
          queued: true
        };

        // Optimistic update
        setAddresses([...addresses, tempAddress]);

        if (addressData.is_default) {
          setDefaultAddress(tempAddress);
        }

        // Cache locally
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.add('addresses', tempAddress);

        // Queue for sync
        await OfflineSync.queueRequest(
          '/addresses',
          'POST',
          addressData,
          { priority: 'normal', type: 'address' }
        );

        return tempAddress;
      }

      // Online - create immediately
      const newAddress = await api.createAddress(addressData);
      setAddresses([...addresses, newAddress]);

      // Cache the new address
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.add('addresses', newAddress);

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
  }, [addresses, user]);

  // Update existing address
  const updateAddress = useCallback(async (id, addressData) => {
    try {
      setError(null);

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[AddressContext] Offline - queuing address update');

        // Optimistic update
        const updatedAddress = {
          ...addresses.find(addr => addr.id === id),
          ...addressData,
          queued: true
        };

        setAddresses(addresses.map(addr => addr.id === id ? updatedAddress : addr));

        if (addressData.is_default) {
          setDefaultAddress(updatedAddress);
        } else if (defaultAddress?.id === id) {
          setDefaultAddress(null);
        }

        // Cache locally
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.put('addresses', updatedAddress);

        // Queue for sync
        await OfflineSync.queueRequest(
          `/addresses/${id}`,
          'PUT',
          addressData,
          { priority: 'normal', type: 'address' }
        );

        return updatedAddress;
      }

      // Online - update immediately
      const updated = await api.updateAddress(id, addressData);

      // Update in list
      setAddresses(addresses.map(addr => addr.id === id ? updated : addr));

      // Cache the updated address
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.put('addresses', updated);

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

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[AddressContext] Offline - queuing address deletion');

        // Optimistic delete
        setAddresses(addresses.filter(addr => addr.id !== id));

        // Update default if this was the default
        if (defaultAddress?.id === id) {
          const remaining = addresses.filter(addr => addr.id !== id);
          if (remaining.length > 0) {
            setDefaultAddress(remaining[0]);
          } else {
            setDefaultAddress(null);
          }
        }

        // Delete from cache
        await OfflineSync.initOfflineDB();
        await OfflineSync.db.delete('addresses', id);

        // Queue for sync
        await OfflineSync.queueRequest(
          `/addresses/${id}`,
          'DELETE',
          null,
          { priority: 'normal', type: 'address' }
        );

        return { success: true, queued: true };
      }

      // Online - delete immediately
      const deleted = await api.deleteAddress(id);

      // Remove from list
      setAddresses(addresses.filter(addr => addr.id !== id));

      // Delete from cache
      await OfflineSync.initOfflineDB();
      await OfflineSync.db.delete('addresses', id);

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

      const { connected } = await getNetworkStatus();

      if (!connected) {
        console.log('[AddressContext] Offline - queuing default address change');

        // Optimistic update
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          is_default: addr.id === id
        }));

        setAddresses(updatedAddresses);

        const newDefault = updatedAddresses.find(addr => addr.id === id);
        setDefaultAddress(newDefault);

        // Cache locally
        await OfflineSync.initOfflineDB();
        for (const addr of updatedAddresses) {
          await OfflineSync.db.put('addresses', addr);
        }

        // Queue for sync
        await OfflineSync.queueRequest(
          `/addresses/${id}/default`,
          'PUT',
          null,
          { priority: 'normal', type: 'address' }
        );

        return newDefault;
      }

      // Online - update immediately
      const updated = await api.setDefaultAddress(id);

      // Update list to reflect new default
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      }));

      setAddresses(updatedAddresses);
      setDefaultAddress(updated);

      // Cache updated addresses
      await OfflineSync.initOfflineDB();
      for (const addr of updatedAddresses) {
        await OfflineSync.db.put('addresses', addr);
      }

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
