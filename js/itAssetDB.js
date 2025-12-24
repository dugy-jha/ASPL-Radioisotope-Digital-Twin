/**
 * itAssetDB.js
 * 
 * IT Asset Management Database
 * 
 * Provides IndexedDB-based storage for IT asset configuration,
 * purchases, returns, repairs, costs, and other metadata.
 */

const ITAssetDB = {
    dbName: 'ITAssetManagement',
    dbVersion: 1,
    db: null,

    /**
     * Initialize the database
     */
    init: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IT Asset Database initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Assets store
                if (!db.objectStoreNames.contains('assets')) {
                    const assetStore = db.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
                    assetStore.createIndex('assetTag', 'assetTag', { unique: false });
                    assetStore.createIndex('serialNumber', 'serialNumber', { unique: false });
                    assetStore.createIndex('category', 'category', { unique: false });
                    assetStore.createIndex('status', 'status', { unique: false });
                    assetStore.createIndex('purchaseDate', 'purchaseDate', { unique: false });
                }

                // Purchases store
                if (!db.objectStoreNames.contains('purchases')) {
                    const purchaseStore = db.createObjectStore('purchases', { keyPath: 'id', autoIncrement: true });
                    purchaseStore.createIndex('assetId', 'assetId', { unique: false });
                    purchaseStore.createIndex('purchaseDate', 'purchaseDate', { unique: false });
                    purchaseStore.createIndex('vendor', 'vendor', { unique: false });
                    purchaseStore.createIndex('poNumber', 'poNumber', { unique: false });
                }

                // Returns store
                if (!db.objectStoreNames.contains('returns')) {
                    const returnStore = db.createObjectStore('returns', { keyPath: 'id', autoIncrement: true });
                    returnStore.createIndex('assetId', 'assetId', { unique: false });
                    returnStore.createIndex('returnDate', 'returnDate', { unique: false });
                    returnStore.createIndex('reason', 'reason', { unique: false });
                }

                // Repairs store
                if (!db.objectStoreNames.contains('repairs')) {
                    const repairStore = db.createObjectStore('repairs', { keyPath: 'id', autoIncrement: true });
                    repairStore.createIndex('assetId', 'assetId', { unique: false });
                    repairStore.createIndex('repairDate', 'repairDate', { unique: false });
                    repairStore.createIndex('status', 'status', { unique: false });
                }

                // Costs store
                if (!db.objectStoreNames.contains('costs')) {
                    const costStore = db.createObjectStore('costs', { keyPath: 'id', autoIncrement: true });
                    costStore.createIndex('assetId', 'assetId', { unique: false });
                    costStore.createIndex('date', 'date', { unique: false });
                    costStore.createIndex('category', 'category', { unique: false });
                }

                // Configuration store
                if (!db.objectStoreNames.contains('configurations')) {
                    const configStore = db.createObjectStore('configurations', { keyPath: 'id', autoIncrement: true });
                    configStore.createIndex('assetId', 'assetId', { unique: false });
                    configStore.createIndex('version', 'version', { unique: false });
                    configStore.createIndex('lastModified', 'lastModified', { unique: false });
                }
            };
        });
    },

    /**
     * Add a new asset
     */
    addAsset: function(asset) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assets'], 'readwrite');
            const store = transaction.objectStore('assets');
            const request = store.add({
                assetTag: asset.assetTag || '',
                serialNumber: asset.serialNumber || '',
                manufacturer: asset.manufacturer || '',
                model: asset.model || '',
                category: asset.category || 'Other',
                status: asset.status || 'Active',
                location: asset.location || '',
                assignedTo: asset.assignedTo || '',
                purchaseDate: asset.purchaseDate || new Date().toISOString(),
                warrantyExpiry: asset.warrantyExpiry || null,
                notes: asset.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all assets
     */
    getAllAssets: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assets'], 'readonly');
            const store = transaction.objectStore('assets');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get asset by ID
     */
    getAsset: function(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assets'], 'readonly');
            const store = transaction.objectStore('assets');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Update asset
     */
    updateAsset: function(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assets'], 'readwrite');
            const store = transaction.objectStore('assets');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const asset = getRequest.result;
                if (!asset) {
                    reject(new Error('Asset not found'));
                    return;
                }

                Object.assign(asset, updates);
                asset.updatedAt = new Date().toISOString();

                const updateRequest = store.put(asset);
                updateRequest.onsuccess = () => resolve(updateRequest.result);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    },

    /**
     * Delete asset
     */
    deleteAsset: function(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['assets'], 'readwrite');
            const store = transaction.objectStore('assets');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Add purchase record
     */
    addPurchase: function(purchase) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['purchases'], 'readwrite');
            const store = transaction.objectStore('purchases');
            const request = store.add({
                assetId: purchase.assetId || null,
                purchaseDate: purchase.purchaseDate || new Date().toISOString(),
                vendor: purchase.vendor || '',
                poNumber: purchase.poNumber || '',
                quantity: purchase.quantity || 1,
                unitPrice: purchase.unitPrice || 0,
                totalCost: purchase.totalCost || purchase.unitPrice * (purchase.quantity || 1),
                currency: purchase.currency || 'USD',
                paymentMethod: purchase.paymentMethod || '',
                notes: purchase.notes || '',
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all purchases
     */
    getAllPurchases: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['purchases'], 'readonly');
            const store = transaction.objectStore('purchases');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get purchases for a specific asset
     */
    getPurchasesByAsset: function(assetId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['purchases'], 'readonly');
            const store = transaction.objectStore('purchases');
            const index = store.index('assetId');
            const request = index.getAll(assetId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Add return record
     */
    addReturn: function(returnRecord) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['returns'], 'readwrite');
            const store = transaction.objectStore('returns');
            const request = store.add({
                assetId: returnRecord.assetId || null,
                returnDate: returnRecord.returnDate || new Date().toISOString(),
                reason: returnRecord.reason || '',
                condition: returnRecord.condition || 'Unknown',
                refundAmount: returnRecord.refundAmount || 0,
                currency: returnRecord.currency || 'USD',
                vendor: returnRecord.vendor || '',
                rmaNumber: returnRecord.rmaNumber || '',
                notes: returnRecord.notes || '',
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all returns
     */
    getAllReturns: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['returns'], 'readonly');
            const store = transaction.objectStore('returns');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Add repair record
     */
    addRepair: function(repair) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['repairs'], 'readwrite');
            const store = transaction.objectStore('repairs');
            const request = store.add({
                assetId: repair.assetId || null,
                repairDate: repair.repairDate || new Date().toISOString(),
                reportedDate: repair.reportedDate || new Date().toISOString(),
                status: repair.status || 'Pending',
                issue: repair.issue || '',
                description: repair.description || '',
                serviceProvider: repair.serviceProvider || '',
                cost: repair.cost || 0,
                currency: repair.currency || 'USD',
                warrantyCovered: repair.warrantyCovered || false,
                completionDate: repair.completionDate || null,
                notes: repair.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all repairs
     */
    getAllRepairs: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['repairs'], 'readonly');
            const store = transaction.objectStore('repairs');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get repairs for a specific asset
     */
    getRepairsByAsset: function(assetId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['repairs'], 'readonly');
            const store = transaction.objectStore('repairs');
            const index = store.index('assetId');
            const request = index.getAll(assetId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Update repair status
     */
    updateRepair: function(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['repairs'], 'readwrite');
            const store = transaction.objectStore('repairs');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const repair = getRequest.result;
                if (!repair) {
                    reject(new Error('Repair not found'));
                    return;
                }

                Object.assign(repair, updates);
                repair.updatedAt = new Date().toISOString();

                const updateRequest = store.put(repair);
                updateRequest.onsuccess = () => resolve(updateRequest.result);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    },

    /**
     * Add cost record
     */
    addCost: function(cost) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');
            const request = store.add({
                assetId: cost.assetId || null,
                date: cost.date || new Date().toISOString(),
                category: cost.category || 'Other',
                description: cost.description || '',
                amount: cost.amount || 0,
                currency: cost.currency || 'USD',
                type: cost.type || 'Expense', // Expense, Revenue, Depreciation
                notes: cost.notes || '',
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all costs
     */
    getAllCosts: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get costs for a specific asset
     */
    getCostsByAsset: function(assetId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const index = store.index('assetId');
            const request = index.getAll(assetId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Add configuration record
     */
    addConfiguration: function(config) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configurations'], 'readwrite');
            const store = transaction.objectStore('configurations');
            const request = store.add({
                assetId: config.assetId || null,
                version: config.version || '1.0',
                name: config.name || '',
                description: config.description || '',
                configuration: config.configuration || {}, // JSON object
                lastModified: new Date().toISOString(),
                modifiedBy: config.modifiedBy || '',
                notes: config.notes || '',
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all configurations
     */
    getAllConfigurations: function() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configurations'], 'readonly');
            const store = transaction.objectStore('configurations');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get configurations for a specific asset
     */
    getConfigurationsByAsset: function(assetId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['configurations'], 'readonly');
            const store = transaction.objectStore('configurations');
            const index = store.index('assetId');
            const request = index.getAll(assetId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get asset statistics
     */
    getAssetStatistics: async function() {
        try {
            const assets = await this.getAllAssets();
            const purchases = await this.getAllPurchases();
            const repairs = await this.getAllRepairs();
            const costs = await this.getAllCosts();

            const stats = {
                totalAssets: assets.length,
                assetsByStatus: {},
                assetsByCategory: {},
                totalPurchaseCost: 0,
                totalRepairCost: 0,
                totalOtherCosts: 0,
                assetsWithWarranty: 0,
                assetsExpiredWarranty: 0
            };

            assets.forEach(asset => {
                // Status breakdown
                stats.assetsByStatus[asset.status] = (stats.assetsByStatus[asset.status] || 0) + 1;
                
                // Category breakdown
                stats.assetsByCategory[asset.category] = (stats.assetsByCategory[asset.category] || 0) + 1;
                
                // Warranty tracking
                if (asset.warrantyExpiry) {
                    stats.assetsWithWarranty++;
                    if (new Date(asset.warrantyExpiry) < new Date()) {
                        stats.assetsExpiredWarranty++;
                    }
                }
            });

            purchases.forEach(purchase => {
                stats.totalPurchaseCost += purchase.totalCost || 0;
            });

            repairs.forEach(repair => {
                if (repair.cost) {
                    stats.totalRepairCost += repair.cost;
                }
            });

            costs.forEach(cost => {
                if (cost.type === 'Expense') {
                    stats.totalOtherCosts += cost.amount || 0;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            throw error;
        }
    },

    /**
     * Export all data as JSON
     */
    exportData: async function() {
        try {
            const data = {
                assets: await this.getAllAssets(),
                purchases: await this.getAllPurchases(),
                returns: await this.getAllReturns(),
                repairs: await this.getAllRepairs(),
                costs: await this.getAllCosts(),
                configurations: await this.getAllConfigurations(),
                exportDate: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },

    /**
     * Import data from JSON
     */
    importData: async function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const transaction = this.db.transaction(['assets', 'purchases', 'returns', 'repairs', 'costs', 'configurations'], 'readwrite');

            // Import assets
            if (data.assets) {
                const assetStore = transaction.objectStore('assets');
                for (const asset of data.assets) {
                    await new Promise((resolve, reject) => {
                        const request = assetStore.add(asset);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            // Import purchases
            if (data.purchases) {
                const purchaseStore = transaction.objectStore('purchases');
                for (const purchase of data.purchases) {
                    await new Promise((resolve, reject) => {
                        const request = purchaseStore.add(purchase);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            // Import returns
            if (data.returns) {
                const returnStore = transaction.objectStore('returns');
                for (const returnRecord of data.returns) {
                    await new Promise((resolve, reject) => {
                        const request = returnStore.add(returnRecord);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            // Import repairs
            if (data.repairs) {
                const repairStore = transaction.objectStore('repairs');
                for (const repair of data.repairs) {
                    await new Promise((resolve, reject) => {
                        const request = repairStore.add(repair);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            // Import costs
            if (data.costs) {
                const costStore = transaction.objectStore('costs');
                for (const cost of data.costs) {
                    await new Promise((resolve, reject) => {
                        const request = costStore.add(cost);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            // Import configurations
            if (data.configurations) {
                const configStore = transaction.objectStore('configurations');
                for (const config of data.configurations) {
                    await new Promise((resolve, reject) => {
                        const request = configStore.add(config);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
};


