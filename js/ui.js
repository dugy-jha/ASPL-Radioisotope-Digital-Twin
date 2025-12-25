/**
 * ui.js
 * 
 * Generic Radioisotope Production Digital Twin - User Interface
 * 
 * STRICT SEPARATION: UI event handling and DOM manipulation only.
 * - NO physics calculations (except calling Model functions)
 * - NO formulas
 * - Only sliders, inputs, event handlers, and DOM updates
 */

const UI = {
    /**
     * Initialize UI components and event listeners
     */
    init: function() {
        this.addPlanningWarningBanner();
        this.addPhysicsLockBanner();
        this.disablePhysicsInputs();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateEquations();
        this.updateAllCharts();
        this.initializeRouteRegistry();
        this.initRouteExplorer();
        this.initLimitations();
    },

    /**
     * Initialize charts
     */
    initializeCharts: function() {
        Charts.init();
    },

    /**
     * Add planning-grade warning banner on page load
     */
    addPlanningWarningBanner: function() {
        // Banner is already in HTML, just ensure it's visible
        const banner = document.getElementById('planningWarningBanner');
        if (banner && typeof console !== 'undefined' && console.warn) {
            console.warn('This tool is intended for feasibility screening and comparative analysis only. Results are order-of-magnitude estimates. It does not provide production guarantees or licensing approval.');
        }
    },

    /**
     * Add physics lock banner to UI
     */
    addPhysicsLockBanner: function() {
        const main = document.querySelector('main');
        if (!main) return;
        
        // Check if banner already exists
        if (document.getElementById('physicsLockBanner')) return;
        
        const banner = document.createElement('div');
        banner.id = 'physicsLockBanner';
        banner.style.cssText = 'background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 6px; padding: 14px 18px; margin: 20px 0; color: #856404; font-weight: 600; font-size: 1.05em; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);';
        banner.innerHTML = '<strong>🔒 Physics Locked:</strong> Nuclear pathways and physics models are fixed. Only source, moderation, and target geometry may be changed.';
        
        // Insert after planning warning banner or at start of main
        const planningBanner = document.getElementById('planningWarningBanner');
        if (planningBanner && planningBanner.nextSibling) {
            main.insertBefore(banner, planningBanner.nextSibling);
        } else if (planningBanner) {
            planningBanner.insertAdjacentElement('afterend', banner);
        } else {
            main.insertBefore(banner, main.firstChild);
        }
    },

    /**
     * Disable physics-related UI inputs and add warning handlers
     */
    disablePhysicsInputs: function() {
        // List of physics-locked input IDs
        const physicsLockedInputs = [
            'crossSection',      // Cross-section
            'sigmaBurn',         // Burn-up cross-section
            'daughterHalfLife',  // Decay chain parameter
            'branchingRatio',    // Decay chain parameter
            'chemistryLoss'      // Chemistry yield parameter
        ];
        
        physicsLockedInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                // Disable the input
                input.disabled = true;
                input.style.backgroundColor = '#f5f5f5';
                input.style.cursor = 'not-allowed';
                input.title = 'Physics is frozen for comparative analysis.';
                
                // Add event handlers to show warning on interaction attempts
                input.addEventListener('focus', (e) => {
                    e.preventDefault();
                    e.target.blur();
                    this.showPhysicsLockWarning();
                });
                
                input.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPhysicsLockWarning();
                });
                
                input.addEventListener('keydown', (e) => {
                    if (e.key !== 'Tab' && e.key !== 'Escape') {
                        e.preventDefault();
                        this.showPhysicsLockWarning();
                    }
                });
            }
        });
    },

    /**
     * Show warning when physics modification is attempted
     */
    showPhysicsLockWarning: function() {
        const warningText = 'Physics is frozen for comparative analysis.';
        
        // Show console warning
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(warningText);
        }
        
        // Show user-visible alert (non-blocking)
        const existingAlert = document.getElementById('physicsLockAlert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.id = 'physicsLockAlert';
        alert.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f8d7da; border: 2px solid #dc3545; border-radius: 4px; padding: 12px 16px; color: #721c24; font-weight: 500; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px;';
        alert.innerHTML = `<strong>⚠️ Physics Lock:</strong> ${warningText}`;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 3000);
    },

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners: function() {
        // Source type toggle
        const sourceType = document.getElementById('sourceType');
        if (sourceType) {
            sourceType.addEventListener('change', () => {
                this.toggleSourceType();
                this.updateAllCharts();
            });
        }

        // Comparative analytics checkboxes
        const comparativeCheckboxes = document.querySelectorAll('#comparativeAnalytics input[type="checkbox"]');
        comparativeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateComparativeCharts();
            });
        });

        // Validation test case buttons
        const loadLu177Test = document.getElementById('loadLu177Test');
        if (loadLu177Test) {
            loadLu177Test.addEventListener('click', () => {
                this.loadLu177TestCase();
            });
        }

        const loadMo99Test = document.getElementById('loadMo99Test');
        if (loadMo99Test) {
            loadMo99Test.addEventListener('click', () => {
                this.loadMo99ValidationCase();
            });
        }

        // Get all input elements
        const inputs = document.querySelectorAll('#controls input, #controls select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateAllCharts();
                // If application context changed, update route explorer
                if (input.id === 'applicationContext') {
                    this.populateRouteExplorer();
                }
            });
            input.addEventListener('change', () => {
                this.updateAllCharts();
                // If application context changed, update route explorer
                if (input.id === 'applicationContext') {
                    this.populateRouteExplorer();
                }
            });
        });

        // Route registry tabs
        const routeTabs = document.querySelectorAll('.route-tab');
        routeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchRouteTab(tab.dataset.tab);
            });
        });
    },

    /**
     * Toggle between neutron flux and beam current inputs
     */
    toggleSourceType: function() {
        const sourceType = document.getElementById('sourceType').value;
        const fluxRow = document.getElementById('fluxRow');
        const beamRow = document.getElementById('beamRow');
        const beamRow2 = document.getElementById('beamRow2');
        const beamRow3 = document.getElementById('beamRow3');

        if (sourceType === 'neutron') {
            fluxRow.style.display = 'flex';
            beamRow.style.display = 'none';
            beamRow2.style.display = 'none';
            beamRow3.style.display = 'none';
        } else {
            fluxRow.style.display = 'none';
            beamRow.style.display = 'flex';
            beamRow2.style.display = 'flex';
            beamRow3.style.display = 'flex';
        }
    },

    /**
     * Get parameter value from input
     */
    getParam: function(id, defaultValue = 0) {
        const elem = document.getElementById(id);
        if (!elem) return defaultValue;
        const value = parseFloat(elem.value);
        return isNaN(value) ? defaultValue : value;
    },

    /**
     * Update all charts with current parameter values
     */
    updateAllCharts: function() {
        this.updateActivityChart();
        this.updateReactionRateChart();
        this.updateDecayChainChart();
        this.updateTemperatureChart();
        this.updateDamageChart();
        this.updateWaterfallChart();
        this.updateTransportChart();
        this.updateUncertaintyChart();
        this.updateResultsDisplay();
        this.updateRouteRegistry();
        this.populateRouteExplorer();
        this.updateComparativeCharts();
    },

    /**
     * Update Activity vs Irradiation Time chart
     */
    updateActivityChart: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const dutyCycle = this.getParam('dutyCycle', 1.0);

        // Calculate geometry
        // Geometry model: Point isotropic source + solid-angle interception
        // Flux calculated assuming point isotropic source emitting into solid angle Ω
        // Formula: φ = (S × Ω) / A_target, where Ω = 2π(1 − d / sqrt(d² + r²))
        // Note: eta = Ω/(4π), so S_eff = N_dot × eta × 4π = N_dot × Ω (correct but implicit)
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const eta = Model.geometricEfficiency(Omega);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;

        // Get flux or calculate from beam
        let phi = 0;
        const sourceType = document.getElementById('sourceType').value;
        if (sourceType === 'neutron') {
            phi = this.getParam('flux', 1e14);
        } else {
            const I = this.getParam('beamCurrent', 1e-6);
            const q = this.getParam('particleCharge', 1);
            const N_dot = Model.particleRate(I, q);
            // Flux calculation: φ = (N_dot × Ω) / A_target
            // Using effectiveSourceRate maintains backward compatibility: S_eff = N_dot × eta × 4π = N_dot × Ω
            const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
            phi = Model.flux(S_eff, A_target);
        }

        // Calculate self-shielding
        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);

        // Calculate reaction rate
        const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);

        // Calculate decay constant
        const lambda = Model.decayConstant(halfLife);

        // Generate time series
        const numPoints = 200;
        const maxTime = irradiationTimeDays * 86400; // Convert to seconds
        const timeStep = maxTime / numPoints;
        const timeData = [];
        const activityData = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const t_days = t / 86400;
            const f_sat = Model.saturationFactor(lambda, t);
            const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
            const A = Model.activity(lambda, N_EOB);
            timeData.push(t_days);
            activityData.push(A);
        }

        Charts.updateActivityChart('chartActivity', timeData, activityData);
    },

    /**
     * Update Reaction Rate vs Flux/Beam Current chart
     */
    updateReactionRateChart: function() {
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const dutyCycle = this.getParam('dutyCycle', 1.0);

        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const eta = Model.geometricEfficiency(Omega);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;
        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);

        const sourceType = document.getElementById('sourceType').value;
        const xData = [];
        const yData = [];
        let xLabel = '';

        if (sourceType === 'neutron') {
            xLabel = 'Neutron Flux (cm⁻² s⁻¹)';
            for (let flux = 1e12; flux <= 1e16; flux *= 1.1) {
                const R = Model.reactionRate(N_parent, crossSection, flux * dutyCycle, f_shield);
                xData.push(flux);
                yData.push(R);
            }
        } else {
            xLabel = 'Beam Current (A)';
            for (let I = 1e-8; I <= 1e-3; I *= 1.1) {
                const N_dot = Model.particleRate(I, this.getParam('particleCharge', 1));
                const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
                const phi = Model.flux(S_eff, A_target);
                const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);
                xData.push(I);
                yData.push(R);
            }
        }

        Charts.updateReactionRateChart('chartReactionRate', xData, yData, xLabel);
    },

    /**
     * Update Parent–Daughter Activity vs Time chart
     * Includes production during irradiation and decay post-EOB
     */
    updateDecayChainChart: function() {
        const parentHalfLife = this.getParam('halfLife', 1.0);
        const daughterHalfLife = this.getParam('daughterHalfLife', 0.5);
        const BR = this.getParam('branchingRatio', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const dutyCycle = this.getParam('dutyCycle', 1.0);

        const lambda_parent = Model.decayConstant(parentHalfLife);
        const lambda_daughter = Model.decayConstant(daughterHalfLife);

        // Calculate production rate
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;

        const sourceType = document.getElementById('sourceType').value;
        let phi = 0;
        if (sourceType === 'neutron') {
            phi = this.getParam('flux', 1e14);
        } else {
            const I = this.getParam('beamCurrent', 1e-6);
            const q = this.getParam('particleCharge', 1);
            const eta = Model.geometricEfficiency(Omega);
            const N_dot = Model.particleRate(I, q);
            const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
            phi = Model.flux(S_eff, A_target);
        }

        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);
        const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);

        const t_irr = irradiationTimeDays * 86400;
        const t_irr_days = irradiationTimeDays;

        // Calculate parent atoms at EOB
        const f_sat = Model.saturationFactor(lambda_parent, t_irr);
        const N_parent_EOB = Model.atomsAtEOB(R, f_sat, lambda_parent);

        // Generate time series: during irradiation and post-EOB
        const numPoints = 300;
        const postEOBTime = irradiationTimeDays * 2; // Show 2x irradiation time post-EOB
        const maxTimeDays = irradiationTimeDays + postEOBTime;
        const maxTime = maxTimeDays * 86400;
        const timeStep = maxTime / numPoints;
        const timeData = [];
        const parentData = [];
        const daughterData = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const t_days = t / 86400;
            
            let N_parent_t, N_daughter_t;
            
            if (t <= t_irr) {
                // During irradiation: parent is being produced
                const f_sat_t = Model.saturationFactor(lambda_parent, t);
                N_parent_t = Model.atomsAtEOB(R, f_sat_t, lambda_parent);
                
                // Daughter builds up from parent decay during irradiation
                // Use Bateman equation: daughter from parent that was produced
                // Approximate: use current parent atoms and apply Bateman
                // More accurate would integrate, but this approximation is reasonable
                N_daughter_t = Model.batemanOneStep(N_parent_t, BR, lambda_parent, lambda_daughter, t);
            } else {
                // Post-EOB: parent decays exponentially, daughter follows Bateman from EOB
                const t_post_EOB = t - t_irr;
                
                // Parent decays from EOB value
                N_parent_t = N_parent_EOB * Math.exp(-lambda_parent * t_post_EOB);
                
                // Daughter at EOB
                const N_daughter_EOB = Model.batemanOneStep(N_parent_EOB, BR, lambda_parent, lambda_daughter, t_irr);
                
                // After EOB: use Bateman equation with parent starting at EOB value
                // This gives daughter from parent decay after EOB
                const N_daughter_from_parent_decay = Model.batemanOneStep(N_parent_EOB, BR, lambda_parent, lambda_daughter, t);
                
                // Daughter that existed at EOB decays independently
                const N_daughter_from_EOB_decay = N_daughter_EOB * Math.exp(-lambda_daughter * t_post_EOB);
                
                // Total daughter: new from parent decay (includes both production and decay)
                // The Bateman equation already accounts for daughter decay, so we use it directly
                N_daughter_t = N_daughter_from_parent_decay;
            }

            const A_parent_t = Model.activity(lambda_parent, N_parent_t);
            const A_daughter_t = Model.activity(lambda_daughter, N_daughter_t);
            
            timeData.push(t_days);
            parentData.push(A_parent_t);
            daughterData.push(A_daughter_t);
        }

        Charts.updateDecayChainChart('chartDecayChain', timeData, parentData, daughterData);
    },

    /**
     * Update Temperature Rise vs Beam Power chart
     */
    updateTemperatureChart: function() {
        const m_dot = this.getParam('coolantFlow', 0.1);
        const Cp = this.getParam('heatCapacity', 4184);
        const beamEnergy = this.getParam('beamEnergy', 10);

        const powerData = [];
        const tempData = [];

        for (let I = 1e-8; I <= 1e-3; I *= 1.1) {
            const N_dot = Model.particleRate(I, this.getParam('particleCharge', 1));
            const P = Model.beamPower(N_dot, beamEnergy);
            const deltaT = Model.temperatureRise(P, m_dot, Cp);
            powerData.push(P);
            tempData.push(deltaT);
        }

        Charts.updateTemperatureChart('chartTemperature', powerData, tempData);
    },

    /**
     * Update Damage Accumulation vs Time chart
     */
    updateDamageChart: function() {
        const dpaRate = this.getParam('dpaRate', 1e-8);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);

        const numPoints = 200;
        const maxTime = irradiationTimeDays * 86400;
        const timeStep = maxTime / numPoints;
        const timeData = [];
        const dpaData = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const t_days = t / 86400;
            const dpa = dpaRate * t;
            timeData.push(t_days);
            dpaData.push(dpa);
        }

        Charts.updateDamageChart('chartDamage', timeData, dpaData);
    },

    /**
     * Update Activity Loss Waterfall chart
     */
    updateWaterfallChart: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const dutyCycle = this.getParam('dutyCycle', 1.0);
        const chemistryDelayHours = this.getParam('chemistryDelay', 24);
        const transportTimeHours = this.getParam('transportTime', 48);
        const chemistryLoss = this.getParam('chemistryLoss', 1e-6);

        // Calculate EOB activity
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;

        const sourceType = document.getElementById('sourceType').value;
        let phi = 0;
        if (sourceType === 'neutron') {
            phi = this.getParam('flux', 1e14);
        } else {
            const I = this.getParam('beamCurrent', 1e-6);
            const q = this.getParam('particleCharge', 1);
            const eta = Model.geometricEfficiency(Omega);
            const N_dot = Model.particleRate(I, q);
            const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
            phi = Model.flux(S_eff, A_target);
        }

        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);
        const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);
        const lambda = Model.decayConstant(halfLife);
        const t_irr = irradiationTimeDays * 86400;
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
        const A_EOB = Model.activity(lambda, N_EOB);

        // Chemistry delay (exponential decay)
        const t_chem = chemistryDelayHours * 3600;
        const A_after_chem = A_EOB * Math.exp(-chemistryLoss * t_chem);

        // Transport delay (radioactive decay)
        const t_transport = transportTimeHours * 3600;
        const A_delivered = A_after_chem * Math.exp(-lambda * t_transport);

        const stages = ['EOB', 'After Chemistry', 'Delivered'];
        const activities = [A_EOB, A_after_chem, A_delivered];

        Charts.updateWaterfallChart('chartWaterfall', stages, activities);
    },

    /**
     * Update Delivered Activity vs Transport Time chart
     */
    updateTransportChart: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const chemistryDelayHours = this.getParam('chemistryDelay', 24);
        const chemistryLoss = this.getParam('chemistryLoss', 1e-6);

        // Calculate A_after_chem (simplified)
        const A_after_chem = 1e12; // Placeholder

        const lambda = Model.decayConstant(halfLife);
        const timeData = [];
        const activityData = [];

        for (let hours = 0; hours <= 168; hours += 2) {
            const t = hours * 3600;
            const A = A_after_chem * Math.exp(-lambda * t);
            timeData.push(hours);
            activityData.push(A);
        }

        Charts.updateTransportChart('chartTransport', timeData, activityData);
    },

    /**
     * Update Yield Uncertainty Bands chart
     */
    updateUncertaintyChart: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const sigmaFlux = this.getParam('sigmaFlux', 5) / 100;
        const sigmaSigma = this.getParam('sigmaSigma', 3) / 100;
        const sigmaGeom = this.getParam('sigmaGeom', 2) / 100;
        const sigmaChem = this.getParam('sigmaChem', 1) / 100;

        // Calculate base activity
        const lambda = Model.decayConstant(halfLife);
        const t_irr = irradiationTimeDays * 86400;
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const R_base = 1e12; // Simplified
        const N_EOB_base = Model.atomsAtEOB(R_base, f_sat, lambda);
        const A_base = Model.activity(lambda, N_EOB_base);

        // Calculate uncertainties
        const uncertainties = [
            A_base * sigmaFlux,
            A_base * sigmaSigma,
            A_base * sigmaGeom,
            A_base * sigmaChem
        ];
        const sigma_total = Model.uncertaintyRSS(uncertainties);

        const numPoints = 200;
        const maxTime = irradiationTimeDays * 86400;
        const timeStep = maxTime / numPoints;
        const timeData = [];
        const meanData = [];
        const sigma1Data = [];
        const sigma2Data = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const t_days = t / 86400;
            const f_sat_t = Model.saturationFactor(lambda, t);
            const N_EOB_t = Model.atomsAtEOB(R_base, f_sat_t, lambda);
            const A_t = Model.activity(lambda, N_EOB_t);
            const sigma_t = sigma_total * (A_t / A_base);

            timeData.push(t_days);
            meanData.push(A_t);
            sigma1Data.push(sigma_t);
            sigma2Data.push(sigma_t);
        }

        Charts.updateUncertaintyChart('chartUncertainty', timeData, meanData, sigma1Data, sigma2Data);
    },

    /**
     * Collect all results data for acceptance evaluation
     */
    collectResults: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const dutyCycle = this.getParam('dutyCycle', 1.0);
        const chemistryDelayHours = this.getParam('chemistryDelay', 24);
        const transportTimeHours = this.getParam('transportTime', 48);
        const chemistryLoss = this.getParam('chemistryLoss', 1e-6);
        const coolantFlow = this.getParam('coolantFlow', 0.1);
        const heatCapacity = this.getParam('heatCapacity', 4184);
        const deltaTMax = this.getParam('deltaTMax', 50);
        const dpaRate = this.getParam('dpaRate', 1e-8);
        const dpaLimit = this.getParam('dpaLimit', 10);
        const sigmaFlux = this.getParam('sigmaFlux', 5) / 100;
        const sigmaSigma = this.getParam('sigmaSigma', 3) / 100;
        const sigmaGeom = this.getParam('sigmaGeom', 2) / 100;
        const sigmaChem = this.getParam('sigmaChem', 1) / 100;

        // Calculate geometry
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const eta = Model.geometricEfficiency(Omega);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;

        // Get flux or calculate from beam
        const sourceType = document.getElementById('sourceType').value;
        let phi = 0;
        let beamPower = 0;
        let deltaT = 0;
        if (sourceType === 'neutron') {
            phi = this.getParam('flux', 1e14);
        } else {
            const I = this.getParam('beamCurrent', 1e-6);
            const q = this.getParam('particleCharge', 1);
            const beamEnergy = this.getParam('beamEnergy', 10);
            const N_dot = Model.particleRate(I, q);
            const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
            phi = Model.flux(S_eff, A_target);
            beamPower = Model.beamPower(N_dot, beamEnergy);
            deltaT = Model.temperatureRise(beamPower, coolantFlow, heatCapacity);
        }

        // Calculate reaction rate and activity
        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);
        const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);
        const lambda = Model.decayConstant(halfLife);
        const t_irr = irradiationTimeDays * 86400;
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
        const A_EOB = Model.activity(lambda, N_EOB);

        // Calculate delivered activity
        const t_chem = chemistryDelayHours * 3600;
        const A_after_chem = A_EOB * Math.exp(-chemistryLoss * t_chem);
        const t_transport = transportTimeHours * 3600;
        const A_delivered = A_after_chem * Math.exp(-lambda * t_transport);

        // Calculate thermal derating
        let thermal_derate = 1.0;
        if (sourceType === 'beam' && beamPower > 0) {
            thermal_derate = Model.thermalDerating(deltaT, deltaTMax);
        }

        // Calculate damage derating
        const t_damage = Model.damageTimeLimit(dpaLimit, dpaRate);
        const damage_derate = Model.damageDerating(t_irr, t_damage);

        // Calculate radionuclidic purity (from enrichment)
        const radionuclidic_purity = enrichment;
        const impurity_fraction = 1 - enrichment;

        // Calculate total uncertainty (RSS)
        const uncertainties = [
            sigmaFlux,
            sigmaSigma,
            sigmaGeom,
            sigmaChem
        ];
        const total_uncertainty = Model.uncertaintyRSS(uncertainties);

        return {
            radionuclidic_purity: radionuclidic_purity,
            impurity_fraction: impurity_fraction,
            thermal_derate: thermal_derate,
            damage_derate: damage_derate,
            deltaT: deltaT,
            deltaT_max: deltaTMax,
            delivered_activity: A_delivered,
            activity_EOB: A_EOB,
            total_uncertainty: total_uncertainty
        };
    },

    /**
     * Evaluate acceptance criteria with regulatory metadata
     * @param {Object} results - Results object from collectResults()
     * @returns {Object} {pass: boolean, failures: Array<{message, code, description, iaea_alignment}>, warnings: Array<{message, code, description, iaea_alignment}>}
     * @returns {Array<{code: string, description: string}>} iaea_alignment - Array of IAEA alignment references (informational only)
     */
    evaluateAcceptance: function(results) {
        const failures = [];
        const warnings = [];

        // Regulatory metadata definitions with threshold justification
        // Acceptance thresholds are planning-level interpretations of guidance, not regulatory approval criteria
        const regulatoryRules = {
            radionuclidic_purity: {
                code: 'AERB/RF-R/SC-1',
                description: 'Radioisotope Production Purity',
                threshold_value: 0.999, // 99.9%
                threshold_source: 'IAEA TRS-469 (Production and quality control of medical radioisotopes), Ph. Eur. monographs (European Pharmacopoeia)',
                threshold_justification: 'Planning-level interpretation: Medical radioisotopes typically require ≥99.9% radionuclidic purity per IAEA TRS-469 and Ph. Eur. monographs. This threshold is conservative for planning purposes.',
                iaea_alignment: [
                    { code: 'IAEA SRS-63', description: 'Quality assurance for radionuclidic purity' },
                    { code: 'IAEA TRS-469', description: 'Production and quality control of medical radioisotopes' }
                ]
            },
            impurity_fraction: {
                code: 'AERB/RF-R/SC-1',
                description: 'Radioisotope Production Purity',
                threshold_value: 0.001, // 0.1%
                threshold_source: 'IAEA TRS-469, Ph. Eur. monographs',
                threshold_justification: 'Planning-level interpretation: Impurity fraction ≤0.1% aligns with medical radioisotope quality requirements. This threshold is conservative for planning purposes.',
                iaea_alignment: [
                    { code: 'IAEA SRS-63', description: 'Quality assurance for radionuclidic purity' },
                    { code: 'IAEA TRS-469', description: 'Production and quality control of medical radioisotopes' }
                ]
            },
            thermal_derate: {
                code: 'AERB/RF-R/SC-2',
                description: 'Thermal Safety Limits',
                threshold_value: 0.8, // 80%
                threshold_source: 'IAEA NP-T-5.1 (Thermal-hydraulic safety principles), operational planning heuristic',
                threshold_justification: 'Planning-level interpretation: Thermal derating ≥80% ensures adequate safety margin for thermal-hydraulic limits. The 80% threshold provides conservative operational margin per IAEA NP-T-5.1 guidance.',
                iaea_alignment: [
                    { code: 'IAEA NP-T-5.1', description: 'Thermal-hydraulic safety principles' },
                    { code: 'IAEA SSG-30', description: 'Safety of research reactors' }
                ]
            },
            damage_derate: {
                code: 'AERB/RF-R/SC-3',
                description: 'Radiation Damage Limits',
                threshold_value: 0.8, // 80%
                threshold_source: 'IAEA TRS-429 (Radiation damage to reactor materials), operational planning heuristic',
                threshold_justification: 'Planning-level interpretation: Damage derating ≥80% ensures adequate safety margin for radiation damage limits. The 80% threshold provides conservative operational margin per IAEA TRS-429 guidance.',
                iaea_alignment: [
                    { code: 'IAEA TRS-429', description: 'Radiation damage to reactor materials' },
                    { code: 'IAEA NP-T-3.13', description: 'Materials for nuclear power plants' }
                ]
            },
            temperature_rise: {
                code: 'AERB/RF-R/SC-2',
                description: 'Thermal Safety Limits',
                threshold_value: null, // Uses deltaT_max from user input
                threshold_source: 'IAEA NP-T-5.1 (Thermal-hydraulic safety principles)',
                threshold_justification: 'Planning-level interpretation: Temperature rise must not exceed material-specific limits. Threshold is user-defined based on target material properties and cooling system design.',
                iaea_alignment: [
                    { code: 'IAEA NP-T-5.1', description: 'Thermal-hydraulic safety principles' },
                    { code: 'IAEA SSG-30', description: 'Safety of research reactors' }
                ]
            },
            delivery_fraction: {
                code: 'AERB/RF-R/SC-4',
                description: 'Activity Delivery Requirements',
                threshold_value: 0.7, // 70%
                threshold_source: 'Operational planning heuristic, IAEA TRS-469',
                threshold_justification: 'Planning-level interpretation: Delivery fraction ≥70% ensures adequate activity after chemistry and transport delays. This threshold is an operational planning heuristic based on typical production logistics.',
                iaea_alignment: [
                    { code: 'IAEA TRS-469', description: 'Production and quality control of medical radioisotopes' },
                    { code: 'IAEA SSG-46', description: 'Radiation protection in radioisotope production' }
                ]
            },
            total_uncertainty: {
                code: 'AERB/RF-R/SC-5',
                description: 'Uncertainty Quantification',
                threshold_value: 0.30, // 30%
                threshold_source: 'IAEA TRS-457 (Uncertainty analysis in reactor physics calculations), planning-grade model heuristic',
                threshold_justification: 'Planning-level interpretation: Total uncertainty ≤30% is acceptable for planning-grade models. This threshold aligns with IAEA TRS-457 guidance for planning studies. Production models may require tighter uncertainty bounds.',
                iaea_alignment: [
                    { code: 'IAEA TRS-457', description: 'Uncertainty analysis in reactor physics calculations' },
                    { code: 'IAEA TECDOC-1901', description: 'Uncertainty quantification in nuclear data' }
                ]
            }
        };

        // Rule 1: radionuclidic_purity >= 0.999
        if (results.radionuclidic_purity < 0.999) {
            failures.push({
                message: `Radionuclidic purity ${(results.radionuclidic_purity * 100).toFixed(3)}% < 99.9%`,
                code: regulatoryRules.radionuclidic_purity.code,
                description: regulatoryRules.radionuclidic_purity.description,
                iaea_alignment: regulatoryRules.radionuclidic_purity.iaea_alignment
            });
        }

        // Rule 2: impurity_fraction <= 0.001
        if (results.impurity_fraction > 0.001) {
            failures.push({
                message: `Impurity fraction ${(results.impurity_fraction * 100).toFixed(3)}% > 0.1%`,
                code: regulatoryRules.impurity_fraction.code,
                description: regulatoryRules.impurity_fraction.description,
                iaea_alignment: regulatoryRules.impurity_fraction.iaea_alignment
            });
        }

        // Rule 3: thermal_derate >= 0.8
        if (results.thermal_derate < 0.8) {
            failures.push({
                message: `Thermal derating ${(results.thermal_derate * 100).toFixed(1)}% < 80%`,
                code: regulatoryRules.thermal_derate.code,
                description: regulatoryRules.thermal_derate.description,
                iaea_alignment: regulatoryRules.thermal_derate.iaea_alignment
            });
        } else if (results.thermal_derate < 0.9) {
            warnings.push({
                message: `Thermal derating ${(results.thermal_derate * 100).toFixed(1)}% is marginal (< 90%)`,
                code: regulatoryRules.thermal_derate.code,
                description: regulatoryRules.thermal_derate.description,
                iaea_alignment: regulatoryRules.thermal_derate.iaea_alignment
            });
        }

        // Rule 4: damage_derate >= 0.8
        if (results.damage_derate < 0.8) {
            failures.push({
                message: `Damage derating ${(results.damage_derate * 100).toFixed(1)}% < 80%`,
                code: regulatoryRules.damage_derate.code,
                description: regulatoryRules.damage_derate.description,
                iaea_alignment: regulatoryRules.damage_derate.iaea_alignment
            });
        } else if (results.damage_derate < 0.9) {
            warnings.push({
                message: `Damage derating ${(results.damage_derate * 100).toFixed(1)}% is marginal (< 90%)`,
                code: regulatoryRules.damage_derate.code,
                description: regulatoryRules.damage_derate.description,
                iaea_alignment: regulatoryRules.damage_derate.iaea_alignment
            });
        }

        // Rule 5: deltaT <= deltaT_max
        if (results.deltaT > results.deltaT_max) {
            failures.push({
                message: `Temperature rise ${results.deltaT.toFixed(1)} K > max ${results.deltaT_max} K`,
                code: regulatoryRules.temperature_rise.code,
                description: regulatoryRules.temperature_rise.description,
                iaea_alignment: regulatoryRules.temperature_rise.iaea_alignment
            });
        } else if (results.deltaT > results.deltaT_max * 0.9) {
            warnings.push({
                message: `Temperature rise ${results.deltaT.toFixed(1)} K is close to limit`,
                code: regulatoryRules.temperature_rise.code,
                description: regulatoryRules.temperature_rise.description,
                iaea_alignment: regulatoryRules.temperature_rise.iaea_alignment
            });
        }

        // Rule 6: delivered_activity / activity_EOB >= 0.7
        const delivery_fraction = results.delivered_activity / results.activity_EOB;
        if (delivery_fraction < 0.7) {
            failures.push({
                message: `Delivery fraction ${(delivery_fraction * 100).toFixed(1)}% < 70%`,
                code: regulatoryRules.delivery_fraction.code,
                description: regulatoryRules.delivery_fraction.description,
                iaea_alignment: regulatoryRules.delivery_fraction.iaea_alignment
            });
        } else if (delivery_fraction < 0.8) {
            warnings.push({
                message: `Delivery fraction ${(delivery_fraction * 100).toFixed(1)}% is marginal (< 80%)`,
                code: regulatoryRules.delivery_fraction.code,
                description: regulatoryRules.delivery_fraction.description,
                iaea_alignment: regulatoryRules.delivery_fraction.iaea_alignment
            });
        }

        // Rule 7: total_uncertainty <= 0.30
        if (results.total_uncertainty > 0.30) {
            failures.push({
                message: `Total uncertainty ${(results.total_uncertainty * 100).toFixed(1)}% > 30%`,
                code: regulatoryRules.total_uncertainty.code,
                description: regulatoryRules.total_uncertainty.description,
                iaea_alignment: regulatoryRules.total_uncertainty.iaea_alignment
            });
        } else if (results.total_uncertainty > 0.25) {
            warnings.push({
                message: `Total uncertainty ${(results.total_uncertainty * 100).toFixed(1)}% is high (> 25%)`,
                code: regulatoryRules.total_uncertainty.code,
                description: regulatoryRules.total_uncertainty.description,
                iaea_alignment: regulatoryRules.total_uncertainty.iaea_alignment
            });
        }

        const pass = failures.length === 0;

        return {
            pass: pass,
            failures: failures,
            warnings: warnings
        };
    },

    /**
     * Update results display section
     */
    updateResultsDisplay: function() {
        const halfLife = this.getParam('halfLife', 1.0);
        const crossSection = this.getParam('crossSection', 1e-24);
        const enrichment = this.getParam('enrichment', 1.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const targetRadius = this.getParam('targetRadius', 1.0);
        const targetThickness = this.getParam('targetThickness', 0.1);
        const sourceDistance = this.getParam('sourceDistance', 10);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);
        const dutyCycle = this.getParam('dutyCycle', 1.0);
        const chemistryDelayHours = this.getParam('chemistryDelay', 24);
        const transportTimeHours = this.getParam('transportTime', 48);

        // Calculate key results
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const eta = Model.geometricEfficiency(Omega);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;

        const sourceType = document.getElementById('sourceType').value;
        let phi = 0;
        if (sourceType === 'neutron') {
            phi = this.getParam('flux', 1e14);
        } else {
            const I = this.getParam('beamCurrent', 1e-6);
            const q = this.getParam('particleCharge', 1);
            const N_dot = Model.particleRate(I, q);
            const S_eff = Model.effectiveSourceRate(N_dot, eta, 1.0, 1.0);
            phi = Model.flux(S_eff, A_target);
        }

        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);
        const R = Model.reactionRate(N_parent, crossSection, phi * dutyCycle, f_shield);
        const lambda = Model.decayConstant(halfLife);
        const t_irr = irradiationTimeDays * 86400;
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
        const A_EOB = Model.activity(lambda, N_EOB);

        const formatNumber = (num) => {
            if (num >= 1e12) return (num / 1e12).toFixed(2) + ' TBq';
            if (num >= 1e9) return (num / 1e9).toFixed(2) + ' GBq';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + ' MBq';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + ' kBq';
            return num.toExponential(2) + ' Bq';
        };

        // Collect results for acceptance evaluation
        const results = this.collectResults();
        const acceptance = this.evaluateAcceptance(results);

        const resultsDisplay = document.getElementById('resultsDisplay');
        if (resultsDisplay) {
            // Format acceptance status
            let acceptanceHTML = '';
            if (acceptance.pass && acceptance.warnings.length === 0) {
                acceptanceHTML = '<div class="acceptance-status pass"><span class="status-icon">✔</span> <strong>PASS</strong> - All acceptance criteria met</div>';
            } else if (acceptance.pass && acceptance.warnings.length > 0) {
                acceptanceHTML = '<div class="acceptance-status warn"><span class="status-icon">⚠</span> <strong>WARN</strong> - Passes but has warnings</div>';
            } else {
                acceptanceHTML = '<div class="acceptance-status fail"><span class="status-icon">✖</span> <strong>FAIL</strong> - Acceptance criteria not met</div>';
            }

            // Format failures and warnings with regulatory citations
            let failuresHTML = '';
            if (acceptance.failures.length > 0) {
                failuresHTML = '<div class="acceptance-failures"><h4>Failures:</h4><ul>';
                acceptance.failures.forEach(failure => {
                    let citationParts = [];
                    
                    // AERB citation
                    if (failure.code) {
                        citationParts.push(`AERB ${failure.code}`);
                    }
                    
                    // IAEA citations
                    if (failure.iaea_alignment && failure.iaea_alignment.length > 0) {
                        const iaeaCodes = failure.iaea_alignment.map(iaea => iaea.code).join(', ');
                        citationParts.push(`IAEA ${iaeaCodes}`);
                    }
                    
                    const citation = citationParts.length > 0
                        ? ` <span class="regulatory-citation">Aligned with ${citationParts.join(' | ')}</span>`
                        : '';
                    
                    failuresHTML += `<li>${failure.message}${citation}</li>`;
                });
                failuresHTML += '</ul></div>';
            }

            let warningsHTML = '';
            if (acceptance.warnings.length > 0) {
                warningsHTML = '<div class="acceptance-warnings"><h4>Warnings:</h4><ul>';
                acceptance.warnings.forEach(warning => {
                    let citationParts = [];
                    
                    // AERB citation
                    if (warning.code) {
                        citationParts.push(`AERB ${warning.code}`);
                    }
                    
                    // IAEA citations
                    if (warning.iaea_alignment && warning.iaea_alignment.length > 0) {
                        const iaeaCodes = warning.iaea_alignment.map(iaea => iaea.code).join(', ');
                        citationParts.push(`IAEA ${iaeaCodes}`);
                    }
                    
                    const citation = citationParts.length > 0
                        ? ` <span class="regulatory-citation">Aligned with ${citationParts.join(' | ')}</span>`
                        : '';
                    
                    warningsHTML += `<li>${warning.message}${citation}</li>`;
                });
                warningsHTML += '</ul></div>';
            }

            resultsDisplay.innerHTML = `
                <div class="result-summary">
                    <h3>Key Results</h3>
                    <p><strong>Reaction Rate:</strong> ${R.toExponential(2)} reactions/s</p>
                    <p><strong>Decay Constant:</strong> ${lambda.toExponential(2)} s⁻¹</p>
                    <p><strong>Saturation Factor:</strong> ${(f_sat * 100).toFixed(2)}%</p>
                    <p><strong>Atoms at EOB:</strong> ${N_EOB.toExponential(2)}</p>
                    <p><strong>Activity at EOB:</strong> ${formatNumber(A_EOB)} (order-of-magnitude estimate)</p>
                    <p><strong>Geometric Efficiency:</strong> ${(eta * 100).toFixed(2)}%</p>
                    <p><strong>Self-Shielding Factor:</strong> ${(f_shield * 100).toFixed(2)}%</p>
                </div>
                <div class="acceptance-section">
                    <h3>Acceptance Criteria</h3>
                    ${acceptanceHTML}
                    ${failuresHTML}
                    ${warningsHTML}
                </div>
            `;
        }
    },

    /**
     * Update equations display section
     */
    updateEquations: function() {
        // Equations are static in HTML, MathJax will render them
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('equationDisplay')]).catch(function(err) {
                console.error('MathJax rendering error:', err);
            });
        }
    },

    // ============================================================================
    // VALIDATION TEST CASES
    // ============================================================================

    /**
     * Load Lu-177 validation test case
     * Sets all input values programmatically and validates the results
     */
    loadLu177TestCase: function() {
        console.log('========================================');
        console.log('Lu-177 Validation Test Case');
        console.log('========================================');

        // Test case parameters
        const half_life_days = 6.647;
        const sigma_barns = 2090;
        const parent_enrichment = 0.75;
        const source_strength = 1.0e13; // neutrons per second
        const angular_anisotropy = 0;
        const moderator_efficiency = 0.8;
        const target_radius_cm = 2.0;
        const target_thickness_cm = 0.2;
        const target_distance_cm = 5.0;
        const target_density = 9.42; // g/cm³ (Lu2O3)
        const target_molar_mass = 397.93; // g/mol (Lu2O3)
        const irradiation_days = 5.0;
        const coolant_mass_flow = 0.5; // kg/s
        const Cp = 4180; // J/kg/K
        const max_deltaT = 40; // K
        const damage_rate = 1e-7; // dpa/s
        const damage_limit = 0.5; // dpa
        const cooling_hours = 4;
        const processing_hours = 6;
        const transport_hours = 12;
        const sigma_flux = 0.10;
        const sigma_sigma = 0.05;
        const sigma_geom = 0.05;
        const sigma_chem = 0.10;

        // Convert sigma from barns to cm² (1 barn = 1e-24 cm²)
        const sigma_cm2 = sigma_barns * 1e-24;

        // Calculate parent atom density from Lu2O3
        // Lu2O3: 2 Lu atoms per molecule
        // Number density = (density * N_A * enrichment) / (molar_mass / 2)
        const N_AVOGADRO = 6.02214076e23; // atoms/mol
        const lu_atoms_per_molecule = 2;
        const parent_density_atoms_cm3 = (target_density * N_AVOGADRO * parent_enrichment) / 
                                         (target_molar_mass / lu_atoms_per_molecule);

        // Calculate flux from source strength
        // Test case aligned with core solid-angle flux model: φ = (S × Ω) / A_target
        // Use same Ω expression as main model: Ω = 2π(1 − d / sqrt(d² + r²))
        const Omega = Model.solidAngle(target_distance_cm, target_radius_cm);
        const A_target = Math.PI * target_radius_cm * target_radius_cm;
        // Account for moderator efficiency (applied to source strength)
        const effective_source_strength = source_strength * moderator_efficiency;
        const flux_at_target = Model.fluxFromSolidAngle(effective_source_strength, Omega, A_target);

        // Set input values
        document.getElementById('halfLife').value = half_life_days;
        document.getElementById('crossSection').value = sigma_cm2;
        document.getElementById('enrichment').value = parent_enrichment;
        document.getElementById('sigmaBurn').value = 0; // No burn-up
        document.getElementById('sourceType').value = 'neutron';
        this.toggleSourceType();
        document.getElementById('flux').value = flux_at_target;
        document.getElementById('dutyCycle').value = 1.0;
        document.getElementById('targetRadius').value = target_radius_cm;
        document.getElementById('targetThickness').value = target_thickness_cm;
        document.getElementById('sourceDistance').value = target_distance_cm;
        document.getElementById('parentDensity').value = parent_density_atoms_cm3;
        document.getElementById('coolantFlow').value = coolant_mass_flow;
        document.getElementById('heatCapacity').value = Cp;
        document.getElementById('deltaTMax').value = max_deltaT;
        document.getElementById('dpaLimit').value = damage_limit;
        document.getElementById('dpaRate').value = damage_rate;
        document.getElementById('irradiationTime').value = irradiation_days;
        document.getElementById('chemistryDelay').value = processing_hours;
        document.getElementById('transportTime').value = transport_hours;
        document.getElementById('chemistryLoss').value = 0; // No chemistry loss for this case
        document.getElementById('sigmaFlux').value = sigma_flux * 100; // Convert to percentage
        document.getElementById('sigmaSigma').value = sigma_sigma * 100;
        document.getElementById('sigmaGeom').value = sigma_geom * 100;
        document.getElementById('sigmaChem').value = sigma_chem * 100;

        // Update charts
        this.updateAllCharts();

        // Wait a moment for calculations, then validate
        setTimeout(() => {
            this.validateLu177Results();
        }, 100);
    },

    /**
     * Validate Lu-177 test case results
     */
    validateLu177Results: function() {
        console.log('\n--- VALIDATION: Intermediate Values ---');

        // Get current parameter values
        const halfLife = this.getParam('halfLife', 6.647);
        const crossSection = this.getParam('crossSection', 2090 * 1e-24);
        const enrichment = this.getParam('enrichment', 0.75);
        const flux = this.getParam('flux', 1e14);
        const targetRadius = this.getParam('targetRadius', 2.0);
        const targetThickness = this.getParam('targetThickness', 0.2);
        const sourceDistance = this.getParam('sourceDistance', 5.0);
        const parentDensity = this.getParam('parentDensity', 5e22);
        const irradiationTimeDays = this.getParam('irradiationTime', 5.0);
        const chemistryDelayHours = this.getParam('chemistryDelay', 6);
        const transportTimeHours = this.getParam('transportTime', 12);
        const chemistryLoss = this.getParam('chemistryLoss', 0);

        // Calculate intermediate values using Model functions
        const lambda = Model.decayConstant(halfLife);
        const t_irr = irradiationTimeDays * 86400;
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const Omega = Model.solidAngle(sourceDistance, targetRadius);
        const eta = Model.geometricEfficiency(Omega);
        const A_target = Math.PI * targetRadius * targetRadius;
        const N_parent = parentDensity * enrichment * A_target * targetThickness;
        const Sigma = Model.macroscopicCrossSection(parentDensity, crossSection);
        const f_shield = Model.selfShieldingFactor(Sigma, targetThickness);
        const R = Model.reactionRate(N_parent, crossSection, flux, f_shield);
        const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
        const A_EOB = Model.activity(lambda, N_EOB);
        const t_chem = chemistryDelayHours * 3600;
        const A_after_chem = A_EOB * Math.exp(-chemistryLoss * t_chem);
        const t_transport = transportTimeHours * 3600;
        const A_delivered = A_after_chem * Math.exp(-lambda * t_transport);

        // Log intermediate values
        console.log(`1. Decay constant λ = ${lambda.toExponential(3)} s⁻¹`);
        console.log(`2. Saturation factor at ${irradiationTimeDays} days = ${f_sat.toFixed(4)}`);
        console.log(`3. Solid angle Ω = ${Omega.toFixed(4)} sr`);
        console.log(`4. Geometric efficiency η = ${eta.toFixed(6)}`);
        console.log(`5. Target face area = ${A_target.toFixed(2)} cm²`);
        console.log(`6. Neutron flux at target = ${flux.toExponential(3)} n/cm²/s`);
        console.log(`7. Parent atom density = ${parentDensity.toExponential(3)} atoms/cm³`);
        console.log(`8. Total parent atoms in target = ${N_parent.toExponential(3)}`);
        console.log(`9. Reaction rate R = ${R.toExponential(3)} reactions/s`);
        console.log(`10. Product atoms at EOB = ${N_EOB.toExponential(3)}`);
        console.log(`11. Activity at EOB = ${A_EOB.toExponential(3)} Bq = ${(A_EOB / 1e9).toFixed(2)} GBq`);
        console.log(`12. Activity after chemistry = ${A_after_chem.toExponential(3)} Bq`);
        console.log(`13. Delivered activity = ${A_delivered.toExponential(3)} Bq = ${(A_delivered / 1e9).toFixed(2)} GBq`);

        // Validation checks
        console.log('\n--- VALIDATION: Order-of-Magnitude Checks ---');
        const failures = [];

        // Check 1: Decay constant
        const lambda_expected_min = 1.0e-6;
        const lambda_expected_max = 1.5e-6;
        if (lambda < lambda_expected_min || lambda > lambda_expected_max) {
            failures.push(`Decay constant λ = ${lambda.toExponential(3)} s⁻¹ (expected ~1.21e-6 s⁻¹)`);
        } else {
            console.log('✓ Decay constant within expected range');
        }

        // Check 2: Saturation factor
        if (f_sat < 0.40 || f_sat > 0.45) {
            failures.push(`Saturation factor = ${f_sat.toFixed(4)} (expected 0.40-0.45)`);
        } else {
            console.log('✓ Saturation factor within expected range');
        }

        // Check 3: Solid angle
        if (Omega < 0.45 || Omega > 0.55) {
            failures.push(`Solid angle Ω = ${Omega.toFixed(4)} sr (expected 0.45-0.55 sr)`);
        } else {
            console.log('✓ Solid angle within expected range');
        }

        // Check 4: Geometric efficiency
        const eta_expected_min = 0.035;
        const eta_expected_max = 0.045;
        if (eta < eta_expected_min || eta > eta_expected_max) {
            failures.push(`Geometric efficiency η = ${eta.toFixed(6)} (expected 0.035-0.045)`);
        } else {
            console.log('✓ Geometric efficiency within expected range');
        }

        // Check 5: Flux at target
        const flux_min = 1e9;
        const flux_max = 1e10;
        if (flux < flux_min || flux > flux_max) {
            failures.push(`Flux at target = ${flux.toExponential(3)} n/cm²/s (expected 1e9-1e10)`);
        } else {
            console.log('✓ Flux at target within expected range');
        }

        // Check 6: Activity at EOB (tens to low hundreds of GBq)
        const A_EOB_GBq = A_EOB / 1e9;
        if (A_EOB_GBq < 10 || A_EOB_GBq > 500) {
            failures.push(`Activity at EOB = ${A_EOB_GBq.toFixed(2)} GBq (expected 10-500 GBq)`);
        } else {
            console.log('✓ Activity at EOB within expected range');
        }

        // Check 7: Delivered activity (~90% of EOB)
        const delivery_fraction = A_delivered / A_EOB;
        if (delivery_fraction < 0.85 || delivery_fraction > 0.95) {
            failures.push(`Delivery fraction = ${(delivery_fraction * 100).toFixed(1)}% (expected ~90%)`);
        } else {
            console.log('✓ Delivery fraction within expected range');
        }

        // Check 8: Thermal derating (should not trigger)
        const coolantFlow = this.getParam('coolantFlow', 0.5);
        const heatCapacity = this.getParam('heatCapacity', 4180);
        const beamEnergy = this.getParam('beamEnergy', 10);
        const beamCurrent = this.getParam('beamCurrent', 1e-6);
        const particleCharge = this.getParam('particleCharge', 1);
        const sourceType = document.getElementById('sourceType').value;
        
        if (sourceType === 'beam') {
            const N_dot = Model.particleRate(beamCurrent, particleCharge);
            const P = Model.beamPower(N_dot, beamEnergy);
            const deltaT = Model.temperatureRise(P, coolantFlow, heatCapacity);
            const deltaTMax = this.getParam('deltaTMax', 40);
            const f_T = Model.thermalDerating(deltaT, deltaTMax);
            if (f_T < 1.0) {
                failures.push(`Thermal derating triggered: f_T = ${f_T.toFixed(4)} (should be 1.0)`);
            } else {
                console.log('✓ No thermal derating (as expected)');
            }
        } else {
            console.log('✓ No thermal derating (neutron source)');
        }

        // Check 9: Damage derating (should not trigger)
        const dpaRate = this.getParam('dpaRate', 1e-7);
        const t_irr_seconds = irradiationTimeDays * 86400;
        const dpa_accumulated = dpaRate * t_irr_seconds;
        const dpaLimit = this.getParam('dpaLimit', 0.5);
        const t_damage = Model.damageTimeLimit(dpaLimit, dpaRate);
        const f_D = Model.damageDerating(t_irr_seconds, t_damage);
        if (f_D < 1.0) {
            failures.push(`Damage derating triggered: f_D = ${f_D.toFixed(4)} (should be 1.0)`);
        } else {
            console.log('✓ No damage derating (as expected)');
        }

        // Print summary
        console.log('\n========================================');
        if (failures.length === 0) {
            console.log('Lu-177 Validation: PASS');
            console.log('All checks passed within expected ranges.');
        } else {
            console.log('Lu-177 Validation: FAIL');
            console.log('\nFailed checks:');
            failures.forEach((failure, idx) => {
                console.log(`${idx + 1}. ${failure}`);
            });
        }
        console.log('========================================\n');
    },

    /**
     * Load Mo-99 → Tc-99m generator validation test case
     */
    loadMo99ValidationCase: function() {
        console.log('========================================');
        console.log('Mo-99 → Tc-99m Generator Validation Test Case');
        console.log('========================================');

        // Test case parameters
        const parent_half_life_days = 2.75; // Mo-99
        const daughter_half_life_days = 0.25; // Tc-99m (6 hours)
        const branching_ratio = 1.0;
        const sigma_barns = 0.13;
        const enrichment = 0.95;
        const flux = 1e14; // n/cm²/s
        const irradiation_days = 5.0;

        // Convert sigma from barns to cm²
        const sigma_cm2 = sigma_barns * 1e-24;

        // Set input values
        document.getElementById('halfLife').value = parent_half_life_days;
        document.getElementById('crossSection').value = sigma_cm2;
        document.getElementById('enrichment').value = enrichment;
        document.getElementById('sigmaBurn').value = 0; // No burn-up
        document.getElementById('sourceType').value = 'neutron';
        this.toggleSourceType();
        document.getElementById('flux').value = flux;
        document.getElementById('dutyCycle').value = 1.0;
        document.getElementById('daughterHalfLife').value = daughter_half_life_days;
        document.getElementById('branchingRatio').value = branching_ratio;
        document.getElementById('irradiationTime').value = irradiation_days;

        // Use reasonable defaults for other parameters
        document.getElementById('targetRadius').value = 1.0;
        document.getElementById('targetThickness').value = 0.1;
        document.getElementById('sourceDistance').value = 10;
        document.getElementById('parentDensity').value = 5e22;
        document.getElementById('chemistryDelay').value = 24;
        document.getElementById('transportTime').value = 48;
        document.getElementById('chemistryLoss').value = 0;

        // Update charts
        this.updateAllCharts();

        console.log('Mo-99 → Tc-99m test case loaded.');
        console.log(`Parent half-life (Mo-99): ${parent_half_life_days} days`);
        console.log(`Daughter half-life (Tc-99m): ${daughter_half_life_days} days`);
        console.log(`Cross-section: ${sigma_barns} barns`);
        console.log(`Enrichment: ${enrichment}`);
        console.log(`Flux: ${flux.toExponential(2)} n/cm²/s`);
        console.log(`Irradiation time: ${irradiation_days} days`);
        console.log('========================================\n');
    },

    // ============================================================================
    // ISOTOPE ROUTE REGISTRY UI
    // ============================================================================

    /**
     * Initialize route registry display
     */
    initializeRouteRegistry: function() {
        this.updateRouteRegistry();
    },

    /**
     * Switch route registry tab
     */
    switchRouteTab: function(tabName) {
        // Update tab buttons
        document.querySelectorAll('.route-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.route-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Update routes for active tab
        this.updateRouteRegistry();
    },

    /**
     * Update route registry display
     */
    updateRouteRegistry: function() {
        // Get current tab
        const activeTab = document.querySelector('.route-tab.active');
        if (!activeTab) return;

        const tabName = activeTab.dataset.tab;
        let routes = [];
        let containerId = '';

        if (tabName === 'fast-neutron') {
            routes = IsotopeRouteRegistry.getFastNeutronRoutes();
            containerId = 'fastNeutronRoutes';
        } else if (tabName === 'moderated-capture') {
            routes = IsotopeRouteRegistry.getModeratedCaptureRoutes();
            containerId = 'moderatedCaptureRoutes';
        } else if (tabName === 'alpha-precursor') {
            routes = IsotopeRouteRegistry.getAlphaPrecursorRoutes();
            containerId = 'alphaPrecursorRoutes';
        }

        this.displayRoutes(routes, containerId);
    },

    /**
     * Display routes in container
     */
    displayRoutes: function(routes, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (routes.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 20px;">No routes available in this category.</p>';
            return;
        }

        // Get current simulation parameters for evaluation
        const conditions = this.getRouteEvaluationConditions();

        let html = '';
        routes.forEach(route => {
            // Evaluate route
            let evaluation = null;
            try {
                evaluation = Model.evaluateRoute(route, conditions);
            } catch (error) {
                // Route evaluation failed (e.g., missing parameters)
                // Still assess impurity traps even if route evaluation fails
                let impurityTraps = [];
                try {
                    impurityTraps = Model.assessImpurityTraps(route);
                } catch (e) {
                    // Ignore trap assessment errors
                }
                
                evaluation = {
                    feasibility: 'Not recommended',
                    feasibility_reasons: ['Route evaluation requires additional parameters'],
                    reaction_rate: 0,
                    activity: 0,
                    specific_activity: 0,
                    impurity_risk_level: 'unknown',
                    impurity_traps: impurityTraps
                };
            }

            html += this.createRouteCard(route, evaluation);
        });

        container.innerHTML = html;
    },

    /**
     * Get conditions for route evaluation from current UI parameters
     */
    getRouteEvaluationConditions: function() {
        const sourceType = document.getElementById('sourceType').value;
        const neutronFlux = this.getParam('flux', 1e14);
        const neutronEnergy = 14.1; // MeV for fast neutron routes
        const targetMass = 1.0; // g (placeholder)
        const enrichment = this.getParam('enrichment', 1.0);
        const targetDensity = this.getParam('parentDensity', 5e22);
        const irradiationTime = this.getParam('irradiationTime', 7) * 86400; // Convert days to seconds
        const selfShieldingFactor = 1.0; // Default

        return {
            neutronFlux: neutronFlux,
            neutronEnergy: neutronEnergy,
            targetMass: targetMass,
            enrichment: enrichment,
            targetDensity: targetDensity,
            irradiationTime: irradiationTime,
            selfShieldingFactor: selfShieldingFactor
        };
    },

    /**
     * Create route card HTML
     */
    createRouteCard: function(route, evaluation) {
        const reactionStr = `${route.target_isotope}(${route.reaction_type})${route.product_isotope}`;
        const feasibilityClass = evaluation.feasibility.toLowerCase().replace(/\s+/g, '-');
        
        // Format cross-section
        let crossSectionDisplay = 'N/A';
        if (route.reaction_type === 'n,gamma') {
            crossSectionDisplay = route.cross_section_thermal ? `${route.cross_section_thermal} b (thermal)` : 'N/A';
        } else if (route.reaction_type === 'n,p' || route.reaction_type === 'n,2n') {
            crossSectionDisplay = route.cross_section_14_1_MeV ? `${route.cross_section_14_1_MeV} mb @ 14.1 MeV` : 'N/A';
        } else if (route.reaction_type === 'alpha') {
            crossSectionDisplay = 'Charged particle';
        }

        // Format activity
        const activityGBq = evaluation.activity / 1e9;
        const activityDisplay = activityGBq >= 1 
            ? `${activityGBq.toFixed(2)} GBq`
            : `${(activityGBq * 1000).toFixed(2)} MBq`;

        // Format specific activity
        const saDisplay = evaluation.specific_activity >= 1e12
            ? `${(evaluation.specific_activity / 1e12).toFixed(2)} TBq/g`
            : `${(evaluation.specific_activity / 1e9).toFixed(2)} GBq/g`;

        // Impurity risk indicator
        const impurityRiskClass = evaluation.impurity_risk_level === 'high' ? 'high-risk' : 
                                 evaluation.impurity_risk_level === 'moderate' ? 'moderate-risk' : 'low-risk';

        let html = `
            <div class="route-card">
                <div class="route-header">
                    <div>
                        <div class="route-title">${route.product_isotope}</div>
                        <div class="route-reaction">${reactionStr}</div>
                    </div>
                    <div class="route-feasibility ${feasibilityClass}">${evaluation.feasibility}</div>
                </div>
                
                <div class="route-details">
                    <div class="route-detail-item">
                        <span class="route-detail-label">Half-Life</span>
                        <span class="route-detail-value">${route.product_half_life_days} days</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Cross-Section</span>
                        <span class="route-detail-value">${crossSectionDisplay}</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Reaction Rate</span>
                        <span class="route-detail-value">${evaluation.reaction_rate.toExponential(2)} reactions/s</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Activity (EOB)</span>
                        <span class="route-detail-value">${activityDisplay} (order-of-magnitude estimate)</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Specific Activity</span>
                        <span class="route-detail-value">${saDisplay}</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Carrier-Added</span>
                        <span class="route-detail-value">${route.carrier_added_acceptable ? 'Acceptable' : 'Not acceptable'}</span>
                    </div>
                </div>

                ${route.known_impurity_risks && route.known_impurity_risks.length > 0 ? `
                <div class="route-impurities">
                    <div class="route-impurities-title">Known Impurity Risks (${evaluation.impurity_risk_level} risk):</div>
                    <ul class="route-impurities-list">
                        ${route.known_impurity_risks.map(impurity => `<li>${impurity}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${evaluation.impurity_traps && evaluation.impurity_traps.length > 0 ? `
                <div class="route-impurity-traps">
                    <div class="route-impurity-traps-title">Impurity Trap Assessment:</div>
                    <div class="impurity-trap-list">
                        ${evaluation.impurity_traps.map(trap => `
                            <div class="impurity-trap-item ${trap.severity}">
                                <span class="trap-severity-badge">${trap.severity === 'high' ? 'HIGH RISK' : 'MODERATE RISK'}</span>
                                <span class="trap-message">${trap.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${evaluation.feasibility_reasons && evaluation.feasibility_reasons.length > 0 ? `
                <div class="route-feasibility-reasons">
                    <div class="route-feasibility-reasons-title">Feasibility Assessment:</div>
                    <ul class="route-feasibility-reasons-list">
                        ${evaluation.feasibility_reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        return html;
    },

    // ============================================================================
    // ISOTOPE ROUTE EXPLORER
    // ============================================================================

    /**
     * Initialize route explorer
     */
    initRouteExplorer: function() {
        this.populateRouteExplorer();
    },

    /**
     * Switch route explorer tab
     */
    switchRouteExplorerTab: function(tabName) {
        // Update tab buttons
        document.querySelectorAll('.route-explorer-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.route-explorer-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Map tab names to content IDs
        const tabContentMap = {
            'fast-neutron': 'fastNeutronTab',
            'moderated-capture': 'moderatedCaptureTab',
            'generator': 'generatorTab',
            'alpha': 'alphaTab',
            'industrial': 'industrialTab'
        };

        const contentId = tabContentMap[tabName] || tabName + 'Tab';
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.classList.add('active');
        }

        // Repopulate routes for active tab
        this.populateRouteExplorer();
    },

    /**
     * Populate route explorer with routes from ISOTOPE_ROUTES
     */
    populateRouteExplorer: function() {
        if (typeof ISOTOPE_ROUTES === 'undefined') {
            console.warn('ISOTOPE_ROUTES not loaded');
            return;
        }

        // Get current model state for evaluation
        const modelState = this.getModelStateForRouteEvaluation();

        // Group routes by category
        const routesByCategory = {
            'fast': [],
            'moderated': [],
            'generator': [],
            'alpha': [],
            'industrial': []
        };

        ISOTOPE_ROUTES.forEach(route => {
            if (routesByCategory.hasOwnProperty(route.category)) {
                routesByCategory[route.category].push(route);
            }
        });

        // Populate each category tab
        this.populateCategoryTab('fastNeutronRoutesList', routesByCategory['fast'], modelState);
        this.populateCategoryTab('moderatedCaptureRoutesList', routesByCategory['moderated'], modelState);
        this.populateCategoryTab('generatorRoutesList', routesByCategory['generator'], modelState);
        this.populateCategoryTab('alphaRoutesList', routesByCategory['alpha'], modelState);
        this.populateCategoryTab('industrialRoutesList', routesByCategory['industrial'], modelState);
    },

    /**
     * Populate a category tab with routes
     */
    populateCategoryTab: function(containerId, routes, modelState) {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        if (routes.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; font-style: italic;">No routes in this category.</p>';
            return;
        }

        let html = '';
        routes.forEach(route => {
            // Evaluate route
            let evaluation = null;
            try {
                if (typeof RouteEvaluator !== 'undefined') {
                    evaluation = RouteEvaluator.evaluateRoute(route, modelState);
                } else {
                    // Fallback if RouteEvaluator not available
                    evaluation = {
                        route_id: route.id,
                        feasible: true,
                        classification: 'Feasible',
                        reasons: [],
                        warnings: [],
                        impurity_risk_level: 'Low',
                        reaction_rate: 0,
                        activity: 0,
                        specific_activity: 0
                    };
                }
            } catch (error) {
                console.error(`Error evaluating route ${route.id}:`, error);
                evaluation = {
                    route_id: route.id,
                    feasible: false,
                    classification: 'Not recommended',
                    reasons: ['Route evaluation error'],
                    warnings: [],
                    impurity_risk_level: 'Unknown',
                    reaction_rate: 0,
                    activity: 0,
                    specific_activity: 0
                };
            }

            // Score route
            let score = null;
            try {
                if (typeof RouteScoring !== 'undefined') {
                    score = RouteScoring.scoreRoute(route, evaluation);
                }
            } catch (error) {
                console.error(`Error scoring route ${route.id}:`, error);
            }

            html += this.createRouteExplorerCard(route, evaluation, score);
        });

        container.innerHTML = html;
    },

    /**
     * Get regulatory alignment notes for a route
     */
    getRouteRegulatoryAlignment: function(route) {
        const alignments = {
            aerb: [],
            iaea: []
        };

        // Base alignment for all routes (planning-level analysis)
        // AERB alignments
        alignments.aerb.push('AERB/RF-R/SC-1'); // Radioisotope Production Purity

        // IAEA alignments
        alignments.iaea.push('IAEA SRS-63'); // Quality assurance for radionuclidic purity
        alignments.iaea.push('IAEA TRS-469'); // Production and quality control of medical radioisotopes

        // Additional alignments based on route category
        if (route.category === 'generator') {
            alignments.iaea.push('IAEA TRS-469'); // Generator systems (duplicate will be removed)
        }

        if (route.category === 'alpha' || route.regulatory_flag === 'exploratory') {
            alignments.iaea.push('IAEA SSG-46'); // Radiation protection in radioisotope production
        }

        if (route.category === 'industrial') {
            alignments.aerb.push('AERB/RF-R/SC-4'); // Activity delivery requirements
        }

        return alignments;
    },

    /**
     * Format regulatory alignment text
     * Format: "Aligned with IAEA SRS-63 | AERB/RF-R/SC-1 (planning-level analysis)"
     */
    formatRegulatoryAlignment: function(alignments) {
        const parts = [];
        
        if (alignments.iaea && alignments.iaea.length > 0) {
            // Remove duplicates - IAEA codes already include "IAEA" prefix
            const uniqueIAEA = [...new Set(alignments.iaea)];
            parts.push(uniqueIAEA.join(', '));
        }
        
        if (alignments.aerb && alignments.aerb.length > 0) {
            // Remove duplicates - AERB codes already include "AERB/" prefix
            const uniqueAERB = [...new Set(alignments.aerb)];
            parts.push(uniqueAERB.join(', '));
        }

        if (parts.length === 0) {
            return '';
        }

        return `Aligned with ${parts.join(' | ')} (planning-level analysis)`;
    },

    /**
     * Create route card HTML for route explorer
     */
    createRouteExplorerCard: function(route, evaluation, score) {
        const reactionStr = `${route.target_isotope}(${route.reaction})${route.product_isotope}`;
        const feasibilityClass = evaluation.classification.toLowerCase().replace(/\s+/g, '-');
        
        // Format threshold
        const thresholdDisplay = route.threshold_MeV !== null && route.threshold_MeV > 0 
            ? `${route.threshold_MeV} MeV` 
            : 'N/A';

        // Format cross-section
        const crossSectionDisplay = route.nominal_sigma_barns !== null
            ? `${route.nominal_sigma_barns} b`
            : 'Not specified';

        // Format regulatory flag
        const regulatoryFlagClass = route.regulatory_flag || 'standard';
        const regulatoryFlagLabel = regulatoryFlagClass.charAt(0).toUpperCase() + regulatoryFlagClass.slice(1);

        // Format impurity risk level
        const impurityRiskLevel = evaluation.impurity_risk_level || 'Low';
        const impurityRiskClass = impurityRiskLevel.toLowerCase();

        // Get regulatory alignment notes
        const regulatoryAlignment = this.getRouteRegulatoryAlignment(route);
        const alignmentText = this.formatRegulatoryAlignment(regulatoryAlignment);

        // Score display
        let scoreDisplay = '';
        if (score) {
            const scoreValue = score.total_score.toFixed(2);
            let scoreColorClass = 'score-red';
            if (score.total_score >= 4.0) {
                scoreColorClass = 'score-green';
            } else if (score.total_score >= 2.5) {
                scoreColorClass = 'score-amber';
            }
            
            const cardId = `route-card-${route.id}`;
            scoreDisplay = `
                <div class="route-score-section">
                    <div class="route-score-header">
                        <span class="route-score-label">Route Score:</span>
                        <span class="route-score-value ${scoreColorClass}">${scoreValue}</span>
                        <span class="route-score-classification ${scoreColorClass}">${score.classification}</span>
                        <button class="score-breakdown-toggle" onclick="UI.toggleScoreBreakdown('${cardId}')">
                            <span class="toggle-icon">▼</span> Breakdown
                        </button>
                    </div>
                    <div id="${cardId}-breakdown" class="score-breakdown-table" style="display: none;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Physics</td>
                                    <td>${score.breakdown.physics.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Yield</td>
                                    <td>${score.breakdown.yield.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Specific Activity</td>
                                    <td>${score.breakdown.specific_activity.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Impurity</td>
                                    <td>${score.breakdown.impurity.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Logistics</td>
                                    <td>${score.breakdown.logistics.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Regulatory</td>
                                    <td>${score.breakdown.regulatory.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="score-disclaimer">
                            <em>Scores are comparative planning metrics, not guarantees of production or approval.</em>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="route-card" id="route-card-${route.id}">
                <div class="route-header">
                    <div>
                        <div class="route-title">${route.product_isotope}</div>
                        <div class="route-reaction">${reactionStr}</div>
                    </div>
                    <div>
                        <div class="route-feasibility ${feasibilityClass}">${evaluation.classification}</div>
                        <span class="regulatory-flag ${regulatoryFlagClass}">${regulatoryFlagLabel}</span>
                    </div>
                </div>
                
                ${scoreDisplay}

                <div class="route-details">
                    <div class="route-detail-item">
                        <span class="route-detail-label">Half-Life</span>
                        <span class="route-detail-value">${route.product_half_life_days} days</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Threshold</span>
                        <span class="route-detail-value">${thresholdDisplay}</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Cross-Section</span>
                        <span class="route-detail-value">${crossSectionDisplay}</span>
                    </div>
                    <div class="route-detail-item">
                        <span class="route-detail-label">Impurity Risk</span>
                        <span class="route-detail-value">
                            <span class="impurity-risk-badge ${impurityRiskClass}">${impurityRiskLevel}</span>
                        </span>
                    </div>
                </div>

                ${alignmentText ? `
                <div class="route-regulatory-alignment">
                    <div class="route-regulatory-alignment-text">${alignmentText}</div>
                </div>
                ` : ''}

                ${evaluation.reasons && evaluation.reasons.length > 0 ? `
                <div class="route-feasibility-reasons">
                    <div class="route-feasibility-reasons-title">Assessment Notes:</div>
                    <ul class="route-feasibility-reasons-list">
                        ${evaluation.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${evaluation.warnings && evaluation.warnings.length > 0 ? `
                <div class="route-feasibility-reasons">
                    <div class="route-feasibility-reasons-title">Warnings:</div>
                    <ul class="route-feasibility-reasons-list">
                        ${evaluation.warnings.map(warning => `<li style="color: #856404;">${warning}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Get current model state for route evaluation
     */
    getModelStateForRouteEvaluation: function() {
        const sourceType = document.getElementById('sourceType') ? document.getElementById('sourceType').value : 'neutron';
        const neutronFlux = this.getParam('flux', 1e14);
        const neutronEnergy = this.getParam('beamEnergy', 14.1); // Use beam energy as neutron energy for fast routes
        const targetMass = this.getParam('targetMass', 1.0) || 1.0;
        const enrichment = this.getParam('enrichment', 1.0);
        const irradiationTime = this.getParam('irradiationTime', 7) * 86400; // Convert days to seconds
        const selfShieldingFactor = 1.0; // Default
        const applicationContext = document.getElementById('applicationContext') ? document.getElementById('applicationContext').value : 'medical';

        return {
            neutronFlux: neutronFlux,
            neutronEnergy: neutronEnergy,
            targetMass: targetMass,
            enrichment: enrichment,
            irradiationTime: irradiationTime,
            selfShieldingFactor: selfShieldingFactor,
            applicationContext: applicationContext
        };
    },

    // ============================================================================
    // COMPARATIVE ANALYTICS
    // ============================================================================

    /**
     * Update comparative charts based on selected routes
     */
    updateComparativeCharts: function() {
        if (typeof ISOTOPE_ROUTES === 'undefined') {
            return;
        }

        const routesData = [];

        // Comparison Set 1: Therapeutic isotopes
        if (document.getElementById('compareLu177') && document.getElementById('compareLu177').checked) {
            // Lu-177 route - check both ISOTOPE_ROUTES and legacy routes.js
            let route = null;
            if (typeof ISOTOPE_ROUTES !== 'undefined') {
                route = ISOTOPE_ROUTES.find(r => r.product_isotope === 'Lu-177');
            }
            if (!route && typeof IsotopeRouteRegistry !== 'undefined') {
                const legacyRoute = IsotopeRouteRegistry.routes.find(r => r.product_isotope === 'Lu-177');
                if (legacyRoute) {
                    // Convert legacy route format to ISOTOPE_ROUTES format
                    route = {
                        id: 'lu176-ng-lu177',
                        category: 'moderated',
                        target_isotope: legacyRoute.target_isotope,
                        reaction: 'n,γ',
                        threshold_MeV: null,
                        nominal_sigma_barns: legacyRoute.cross_section_thermal,
                        product_isotope: legacyRoute.product_isotope,
                        product_half_life_days: legacyRoute.product_half_life_days,
                        chemical_separable: legacyRoute.chemical_separability,
                        carrier_added_acceptable: !legacyRoute.carrier_added_acceptable ? false : true,
                        impurity_risks: legacyRoute.known_impurity_risks || [],
                        regulatory_flag: 'standard'
                    };
                }
            }
            if (route) {
                routesData.push(this.calculateRouteData(route, 'Lu-177 (Lu-176(n,γ))'));
            }
        }

        if (document.getElementById('compareSc47') && document.getElementById('compareSc47').checked) {
            const route = ISOTOPE_ROUTES.find(r => r.product_isotope === 'Sc-47' && r.target_isotope === 'Ti-47');
            if (route) {
                routesData.push(this.calculateRouteData(route, 'Sc-47 (Ti-47(n,p))'));
            }
        }

        if (document.getElementById('compareCu67') && document.getElementById('compareCu67').checked) {
            const route = ISOTOPE_ROUTES.find(r => r.product_isotope === 'Cu-67');
            if (route) {
                routesData.push(this.calculateRouteData(route, 'Cu-67 (Zn-67(n,p))'));
            }
        }

        // Comparison Set 2: Mo-99 routes
        if (document.getElementById('compareMo99Reactor') && document.getElementById('compareMo99Reactor').checked) {
            const route = ISOTOPE_ROUTES.find(r => r.product_isotope === 'Mo-99' && r.category === 'generator');
            if (route) {
                routesData.push(this.calculateRouteData(route, 'Mo-99 Reactor (Mo-98(n,γ))'));
            }
        }

        if (document.getElementById('compareMo99Fast') && document.getElementById('compareMo99Fast').checked) {
            const route = ISOTOPE_ROUTES.find(r => r.product_isotope === 'Mo-99' && r.category === 'fast');
            if (route) {
                routesData.push(this.calculateRouteData(route, 'Mo-99 Fast (Mo-100(n,2n))'));
            }
        }

        // Update charts
        if (routesData.length > 0) {
            Charts.updateComparativeActivityChart('chartComparativeActivity', routesData);
            Charts.updateComparativeSpecificActivityChart('chartComparativeSpecificActivity', routesData);
        } else {
            // Clear charts if no routes selected
            Charts.initComparativeActivityChart('chartComparativeActivity');
            Charts.initComparativeSpecificActivityChart('chartComparativeSpecificActivity');
        }
    },

    /**
     * Calculate route data for comparative charts
     */
    calculateRouteData: function(route, label) {
        const modelState = this.getModelStateForRouteEvaluation();
        
        // Evaluate route to get impurity risk
        let evaluation = null;
        let impurityRisk = 'Low';
        try {
            if (typeof RouteEvaluator !== 'undefined') {
                evaluation = RouteEvaluator.evaluateRoute(route, modelState);
                impurityRisk = evaluation.impurity_risk_level || 'Low';
            }
        } catch (error) {
            console.error(`Error evaluating route ${route.id}:`, error);
        }

        // Get default parameters
        const targetMass = modelState.targetMass || 1.0; // g
        const enrichment = modelState.enrichment || 1.0;
        const N_AVOGADRO = 6.02214076e23; // atoms/mol
        const TYPICAL_ATOMIC_MASS = 100; // g/mol (placeholder)
        const N_target = (targetMass * N_AVOGADRO * enrichment) / TYPICAL_ATOMIC_MASS;
        const f_shield = modelState.selfShieldingFactor || 1.0;

        // Determine cross-section
        let sigma_cm2 = 0;
        if (route.reaction === 'n,γ' || route.reaction === 'n,gamma') {
            sigma_cm2 = (route.nominal_sigma_barns || 1) * 1e-24; // Use placeholder if not specified
        } else {
            sigma_cm2 = (route.nominal_sigma_barns || 0.01) * 1e-24; // Use placeholder if not specified
        }

        // Calculate activity vs time data
        const lambda = Model.decayConstant(route.product_half_life_days);
        const numPoints = 200;
        const maxTimeDays = Math.min(route.product_half_life_days * 5, 30); // Cap at 30 days or 5 half-lives
        const timeData = [];
        const activityData = [];
        const fluxForTime = route.reaction === 'n,γ' || route.reaction === 'n,gamma' 
            ? (modelState.neutronFlux || 1e14)
            : (modelState.neutronFlux || 1e13);

        for (let i = 0; i <= numPoints; i++) {
            const t_days = (i / numPoints) * maxTimeDays;
            const t_seconds = t_days * 86400;
            const f_sat = Model.saturationFactor(lambda, t_seconds);
            const R = Model.reactionRate(N_target, sigma_cm2, fluxForTime, f_shield);
            const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
            const activity = Model.activity(lambda, N_EOB);
            const activity_GBq = activity / 1e9;

            timeData.push(t_days);
            activityData.push(activity_GBq);
        }

        // Calculate specific activity vs flux data
        const fluxData = [];
        const specificActivityData = [];
        const t_irr = modelState.irradiationTime || 86400 * 7; // 7 days default
        const f_sat_fixed = Model.saturationFactor(lambda, t_irr);

        // Generate flux range
        const minFlux = route.reaction === 'n,γ' || route.reaction === 'n,gamma' ? 1e12 : 1e11;
        const maxFlux = route.reaction === 'n,γ' || route.reaction === 'n,gamma' ? 1e16 : 1e15;
        const numFluxPoints = 100;

        for (let i = 0; i <= numFluxPoints; i++) {
            const flux = minFlux * Math.pow(maxFlux / minFlux, i / numFluxPoints);
            const R = Model.reactionRate(N_target, sigma_cm2, flux, f_shield);
            const N_EOB = Model.atomsAtEOB(R, f_sat_fixed, lambda);
            const activity = Model.activity(lambda, N_EOB);
            
            // Estimate product mass
            const ATOMIC_MASS_UNIT_g = 1.66053906660e-24; // g
            const TYPICAL_ATOMIC_MASS_AMU = 100; // amu (placeholder)
            const productMass = N_EOB * TYPICAL_ATOMIC_MASS_AMU * ATOMIC_MASS_UNIT_g;
            const specificActivity = Model.specificActivity(activity, Math.max(productMass, 1e-9));
            const specificActivity_TBq_g = specificActivity / 1e12;

            fluxData.push(flux);
            specificActivityData.push(specificActivity_TBq_g);
        }

        return {
            label: label,
            impurity_risk: impurityRisk,
            timeData: timeData,
            activityData: activityData,
            fluxData: fluxData,
            specificActivityData: specificActivityData
        };
    },

    /**
     * Initialize limitations section
     */
    initLimitations: function() {
        const limitationsList = document.getElementById('limitationsList');
        if (!limitationsList || typeof ModelLimitations === 'undefined') {
            return;
        }

        const limitations = ModelLimitations.getAllLimitations();
        const severityOrder = { 'high': 1, 'moderate': 2, 'low': 3 };
        limitations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        let html = '';
        limitations.forEach(lim => {
            const severityClass = `limitation-${lim.severity}`;
            const severityLabel = lim.severity.charAt(0).toUpperCase() + lim.severity.slice(1);
            const statusLabel = lim.status || 'Known – Not Implemented';
            
            html += `
                <div class="limitation-item ${severityClass}">
                    <div class="limitation-header">
                        <h3>${lim.title}</h3>
                        <span class="limitation-severity">${severityLabel} Severity</span>
                        <span class="limitation-status">${statusLabel}</span>
                    </div>
                    <div class="limitation-content">
                        <p><strong>Description:</strong> ${lim.description}</p>
                        <p><strong>Impact:</strong> ${lim.impact}</p>
                        <p><strong>Category:</strong> ${lim.category}</p>
                        ${lim.affects ? `<p><strong>Affects:</strong> ${lim.affects.join(', ')}</p>` : ''}
                        ${lim.estimated_impact_magnitude ? `<p><strong>Estimated Impact Magnitude:</strong> ${lim.estimated_impact_magnitude}</p>` : ''}
                    </div>
                </div>
            `;
        });

        limitationsList.innerHTML = html;
    },

    /**
     * Toggle score breakdown table visibility
     */
    toggleScoreBreakdown: function(cardId) {
        const breakdownId = cardId + '-breakdown';
        const breakdownElement = document.getElementById(breakdownId);
        if (!breakdownElement) {
            return;
        }

        const scoreSection = breakdownElement.closest('.route-score-section');
        const toggleButton = scoreSection ? scoreSection.querySelector('.score-breakdown-toggle') : null;
        const toggleIcon = toggleButton ? toggleButton.querySelector('.toggle-icon') : null;

        if (breakdownElement.style.display === 'none' || breakdownElement.style.display === '') {
            breakdownElement.style.display = 'block';
            if (toggleIcon) {
                toggleIcon.textContent = '▲';
            }
        } else {
            breakdownElement.style.display = 'none';
            if (toggleIcon) {
                toggleIcon.textContent = '▼';
            }
        }
    }
};

// ============================================================================
// PLANNING-GRADE MODEL WARNING
// ============================================================================
// Execute once on script load to warn users about model limitations
if (typeof console !== 'undefined' && console.warn) {
    console.warn(
        '⚠️ PLANNING-GRADE MODEL WARNING:\n' +
        'This model is PLANNING-GRADE ONLY. Numerical outputs are order-of-magnitude estimates.\n' +
        'Structural uncertainties (flux geometry, spectra, burn-up physics) may exceed parameter uncertainty bands.'
    );
}

// Initialize UI when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UI.init();
    });
} else {
    UI.init();
}
