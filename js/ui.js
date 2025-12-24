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
