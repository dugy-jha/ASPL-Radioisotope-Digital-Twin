/**
 * itAssetUI.js
 * 
 * IT Asset Management User Interface
 * 
 * Provides UI components and event handling for IT asset management.
 */

const ITAssetUI = {
    currentView: 'assets',
    currentAssetId: null,

    /**
     * Initialize the IT Asset Management UI
     */
    init: function() {
        this.setupEventListeners();
        this.loadAssets();
        this.loadStatistics();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        // Tab navigation
        const tabs = document.querySelectorAll('.it-asset-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Asset form
        const assetForm = document.getElementById('itAssetForm');
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAsset();
            });
        }

        const cancelAssetBtn = document.getElementById('cancelAssetBtn');
        if (cancelAssetBtn) {
            cancelAssetBtn.addEventListener('click', () => {
                this.resetAssetForm();
            });
        }

        // Purchase form
        const purchaseForm = document.getElementById('itPurchaseForm');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePurchase();
            });
        }

        // Return form
        const returnForm = document.getElementById('itReturnForm');
        if (returnForm) {
            returnForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReturn();
            });
        }

        // Repair form
        const repairForm = document.getElementById('itRepairForm');
        if (repairForm) {
            repairForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRepair();
            });
        }

        // Cost form
        const costForm = document.getElementById('itCostForm');
        if (costForm) {
            costForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCost();
            });
        }

        // Asset search
        const assetSearch = document.getElementById('assetSearch');
        if (assetSearch) {
            assetSearch.addEventListener('input', (e) => {
                this.filterAssets(e.target.value);
            });
        }

        // Configuration form
        const configForm = document.getElementById('itConfigForm');
        if (configForm) {
            configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveConfiguration();
            });
        }

        // Export/Import buttons
        const exportBtn = document.getElementById('exportITDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const importBtn = document.getElementById('importITDataBtn');
        if (importBtn) {
            importBtn.addEventListener('change', (e) => this.importData(e));
        }

        // CSV Import button
        const csvImportBtn = document.getElementById('importCSVBtn');
        if (csvImportBtn) {
            csvImportBtn.addEventListener('change', (e) => this.importCSV(e));
        }
    },

    /**
     * Switch between tabs
     */
    switchTab: function(tabName) {
        this.currentView = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.it-asset-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.it-asset-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load appropriate data
        switch(tabName) {
            case 'assets':
                this.loadAssets();
                break;
            case 'purchases':
                this.loadPurchases();
                break;
            case 'returns':
                this.loadReturns();
                break;
            case 'repairs':
                this.loadRepairs();
                break;
            case 'costs':
                this.loadCosts();
                break;
            case 'configurations':
                this.loadConfigurations();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
        }
    },

    /**
     * Load and display assets
     */
    loadAssets: async function(filterText = '') {
        try {
            const assets = await ITAssetDB.getAllAssets();
            const container = document.getElementById('assetsList');
            if (!container) return;

            // Filter assets if search text provided
            let filteredAssets = assets;
            if (filterText) {
                const searchLower = filterText.toLowerCase();
                filteredAssets = assets.filter(asset => {
                    const metadata = asset.metadata || {};
                    return (
                        (asset.assetTag && asset.assetTag.toLowerCase().includes(searchLower)) ||
                        (asset.location && asset.location.toLowerCase().includes(searchLower)) ||
                        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchLower)) ||
                        (metadata.district && metadata.district.toLowerCase().includes(searchLower)) ||
                        (metadata.segmentId && metadata.segmentId.toLowerCase().includes(searchLower)) ||
                        (metadata.landmarkId && metadata.landmarkId.toLowerCase().includes(searchLower))
                    );
                });
            }

            if (filteredAssets.length === 0) {
                container.innerHTML = '<p class="empty-state">No assets found' + (filterText ? ' matching your search' : '') + '. Click "Add Asset" to create one.</p>';
                return;
            }

            // Load configurations to get item counts
            const allConfigs = await ITAssetDB.getAllConfigurations();
            const assetItemsMap = {};
            allConfigs.forEach(config => {
                if (config.assetId && config.name === 'BOQ Items') {
                    if (!assetItemsMap[config.assetId]) {
                        assetItemsMap[config.assetId] = Object.keys(config.configuration || {}).length;
                    }
                }
            });

            container.innerHTML = filteredAssets.map(asset => {
                const itemCount = assetItemsMap[asset.id] || 0;
                const metadata = asset.metadata || {};
                return `
                <div class="it-asset-card" data-id="${asset.id}">
                    <div class="it-asset-header">
                        <h3>${asset.assetTag || 'N/A'}</h3>
                        <span class="it-asset-status it-status-${asset.status.toLowerCase()}">${asset.status}</span>
                    </div>
                    <div class="it-asset-body">
                        <p><strong>Serial:</strong> ${asset.serialNumber || 'N/A'}</p>
                        <p><strong>Category:</strong> ${asset.category || 'N/A'}</p>
                        <p><strong>Location:</strong> ${asset.location || 'N/A'}</p>
                        ${metadata.district ? `<p><strong>District:</strong> ${metadata.district}</p>` : ''}
                        ${metadata.segmentId ? `<p><strong>Segment ID:</strong> ${metadata.segmentId}</p>` : ''}
                        ${itemCount > 0 ? `<p><strong>BOQ Items:</strong> ${itemCount} items</p>` : ''}
                    </div>
                    <div class="it-asset-actions">
                        <button class="btn-edit" onclick="ITAssetUI.editAsset(${asset.id})">Edit</button>
                        <button class="btn-delete" onclick="ITAssetUI.deleteAsset(${asset.id})">Delete</button>
                        <button class="btn-view" onclick="ITAssetUI.viewAssetDetails(${asset.id})">View Details</button>
                    </div>
                </div>
            `;
            }).join('');
        } catch (error) {
            console.error('Error loading assets:', error);
            this.showError('Failed to load assets');
        }
    },

    /**
     * Filter assets by search text
     */
    filterAssets: function(searchText) {
        this.loadAssets(searchText);
    },

    /**
     * Show add/edit asset form
     */
    showAssetForm: function(asset = null) {
        const form = document.getElementById('itAssetForm');
        if (!form) return;

        if (asset) {
            document.getElementById('assetId').value = asset.id;
            document.getElementById('assetTag').value = asset.assetTag || '';
            document.getElementById('serialNumber').value = asset.serialNumber || '';
            document.getElementById('manufacturer').value = asset.manufacturer || '';
            document.getElementById('model').value = asset.model || '';
            document.getElementById('assetCategory').value = asset.category || 'Other';
            document.getElementById('assetStatus').value = asset.status || 'Active';
            document.getElementById('location').value = asset.location || '';
            document.getElementById('assignedTo').value = asset.assignedTo || '';
            document.getElementById('purchaseDate').value = asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '';
            document.getElementById('warrantyExpiry').value = asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '';
            document.getElementById('assetNotes').value = asset.notes || '';
        } else {
            this.resetAssetForm();
        }

        document.getElementById('assetFormContainer').style.display = 'block';
        document.getElementById('assetsList').style.display = 'none';
    },

    /**
     * Reset asset form
     */
    resetAssetForm: function() {
        const form = document.getElementById('itAssetForm');
        if (form) form.reset();
        document.getElementById('assetId').value = '';
        document.getElementById('assetFormContainer').style.display = 'none';
        document.getElementById('assetsList').style.display = 'block';
    },

    /**
     * Save asset
     */
    saveAsset: async function() {
        try {
            const formData = {
                assetTag: document.getElementById('assetTag').value,
                serialNumber: document.getElementById('serialNumber').value,
                manufacturer: document.getElementById('manufacturer').value,
                model: document.getElementById('model').value,
                category: document.getElementById('assetCategory').value,
                status: document.getElementById('assetStatus').value,
                location: document.getElementById('location').value,
                assignedTo: document.getElementById('assignedTo').value,
                purchaseDate: document.getElementById('purchaseDate').value,
                warrantyExpiry: document.getElementById('warrantyExpiry').value || null,
                notes: document.getElementById('assetNotes').value
            };

            const assetId = document.getElementById('assetId').value;
            if (assetId) {
                await ITAssetDB.updateAsset(parseInt(assetId), formData);
                this.showSuccess('Asset updated successfully');
            } else {
                await ITAssetDB.addAsset(formData);
                this.showSuccess('Asset added successfully');
            }

            this.resetAssetForm();
            this.loadAssets();
            this.loadStatistics();
        } catch (error) {
            console.error('Error saving asset:', error);
            this.showError('Failed to save asset');
        }
    },

    /**
     * Edit asset
     */
    editAsset: async function(id) {
        try {
            const asset = await ITAssetDB.getAsset(id);
            this.showAssetForm(asset);
        } catch (error) {
            console.error('Error loading asset:', error);
            this.showError('Failed to load asset');
        }
    },

    /**
     * Delete asset
     */
    deleteAsset: async function(id) {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        try {
            await ITAssetDB.deleteAsset(id);
            this.showSuccess('Asset deleted successfully');
            this.loadAssets();
            this.loadStatistics();
        } catch (error) {
            console.error('Error deleting asset:', error);
            this.showError('Failed to delete asset');
        }
    },

    /**
     * View asset details
     */
    viewAssetDetails: async function(id) {
        try {
            const asset = await ITAssetDB.getAsset(id);
            const purchases = await ITAssetDB.getPurchasesByAsset(id);
            const repairs = await ITAssetDB.getRepairsByAsset(id);
            const costs = await ITAssetDB.getCostsByAsset(id);
            const configurations = await ITAssetDB.getConfigurationsByAsset(id);

            // Find BOQ items configuration
            const boqConfig = configurations.find(c => c.name === 'BOQ Items');
            const items = boqConfig ? boqConfig.configuration : {};

            const modal = document.getElementById('assetDetailsModal');
            if (!modal) return;

            // Build metadata display
            let metadataHtml = '';
            if (asset.metadata) {
                metadataHtml = Object.entries(asset.metadata).map(([key, value]) => {
                    if (value) {
                        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return `<p><strong>${displayKey}:</strong> ${value}</p>`;
                    }
                    return '';
                }).filter(h => h).join('');
            }

            // Build items display
            let itemsHtml = '';
            if (Object.keys(items).length > 0) {
                itemsHtml = '<table class="items-table"><thead><tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Category</th></tr></thead><tbody>';
                Object.entries(items).forEach(([itemName, itemData]) => {
                    itemsHtml += `<tr>
                        <td>${itemName}</td>
                        <td>${itemData.quantity || 0}</td>
                        <td>${itemData.unit || 'units'}</td>
                        <td>${itemData.category || 'Equipment'}</td>
                    </tr>`;
                });
                itemsHtml += '</tbody></table>';
            } else {
                itemsHtml = '<p>No BOQ items recorded</p>';
            }

            document.getElementById('assetDetailsContent').innerHTML = `
                <h2>Asset Details: ${asset.assetTag || 'N/A'}</h2>
                <div class="asset-details-section">
                    <h3>Basic Information</h3>
                    <p><strong>Serial Number:</strong> ${asset.serialNumber || 'N/A'}</p>
                    <p><strong>Manufacturer:</strong> ${asset.manufacturer || 'N/A'}</p>
                    <p><strong>Model:</strong> ${asset.model || 'N/A'}</p>
                    <p><strong>Category:</strong> ${asset.category || 'N/A'}</p>
                    <p><strong>Status:</strong> ${asset.status || 'N/A'}</p>
                    <p><strong>Location:</strong> ${asset.location || 'N/A'}</p>
                    <p><strong>Assigned To:</strong> ${asset.assignedTo || 'Unassigned'}</p>
                    <p><strong>Purchase Date:</strong> ${asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Warranty Expiry:</strong> ${asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Notes:</strong> ${asset.notes || 'None'}</p>
                </div>
                ${metadataHtml ? `<div class="asset-details-section">
                    <h3>Project Metadata</h3>
                    ${metadataHtml}
                </div>` : ''}
                <div class="asset-details-section">
                    <h3>BOQ Items (Item-wise Quantities)</h3>
                    ${itemsHtml}
                </div>
                <div class="asset-details-section">
                    <h3>Purchases (${purchases.length})</h3>
                    ${purchases.length > 0 ? purchases.map(p => `
                        <p>${new Date(p.purchaseDate).toLocaleDateString()} - ${p.vendor} - $${p.totalCost}</p>
                    `).join('') : '<p>No purchases recorded</p>'}
                </div>
                <div class="asset-details-section">
                    <h3>Repairs (${repairs.length})</h3>
                    ${repairs.length > 0 ? repairs.map(r => `
                        <p>${new Date(r.repairDate).toLocaleDateString()} - ${r.status} - $${r.cost || 0}</p>
                    `).join('') : '<p>No repairs recorded</p>'}
                </div>
                <div class="asset-details-section">
                    <h3>Costs (${costs.length})</h3>
                    ${costs.length > 0 ? costs.map(c => `
                        <p>${new Date(c.date).toLocaleDateString()} - ${c.category} - $${c.amount}</p>
                    `).join('') : '<p>No costs recorded</p>'}
                </div>
                <div class="asset-details-section">
                    <h3>Configurations (${configurations.length})</h3>
                    ${configurations.length > 0 ? configurations.map(c => `
                        <p>${c.name} - v${c.version} - ${new Date(c.lastModified).toLocaleDateString()}</p>
                    `).join('') : '<p>No configurations recorded</p>'}
                </div>
            `;

            modal.style.display = 'block';
            this.currentAssetId = id;
        } catch (error) {
            console.error('Error loading asset details:', error);
            this.showError('Failed to load asset details');
        }
    },

    /**
     * Load purchases
     */
    loadPurchases: async function() {
        try {
            const purchases = await ITAssetDB.getAllPurchases();
            const container = document.getElementById('purchasesList');
            if (!container) return;

            if (purchases.length === 0) {
                container.innerHTML = '<p class="empty-state">No purchases found.</p>';
                return;
            }

            container.innerHTML = purchases.map(purchase => `
                <div class="it-record-card">
                    <h4>${purchase.vendor || 'Unknown Vendor'}</h4>
                    <p><strong>Date:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                    <p><strong>PO Number:</strong> ${purchase.poNumber || 'N/A'}</p>
                    <p><strong>Quantity:</strong> ${purchase.quantity}</p>
                    <p><strong>Total Cost:</strong> ${purchase.currency} ${purchase.totalCost.toFixed(2)}</p>
                    <p><strong>Notes:</strong> ${purchase.notes || 'None'}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading purchases:', error);
        }
    },

    /**
     * Save purchase
     */
    savePurchase: async function() {
        try {
            const formData = {
                assetId: document.getElementById('purchaseAssetId').value ? parseInt(document.getElementById('purchaseAssetId').value) : null,
                purchaseDate: document.getElementById('purchaseRecordDate').value,
                vendor: document.getElementById('vendor').value,
                poNumber: document.getElementById('poNumber').value,
                quantity: parseInt(document.getElementById('quantity').value) || 1,
                unitPrice: parseFloat(document.getElementById('unitPrice').value) || 0,
                currency: document.getElementById('purchaseCurrency').value,
                paymentMethod: document.getElementById('paymentMethod').value,
                notes: document.getElementById('purchaseNotes').value
            };

            formData.totalCost = formData.unitPrice * formData.quantity;

            await ITAssetDB.addPurchase(formData);
            this.showSuccess('Purchase recorded successfully');
            document.getElementById('itPurchaseForm').reset();
            this.loadPurchases();
            this.loadStatistics();
        } catch (error) {
            console.error('Error saving purchase:', error);
            this.showError('Failed to save purchase');
        }
    },

    /**
     * Load returns
     */
    loadReturns: async function() {
        try {
            const returns = await ITAssetDB.getAllReturns();
            const container = document.getElementById('returnsList');
            if (!container) return;

            if (returns.length === 0) {
                container.innerHTML = '<p class="empty-state">No returns found.</p>';
                return;
            }

            container.innerHTML = returns.map(returnRecord => `
                <div class="it-record-card">
                    <h4>Return #${returnRecord.id}</h4>
                    <p><strong>Date:</strong> ${new Date(returnRecord.returnDate).toLocaleDateString()}</p>
                    <p><strong>Reason:</strong> ${returnRecord.reason || 'N/A'}</p>
                    <p><strong>Condition:</strong> ${returnRecord.condition}</p>
                    <p><strong>Refund Amount:</strong> ${returnRecord.currency} ${returnRecord.refundAmount.toFixed(2)}</p>
                    <p><strong>RMA Number:</strong> ${returnRecord.rmaNumber || 'N/A'}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading returns:', error);
        }
    },

    /**
     * Save return
     */
    saveReturn: async function() {
        try {
            const formData = {
                assetId: document.getElementById('returnAssetId').value ? parseInt(document.getElementById('returnAssetId').value) : null,
                returnDate: document.getElementById('returnDate').value,
                reason: document.getElementById('returnReason').value,
                condition: document.getElementById('returnCondition').value,
                refundAmount: parseFloat(document.getElementById('refundAmount').value) || 0,
                currency: document.getElementById('returnCurrency').value,
                vendor: document.getElementById('returnVendor').value,
                rmaNumber: document.getElementById('rmaNumber').value,
                notes: document.getElementById('returnNotes').value
            };

            await ITAssetDB.addReturn(formData);
            this.showSuccess('Return recorded successfully');
            document.getElementById('itReturnForm').reset();
            this.loadReturns();
            this.loadStatistics();
        } catch (error) {
            console.error('Error saving return:', error);
            this.showError('Failed to save return');
        }
    },

    /**
     * Load repairs
     */
    loadRepairs: async function() {
        try {
            const repairs = await ITAssetDB.getAllRepairs();
            const container = document.getElementById('repairsList');
            if (!container) return;

            if (repairs.length === 0) {
                container.innerHTML = '<p class="empty-state">No repairs found.</p>';
                return;
            }

            container.innerHTML = repairs.map(repair => `
                <div class="it-record-card">
                    <h4>Repair #${repair.id} - <span class="it-status-${repair.status.toLowerCase()}">${repair.status}</span></h4>
                    <p><strong>Reported:</strong> ${new Date(repair.reportedDate).toLocaleDateString()}</p>
                    <p><strong>Repair Date:</strong> ${new Date(repair.repairDate).toLocaleDateString()}</p>
                    <p><strong>Issue:</strong> ${repair.issue || 'N/A'}</p>
                    <p><strong>Service Provider:</strong> ${repair.serviceProvider || 'N/A'}</p>
                    <p><strong>Cost:</strong> ${repair.currency} ${repair.cost.toFixed(2)}</p>
                    <p><strong>Warranty Covered:</strong> ${repair.warrantyCovered ? 'Yes' : 'No'}</p>
                    ${repair.completionDate ? `<p><strong>Completed:</strong> ${new Date(repair.completionDate).toLocaleDateString()}</p>` : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading repairs:', error);
        }
    },

    /**
     * Save repair
     */
    saveRepair: async function() {
        try {
            const formData = {
                assetId: document.getElementById('repairAssetId').value ? parseInt(document.getElementById('repairAssetId').value) : null,
                repairDate: document.getElementById('repairDate').value,
                reportedDate: document.getElementById('reportedDate').value,
                status: document.getElementById('repairStatus').value,
                issue: document.getElementById('repairIssue').value,
                description: document.getElementById('repairDescription').value,
                serviceProvider: document.getElementById('serviceProvider').value,
                cost: parseFloat(document.getElementById('repairCost').value) || 0,
                currency: document.getElementById('repairCurrency').value,
                warrantyCovered: document.getElementById('warrantyCovered').checked,
                completionDate: document.getElementById('completionDate').value || null,
                notes: document.getElementById('repairNotes').value
            };

            await ITAssetDB.addRepair(formData);
            this.showSuccess('Repair recorded successfully');
            document.getElementById('itRepairForm').reset();
            this.loadRepairs();
            this.loadStatistics();
        } catch (error) {
            console.error('Error saving repair:', error);
            this.showError('Failed to save repair');
        }
    },

    /**
     * Load costs
     */
    loadCosts: async function() {
        try {
            const costs = await ITAssetDB.getAllCosts();
            const container = document.getElementById('costsList');
            if (!container) return;

            if (costs.length === 0) {
                container.innerHTML = '<p class="empty-state">No costs found.</p>';
                return;
            }

            container.innerHTML = costs.map(cost => `
                <div class="it-record-card">
                    <h4>${cost.category} - ${cost.type}</h4>
                    <p><strong>Date:</strong> ${new Date(cost.date).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${cost.description || 'N/A'}</p>
                    <p><strong>Amount:</strong> ${cost.currency} ${cost.amount.toFixed(2)}</p>
                    <p><strong>Notes:</strong> ${cost.notes || 'None'}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading costs:', error);
        }
    },

    /**
     * Save cost
     */
    saveCost: async function() {
        try {
            const formData = {
                assetId: document.getElementById('costAssetId').value ? parseInt(document.getElementById('costAssetId').value) : null,
                date: document.getElementById('costDate').value,
                category: document.getElementById('costCategory').value,
                description: document.getElementById('costDescription').value,
                amount: parseFloat(document.getElementById('costAmount').value) || 0,
                currency: document.getElementById('costCurrency').value,
                type: document.getElementById('costType').value,
                notes: document.getElementById('costNotes').value
            };

            await ITAssetDB.addCost(formData);
            this.showSuccess('Cost recorded successfully');
            document.getElementById('itCostForm').reset();
            this.loadCosts();
            this.loadStatistics();
        } catch (error) {
            console.error('Error saving cost:', error);
            this.showError('Failed to save cost');
        }
    },

    /**
     * Load configurations
     */
    loadConfigurations: async function() {
        try {
            const configurations = await ITAssetDB.getAllConfigurations();
            const container = document.getElementById('configurationsList');
            if (!container) return;

            if (configurations.length === 0) {
                container.innerHTML = '<p class="empty-state">No configurations found.</p>';
                return;
            }

            container.innerHTML = configurations.map(config => `
                <div class="it-record-card">
                    <h4>${config.name || 'Unnamed Configuration'}</h4>
                    <p><strong>Version:</strong> ${config.version}</p>
                    <p><strong>Last Modified:</strong> ${new Date(config.lastModified).toLocaleDateString()}</p>
                    <p><strong>Modified By:</strong> ${config.modifiedBy || 'N/A'}</p>
                    <p><strong>Description:</strong> ${config.description || 'None'}</p>
                    <pre class="config-preview">${JSON.stringify(config.configuration, null, 2)}</pre>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading configurations:', error);
        }
    },

    /**
     * Save configuration
     */
    saveConfiguration: async function() {
        try {
            let configData;
            try {
                configData = JSON.parse(document.getElementById('configData').value);
            } catch (e) {
                this.showError('Invalid JSON in configuration data');
                return;
            }

            const formData = {
                assetId: document.getElementById('configAssetId').value ? parseInt(document.getElementById('configAssetId').value) : null,
                version: document.getElementById('configVersion').value,
                name: document.getElementById('configName').value,
                description: document.getElementById('configDescription').value,
                configuration: configData,
                modifiedBy: document.getElementById('modifiedBy').value,
                notes: document.getElementById('configNotes').value
            };

            await ITAssetDB.addConfiguration(formData);
            this.showSuccess('Configuration saved successfully');
            document.getElementById('itConfigForm').reset();
            this.loadConfigurations();
        } catch (error) {
            console.error('Error saving configuration:', error);
            this.showError('Failed to save configuration');
        }
    },

    /**
     * Load statistics
     */
    loadStatistics: async function() {
        try {
            const stats = await ITAssetDB.getAssetStatistics();
            const container = document.getElementById('statisticsContent');
            if (!container) return;

            container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Assets</h3>
                        <p class="stat-value">${stats.totalAssets}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Purchase Cost</h3>
                        <p class="stat-value">$${stats.totalPurchaseCost.toFixed(2)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Repair Cost</h3>
                        <p class="stat-value">$${stats.totalRepairCost.toFixed(2)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Total Other Costs</h3>
                        <p class="stat-value">$${stats.totalOtherCosts.toFixed(2)}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Assets with Warranty</h3>
                        <p class="stat-value">${stats.assetsWithWarranty}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Expired Warranties</h3>
                        <p class="stat-value">${stats.assetsExpiredWarranty}</p>
                    </div>
                </div>
                <div class="stats-breakdown">
                    <h3>Assets by Status</h3>
                    <ul>
                        ${Object.entries(stats.assetsByStatus).map(([status, count]) => 
                            `<li>${status}: ${count}</li>`
                        ).join('')}
                    </ul>
                    <h3>Assets by Category</h3>
                    <ul>
                        ${Object.entries(stats.assetsByCategory).map(([category, count]) => 
                            `<li>${category}: ${count}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    },

    /**
     * Export data
     */
    exportData: async function() {
        try {
            const data = await ITAssetDB.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `it-assets-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showSuccess('Data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data');
        }
    },

    /**
     * Import data
     */
    importData: async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('Importing data will add to existing records. Continue?')) {
            event.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            await ITAssetDB.importData(text);
            this.showSuccess('Data imported successfully');
            this.loadAssets();
            this.loadStatistics();
            event.target.value = '';
        } catch (error) {
            console.error('Error importing data:', error);
            this.showError('Failed to import data');
            event.target.value = '';
        }
    },

    /**
     * Import CSV file (BOQ data)
     */
    importCSV: async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('Importing CSV will create/update assets based on Pole ID. Continue?')) {
            event.target.value = '';
            return;
        }

        try {
            this.showMessage('Importing CSV data... Please wait.');
            const results = await CSVImporter.importCSV(file);
            
            let message = `Import completed!\n\n`;
            message += `Total processed: ${results.total}\n`;
            message += `Successfully imported: ${results.success.length}\n`;
            message += `Errors: ${results.errors.length}\n\n`;
            
            if (results.success.length > 0) {
                message += `Created: ${results.success.filter(r => r.action === 'created').length}\n`;
                message += `Updated: ${results.success.filter(r => r.action === 'updated').length}\n`;
            }
            
            if (results.errors.length > 0) {
                message += `\nErrors:\n${results.errors.map(e => `- ${e.poleId}: ${e.error}`).join('\n')}`;
            }
            
            alert(message);
            this.loadAssets();
            this.loadStatistics();
            event.target.value = '';
        } catch (error) {
            console.error('Error importing CSV:', error);
            this.showError('Failed to import CSV: ' + error.message);
            event.target.value = '';
        }
    },

    /**
     * Show message
     */
    showMessage: function(message) {
        // Simple alert for now - can be enhanced with a toast notification
        console.log(message);
    },

    /**
     * Show success message
     */
    showSuccess: function(message) {
        // Simple alert for now - can be enhanced with a toast notification
        alert(message);
    },

    /**
     * Show error message
     */
    showError: function(message) {
        alert('Error: ' + message);
    }
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('assetDetailsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

