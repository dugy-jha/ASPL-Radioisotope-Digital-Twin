/**
 * csvImporter.js
 * 
 * CSV Import Utility for IT Asset Management
 * Handles import of BOQ (Bill of Quantities) data with Pole ID as primary identifier
 */

const CSVImporter = {
    /**
     * Parse CSV file content
     */
    parseCSV: function(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 6) {
            throw new Error('Invalid CSV format: insufficient rows');
        }

        // Skip header rows (rows 1-5) and get column headers (row 6)
        const headers = this.parseCSVLine(lines[5]);
        
        // Parse data rows (starting from row 7)
        const data = [];
        for (let i = 6; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0 || !values[0] || values[0].trim() === '') continue;
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }

        return { headers, data };
    },

    /**
     * Parse a single CSV line handling quoted fields
     */
    parseCSVLine: function(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add last field
        result.push(current.trim());
        return result;
    },

    /**
     * Map CSV data to asset format
     */
    mapToAssets: function(csvData) {
        const assets = [];
        const itemColumns = this.getItemColumns();
        
        csvData.forEach((row, index) => {
            const poleId = row['Pole Location'] || row['Col. 3'] || '';
            if (!poleId || poleId.trim() === '') return;

            // Create main asset record
            const asset = {
                assetTag: poleId.trim(),
                serialNumber: row['Landmark ID'] || row['Col. 2'] || '',
                manufacturer: '', // Not in CSV
                model: '', // Not in CSV
                category: 'Infrastructure',
                status: 'Active',
                location: row['Landmark'] || '',
                assignedTo: row['District'] || '',
                purchaseDate: null,
                warrantyExpiry: null,
                notes: this.buildNotes(row),
                // Additional metadata
                metadata: {
                    region: row['Region'] || '',
                    district: row['District'] || '',
                    projectPhase: row['Project Phase'] || '',
                    latitude: row['Latitude'] || '',
                    longitude: row['Longitude'] || '',
                    jbId: row['JB ID'] || row['Col. 6'] || '',
                    segmentId: row['Segment ID'] || '',
                    clusterDescription: row['Cluster Description'] || '',
                    landmarkId: row['Landmark ID'] || '',
                    electricLoad: row['Electric Load Maximum Draw (Watts)'] || '',
                    linkToSSR: row['Link to SSR'] || '',
                    linkToSitePhotographs: row['Link to Site Photographs'] || '',
                    existenceIn17: row['Remark: Existence in 1.7'] || '',
                    existenceIn19: row['Remark: Existence in 1.9'] || '',
                    nhaiHinderance: row['NHAI/ Other Hinderance'] || ''
                },
                // Item-wise quantities
                items: {}
            };

            // Extract item quantities
            itemColumns.forEach(item => {
                const qty = parseFloat(row[item.column] || row[item.altColumn] || '0');
                if (qty > 0) {
                    asset.items[item.name] = {
                        quantity: qty,
                        unit: item.unit || 'units',
                        category: item.category || 'Equipment'
                    };
                }
            });

            assets.push(asset);
        });

        return assets;
    },

    /**
     * Get item column mappings
     */
    getItemColumns: function() {
        return [
            { name: 'Fixed Camera', column: 'Fixed Camera', altColumn: 'Col. 22', unit: 'units', category: 'Camera' },
            { name: 'PTZ Camera', column: 'PTZ Camera', altColumn: 'Col. 23', unit: 'units', category: 'Camera' },
            { name: 'ANPR Camera', column: 'ANPR Camera', altColumn: 'Col. 24', unit: 'units', category: 'Camera' },
            { name: 'LPU', column: 'LPU', altColumn: 'Col. 25', unit: 'units', category: 'Equipment' },
            { name: 'IR Illuminator', column: 'IR Illuminator', altColumn: 'Col. 26', unit: 'units', category: 'Lighting' },
            { name: 'Unipole', column: 'Unipole', altColumn: 'Col. 27', unit: 'units', category: 'Infrastructure' },
            { name: 'Cantilever Pole', column: 'Cantilever', altColumn: 'Col. 28', unit: 'units', category: 'Infrastructure' },
            { name: 'Gantry', column: 'Gantry', altColumn: 'Col. 29', unit: 'units', category: 'Infrastructure' },
            { name: 'Network Switch', column: 'Network Switch', altColumn: 'Col. 30', unit: 'units', category: 'Network' },
            { name: 'LIU', column: 'LIU', altColumn: 'Col. 31', unit: 'units', category: 'Network' },
            { name: 'Field Splicing', column: 'Field Splicing', altColumn: 'Col. 32', unit: 'units', category: 'Cable' },
            { name: 'D3C Splicing', column: 'D3C Splicing', altColumn: 'Col. 33', unit: 'units', category: 'Cable' },
            { name: 'Total Splicing', column: 'Total Splicing', altColumn: 'Col. 34', unit: 'units', category: 'Cable' },
            { name: 'GI/SS Net enclosure', column: 'GI/SS Net enclosure (Cage) for CCTV', altColumn: 'Col. 35', unit: 'units', category: 'Infrastructure' },
            { name: '2 KVA Servo', column: '2 KVA Servo', altColumn: 'Col. 36', unit: 'units', category: 'Power' },
            { name: '1 KVA UPS', column: '1 KVA UPS', altColumn: 'Col. 37', unit: 'units', category: 'Power' },
            { name: 'Small Outdoor JB', column: 'Small Outdoor JB', altColumn: 'Col. 38', unit: 'units', category: 'Infrastructure' },
            { name: 'OFC Armoured 6 core', column: 'OFC Armoured 6 core', altColumn: 'Col. 39', unit: 'meters', category: 'Cable' },
            { name: 'Cat-6 STP Outdoor', column: 'Cat-6 STP Outdoor', altColumn: 'Col. 40', unit: 'meters', category: 'Cable' },
            { name: 'HDPE 40mm', column: 'HDPE 40mm', altColumn: 'Col. 41', unit: 'meters', category: 'Conduit' },
            { name: 'GI Pipe 32mm', column: 'GI Pipe 32mm', altColumn: 'Col. 42', unit: 'meters', category: 'Conduit' },
            { name: 'Chemical Earthing', column: 'Chemical Earthing', altColumn: 'Col. 43', unit: 'units', category: 'Infrastructure' },
            { name: '3KVA Servo', column: '3KVA Servo', altColumn: 'Col. 44', unit: 'units', category: 'Power' },
            { name: '2 KVA UPS', column: '2 KVA UPS', altColumn: 'Col. 45', unit: 'units', category: 'Power' },
            { name: 'Large Outdoor JB', column: 'Large Outdoor JB', altColumn: 'Col. 46', unit: 'units', category: 'Infrastructure' },
            { name: '1.5 sqmm. Unarmoured Power Cable', column: '1.5 sqmm. Unarmoured Power Cable', altColumn: 'Col. 47', unit: 'meters', category: 'Cable' },
            { name: '2.5 sqmm. Armoured Power Cable', column: '2.5 sqmm. Armoured Power Cable', altColumn: 'Col. 48', unit: 'meters', category: 'Cable' },
            { name: 'Heating element', column: 'Heating element (W)', altColumn: 'Col. 49', unit: 'watts', category: 'Power' },
            { name: 'ROW', column: 'ROW', altColumn: 'Col. 50', unit: 'units', category: 'Infrastructure' },
            { name: 'Miscellaneous', column: 'Misc.', altColumn: 'Col. 51', unit: 'units', category: 'Miscellaneous' },
            { name: 'Civil Work', column: 'Civil work', altColumn: 'Col. 52', unit: 'units', category: 'Infrastructure' },
            { name: 'Electricity Meter', column: 'Energy Meter', altColumn: 'Col. 53', unit: 'units', category: 'Power' },
            { name: 'Battery', column: 'Battery (AH)', altColumn: 'Col. 54', unit: 'AH', category: 'Power' }
        ];
    },

    /**
     * Build notes from row data
     */
    buildNotes: function(row) {
        const notes = [];
        if (row['Remark: Existence in 1.7']) notes.push(`Existence in 1.7: ${row['Remark: Existence in 1.7']}`);
        if (row['Remark: Existence in 1.9']) notes.push(`Existence in 1.9: ${row['Remark: Existence in 1.9']}`);
        if (row['NHAI/ Other Hinderance']) notes.push(`NHAI/Other Hinderance: ${row['NHAI/ Other Hinderance']}`);
        if (row['Large Site Package Approval']) notes.push(`Large Site Package Approval: ${row['Large Site Package Approval']}`);
        return notes.join('; ');
    },

    /**
     * Import CSV file
     */
    importCSV: async function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    const { headers, data } = this.parseCSV(csvText);
                    const assets = this.mapToAssets(data);
                    
                    // Import each asset
                    const results = {
                        success: [],
                        errors: [],
                        total: assets.length
                    };

                    for (const asset of assets) {
                        try {
                            // Check if asset already exists
                            const existingAssets = await ITAssetDB.getAllAssets();
                            const existing = existingAssets.find(a => a.assetTag === asset.assetTag);
                            
                            if (existing) {
                                // Update existing asset
                                await ITAssetDB.updateAsset(existing.id, asset);
                                results.success.push({ poleId: asset.assetTag, action: 'updated' });
                            } else {
                                // Add new asset
                                const id = await ITAssetDB.addAsset(asset);
                                
                                // Store item quantities as configuration
                                if (Object.keys(asset.items).length > 0) {
                                    await ITAssetDB.addConfiguration({
                                        assetId: id,
                                        version: '1.0',
                                        name: 'BOQ Items',
                                        description: 'Item-wise quantities from BOQ',
                                        configuration: asset.items,
                                        modifiedBy: 'CSV Import',
                                        notes: 'Imported from BOQ CSV'
                                    });
                                }
                                
                                results.success.push({ poleId: asset.assetTag, action: 'created', id: id });
                            }
                        } catch (error) {
                            results.errors.push({ poleId: asset.assetTag, error: error.message });
                        }
                    }

                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};

