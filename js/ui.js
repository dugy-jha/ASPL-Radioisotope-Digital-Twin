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
        this.setupEventListeners();
        this.initializeCharts();
        this.updateEquations();
        this.updateAllCharts();
    },

    /**
     * Initialize charts
     */
    initializeCharts: function() {
        Charts.init();
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

        // Validation test case button
        const loadLu177Test = document.getElementById('loadLu177Test');
        if (loadLu177Test) {
            loadLu177Test.addEventListener('click', () => {
                this.loadLu177TestCase();
            });
        }

        // Get all input elements
        const inputs = document.querySelectorAll('#controls input, #controls select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateAllCharts());
            input.addEventListener('change', () => this.updateAllCharts());
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
     */
    updateDecayChainChart: function() {
        const parentHalfLife = this.getParam('halfLife', 1.0);
        const daughterHalfLife = this.getParam('daughterHalfLife', 0.5);
        const BR = this.getParam('branchingRatio', 1.0);
        const irradiationTimeDays = this.getParam('irradiationTime', 7);

        const lambda_parent = Model.decayConstant(parentHalfLife);
        const lambda_daughter = Model.decayConstant(daughterHalfLife);

        // Assume initial parent atoms (simplified)
        const N_parent_initial = 1e20;

        const numPoints = 200;
        const maxTime = irradiationTimeDays * 2 * 86400; // Show 2x irradiation time
        const timeStep = maxTime / numPoints;
        const timeData = [];
        const parentData = [];
        const daughterData = [];

        for (let i = 0; i <= numPoints; i++) {
            const t = i * timeStep;
            const t_days = t / 86400;
            const N_daughter = Model.batemanOneStep(N_parent_initial, BR, lambda_parent, lambda_daughter, t);
            const A_parent = Model.activity(lambda_parent, N_parent_initial * Math.exp(-lambda_parent * t));
            const A_daughter = Model.activity(lambda_daughter, N_daughter);
            timeData.push(t_days);
            parentData.push(A_parent);
            daughterData.push(A_daughter);
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

        const resultsDisplay = document.getElementById('resultsDisplay');
        if (resultsDisplay) {
            resultsDisplay.innerHTML = `
                <div class="result-summary">
                    <h3>Key Results</h3>
                    <p><strong>Reaction Rate:</strong> ${R.toExponential(2)} reactions/s</p>
                    <p><strong>Decay Constant:</strong> ${lambda.toExponential(2)} s⁻¹</p>
                    <p><strong>Saturation Factor:</strong> ${(f_sat * 100).toFixed(2)}%</p>
                    <p><strong>Atoms at EOB:</strong> ${N_EOB.toExponential(2)}</p>
                    <p><strong>Activity at EOB:</strong> ${formatNumber(A_EOB)}</p>
                    <p><strong>Geometric Efficiency:</strong> ${(eta * 100).toFixed(2)}%</p>
                    <p><strong>Self-Shielding Factor:</strong> ${(f_shield * 100).toFixed(2)}%</p>
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
        // For point source at distance d: flux = source_strength / (4π * d²)
        // Account for moderator efficiency
        const flux_at_target = (source_strength * moderator_efficiency) / (4 * Math.PI * target_distance_cm * target_distance_cm);

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
    }
};

// Initialize UI when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UI.init();
    });
} else {
    UI.init();
}
