/**
 * Offline Sync Manager
 * Manages queuing and syncing of operations when offline/online
 */

class OfflineSyncManager {
  constructor(dbName = 'wego-sync') {
    this.dbName = dbName;
    this.db = null;
    this.storeName = 'pending-operations';
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.listeners = [];
    this.isSyncing = false;

    this.setupEventListeners();
  }

  /**
   * Initialize IndexedDB for queue storage
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('[OfflineSync] Error opening database:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          console.log('[OfflineSync] Created object store:', this.storeName);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineSync] Database initialized');
        this.loadQueue().then(() => resolve());
      };
    });
  }

  /**
   * Setup online/offline event listeners
   * @private
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Browser online');
      this.isOnline = true;
      this.notifyListeners({ type: 'online' });
      this.syncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineSync] Browser offline');
      this.isOnline = false;
      this.notifyListeners({ type: 'offline' });
    });
  }

  /**
   * Queue an operation for later sync
   */
  async queueOperation(operation) {
    if (!this.db) await this.init();

    const operationData = {
      type: operation.type,
      endpoint: operation.endpoint,
      method: operation.method || 'POST',
      body: operation.body,
      headers: operation.headers || {},
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.add(operationData);

      request.onerror = () => {
        console.error('[OfflineSync] Error queuing operation:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const id = request.result;
        console.log(`[OfflineSync] Operation queued (ID: ${id})`, operation.type);
        this.syncQueue.push({ ...operationData, id });
        this.notifyListeners({
          type: 'operation-queued',
          operationId: id,
          operation: operationData
        });

        // Try to sync if online
        if (this.isOnline) {
          this.syncQueue();
        }

        resolve(id);
      };
    });
  }

  /**
   * Load pending operations from database
   * @private
   */
  async loadQueue() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.syncQueue = request.result;
        console.log(`[OfflineSync] Loaded ${this.syncQueue.length} pending operations`);
        resolve();
      };
    });
  }

  /**
   * Sync all pending operations
   */
  async syncQueue() {
    if (this.isSyncing || !this.isOnline) {
      console.log('[OfflineSync] Sync already in progress or offline');
      return;
    }

    if (this.syncQueue.length === 0) {
      console.log('[OfflineSync] No pending operations to sync');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners({ type: 'sync-start' });

    let successCount = 0;
    let failureCount = 0;

    for (const operation of this.syncQueue) {
      try {
        const response = await fetch(operation.endpoint, {
          method: operation.method,
          headers: {
            'Content-Type': 'application/json',
            ...operation.headers
          },
          body: operation.body ? JSON.stringify(operation.body) : undefined
        });

        if (response.ok) {
          console.log(`[OfflineSync] Successfully synced operation ${operation.id}`);
          await this.removeOperation(operation.id);
          successCount++;
          this.notifyListeners({
            type: 'operation-synced',
            operationId: operation.id,
            success: true
          });
        } else {
          console.warn(`[OfflineSync] Sync failed for operation ${operation.id}:`, response.status);
          failureCount++;
          this.notifyListeners({
            type: 'operation-sync-failed',
            operationId: operation.id,
            status: response.status
          });
        }
      } catch (error) {
        console.error(`[OfflineSync] Error syncing operation ${operation.id}:`, error);
        failureCount++;
        this.notifyListeners({
          type: 'operation-sync-error',
          operationId: operation.id,
          error: error.message
        });
      }
    }

    this.isSyncing = false;

    // Reload queue to reflect deleted items
    await this.loadQueue();

    this.notifyListeners({
      type: 'sync-complete',
      successCount,
      failureCount,
      pendingCount: this.syncQueue.length
    });

    console.log(`[OfflineSync] Sync complete: ${successCount} succeeded, ${failureCount} failed`);
  }

  /**
   * Remove an operation from queue
   * @private
   */
  async removeOperation(operationId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(operationId);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log(`[OfflineSync] Removed operation ${operationId}`);
        resolve();
      };
    });
  }

  /**
   * Clear all pending operations
   */
  async clearQueue() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.syncQueue = [];
        console.log('[OfflineSync] Queue cleared');
        resolve();
      };
    });
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      pendingOperations: this.syncQueue.map((op) => ({
        id: op.id,
        type: op.type,
        endpoint: op.endpoint,
        createdAt: op.createdAt,
        retries: op.retries
      }))
    };
  }

  /**
   * Subscribe to sync events
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  /**
   * Notify all listeners
   * @private
   */
  notifyListeners(event) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export default OfflineSyncManager;
