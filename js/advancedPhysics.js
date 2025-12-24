/**
 * advancedPhysics.js
 * 
 * Advanced Physics Features Module (v2.0.0)
 * 
 * This module implements advanced physics features while maintaining:
 * - Deterministic behavior
 * - Unit consistency
 * - Audit traceability
 * - Regulator-safe scope boundaries
 * 
 * Features:
 * - Time-dependent flux
 * - Spatial flux distribution
 * - Epithermal resonance integrals
 * - Chemistry yield model
 * - Monte Carlo uncertainty (parametric only)
 * 
 * NO SPECULATIVE PHYSICS
 * NO NEUTRON TRANSPORT SOLVERS
 * NO CFD SOLVERS
 */

const AdvancedPhysics = {
    // ============================================================================
    // TIME-DEPENDENT FLUX
    // ============================================================================

    /**
     * Calculate time-dependent flux profile
     * 
     * @param {string} profileType - Profile type: 'constant', 'duty_cycle', 'ramp', 'step'
     * @param {number} t - Time (s)
     * @param {Object} params - Profile parameters
     *   constant: {phi0: number}
     *   duty_cycle: {phi0: number, period: number, duty_fraction: number}
     *   ramp: {phi0: number, phi1: number, t_ramp: number}
     *   step: {phi0: number, phi1: number, t_step: number}
     * @returns {number} Flux at time t (cm^-2 s^-1)
     */
    timeDependentFlux: function(profileType, t, params) {
        if (t < 0) {
            throw new Error('Time must be non-negative');
        }

        switch (profileType) {
            case 'constant':
                return params.phi0 || 0;

            case 'duty_cycle':
                const period = params.period || 1;
                const duty_fraction = params.duty_fraction || 0.5;
                const phi0 = params.phi0 || 0;
                const phase = (t % period) / period;
                return (phase < duty_fraction) ? phi0 : 0;

            case 'ramp':
                const phi0_ramp = params.phi0 || 0;
                const phi1_ramp = params.phi1 || phi0_ramp;
                const t_ramp = params.t_ramp || 1;
                if (t <= t_ramp) {
                    return phi0_ramp + (phi1_ramp - phi0_ramp) * (t / t_ramp);
                }
                return phi1_ramp;

            case 'step':
                const phi0_step = params.phi0 || 0;
                const phi1_step = params.phi1 || phi0_step;
                const t_step = params.t_step || 0;
                return (t < t_step) ? phi0_step : phi1_step;

            default:
                throw new Error(`Unknown flux profile type: ${profileType}`);
        }
    },

    /**
     * Calculate atoms at EOB with time-dependent flux
     * Uses numerical integration: N(t) = ∫ R(τ) e^{-λ(t-τ)} dτ
     * 
     * @param {number} N_target - Number of target atoms
     * @param {number} sigma_cm2 - Cross-section (cm^2)
     * @param {string} fluxProfileType - Flux profile type
     * @param {Object} fluxParams - Flux profile parameters
     * @param {number} f_shield - Self-shielding factor
     * @param {number} lambda - Decay constant (s^-1)
     * @param {number} t_irr - Irradiation time (s)
     * @param {number} dt - Time step for integration (s, default: adaptive)
     * @returns {number} Atoms at EOB N_EOB
     */
    atomsAtEOBWithTimeDependentFlux: function(N_target, sigma_cm2, fluxProfileType, fluxParams, f_shield, lambda, t_irr, dt) {
        if (N_target < 0 || sigma_cm2 < 0 || f_shield < 0 || lambda < 0 || t_irr < 0) {
            throw new Error('All parameters must be non-negative');
        }

        // Adaptive time step: use smaller steps for rapidly varying flux
        const adaptive_dt = dt || Math.min(t_irr / 1000, 0.1);
        const steps = Math.ceil(t_irr / adaptive_dt);
        const final_dt = t_irr - (steps - 1) * adaptive_dt;

        let N_EOB = 0;

        // Numerical integration: N(t) = ∫₀^t R(τ) e^{-λ(t-τ)} dτ
        for (let i = 0; i < steps; i++) {
            const tau = i * adaptive_dt;
            const current_dt = (i === steps - 1) ? final_dt : adaptive_dt;

            // Flux at time τ
            const phi_tau = this.timeDependentFlux(fluxProfileType, tau, fluxParams);

            // Reaction rate at time τ
            const R_tau = Model.reactionRate(N_target, sigma_cm2, phi_tau, f_shield);

            // Decay factor: e^{-λ(t_irr - τ)}
            const decay_factor = Math.exp(-lambda * (t_irr - tau));

            // Contribution to N_EOB
            N_EOB += R_tau * decay_factor * current_dt;
        }

        return N_EOB;
    },

    // ============================================================================
    // SPATIAL FLUX DISTRIBUTION
    // ============================================================================

    /**
     * Calculate spatial flux profile
     * 
     * @param {string} profileType - Profile type: 'gaussian', 'inverse_square', 'uniform'
     * @param {number} r - Radial distance from center (cm)
     * @param {Object} params - Profile parameters
     *   gaussian: {phi_center: number, sigma: number}
     *   inverse_square: {phi_center: number, r0: number}
     *   uniform: {phi0: number}
     * @returns {number} Flux at radius r (cm^-2 s^-1)
     */
    spatialFluxProfile: function(profileType, r, params) {
        if (r < 0) {
            throw new Error('Radius must be non-negative');
        }

        switch (profileType) {
            case 'gaussian':
                const phi_center_g = params.phi_center || 0;
                const sigma_g = params.sigma || 1;
                return phi_center_g * Math.exp(-(r * r) / (2 * sigma_g * sigma_g));

            case 'inverse_square':
                const phi_center_is = params.phi_center || 0;
                const r0_is = params.r0 || 1;
                if (r < r0_is) {
                    return phi_center_is; // Constant within r0
                }
                return phi_center_is * (r0_is * r0_is) / (r * r);

            case 'uniform':
                return params.phi0 || 0;

            default:
                throw new Error(`Unknown spatial flux profile type: ${profileType}`);
        }
    },

    /**
     * Calculate production yield with spatial flux distribution
     * Integrates production over target area
     * 
     * @param {number} N_target_density - Target atom density (atoms/cm^3)
     * @param {number} sigma_cm2 - Cross-section (cm^2)
     * @param {string} fluxProfileType - Spatial flux profile type
     * @param {Object} fluxParams - Flux profile parameters
     * @param {number} f_shield - Self-shielding factor
     * @param {number} targetRadius - Target radius (cm)
     * @param {number} targetThickness - Target thickness (cm)
     * @param {number} lambda - Decay constant (s^-1)
     * @param {number} t_irr - Irradiation time (s)
     * @param {number} dr - Radial step for integration (cm, default: adaptive)
     * @returns {number} Total atoms at EOB N_EOB
     */
    atomsAtEOBWithSpatialFlux: function(N_target_density, sigma_cm2, fluxProfileType, fluxParams, f_shield, targetRadius, targetThickness, lambda, t_irr, dr) {
        if (N_target_density < 0 || sigma_cm2 < 0 || f_shield < 0 || targetRadius <= 0 || targetThickness <= 0 || lambda < 0 || t_irr < 0) {
            throw new Error('All parameters must be non-negative, radius and thickness must be positive');
        }

        // Adaptive radial step
        const adaptive_dr = dr || Math.min(targetRadius / 100, 0.1);
        const steps = Math.ceil(targetRadius / adaptive_dr);
        const final_dr = targetRadius - (steps - 1) * adaptive_dr;

        let N_EOB_total = 0;

        // Integrate over radial distance: ∫₀^R 2πr × N(r) × φ(r) dr
        for (let i = 0; i < steps; i++) {
            const r = i * adaptive_dr;
            const current_dr = (i === steps - 1) ? final_dr : adaptive_dr;

            // Flux at radius r
            const phi_r = this.spatialFluxProfile(fluxProfileType, r, fluxParams);

            // Number of target atoms in ring: 2πr × dr × thickness × density
            const dA = 2 * Math.PI * r * current_dr; // Area of ring
            const N_target_ring = N_target_density * dA * targetThickness;

            // Reaction rate in ring
            const R_ring = Model.reactionRate(N_target_ring, sigma_cm2, phi_r, f_shield);

            // Saturation factor
            const f_sat = Model.saturationFactor(lambda, t_irr);

            // Atoms at EOB in ring
            const N_EOB_ring = Model.atomsAtEOB(R_ring, f_sat, lambda);

            // Add to total
            N_EOB_total += N_EOB_ring;
        }

        return N_EOB_total;
    },

    // ============================================================================
    // EPITHERMAL RESONANCE INTEGRALS
    // ============================================================================

    /**
     * Calculate reaction rate with epithermal resonance integrals
     * 
     * @param {number} N_target - Number of target atoms
     * @param {number} sigma_thermal_cm2 - Thermal cross-section (cm^2)
     * @param {number} phi_thermal - Thermal flux (cm^-2 s^-1)
     * @param {number} resonance_integral - Resonance integral I_res (cm^2, typically in barns × eV)
     * @param {number} phi_epithermal - Epithermal flux (cm^-2 s^-1)
     * @param {number} f_shield - Self-shielding factor
     * @returns {number} Reaction rate R (reactions/s)
     * 
     * Formula: R = N × (σ_thermal × φ_thermal + I_res × φ_epithermal) × f_shield
     * Units: [reactions/s] = [1] × ([cm^2] × [cm^-2 s^-1] + [cm^2] × [cm^-2 s^-1]) × [1]
     * 
     * Note: Resonance integral I_res is typically given in barns × eV.
     *       For calculation, convert to cm^2: I_res_cm2 = I_res_barns_eV × 1e-24
     */
    reactionRateWithEpithermal: function(N_target, sigma_thermal_cm2, phi_thermal, resonance_integral, phi_epithermal, f_shield) {
        if (N_target < 0 || sigma_thermal_cm2 < 0 || phi_thermal < 0 || resonance_integral < 0 || phi_epithermal < 0 || f_shield < 0) {
            throw new Error('All parameters must be non-negative');
        }

        // Thermal contribution
        const R_thermal = N_target * sigma_thermal_cm2 * phi_thermal * f_shield;

        // Epithermal contribution
        // Note: resonance_integral should be in cm^2 (convert from barns × eV if needed)
        const R_epithermal = N_target * resonance_integral * phi_epithermal * f_shield;

        return R_thermal + R_epithermal;
    },

    /**
     * Convert resonance integral from barns × eV to cm^2
     * 
     * @param {number} I_res_barns_eV - Resonance integral (barns × eV)
     * @returns {number} Resonance integral (cm^2)
     * 
     * Note: This is a unit conversion. The actual value depends on the neutron spectrum.
     */
    convertResonanceIntegral: function(I_res_barns_eV) {
        // 1 barn = 1e-24 cm^2
        // For resonance integrals, the eV factor is typically absorbed in the flux normalization
        // This conversion assumes standard 1/E epithermal spectrum
        return I_res_barns_eV * 1e-24; // cm^2
    },

    // ============================================================================
    // CHEMISTRY YIELD MODEL
    // ============================================================================

    /**
     * Calculate delivered activity with chemistry yield
     * 
     * @param {number} activity_post_decay - Activity after decay during chemistry delay (Bq)
     * @param {number} chemistry_yield - Chemistry separation yield (fraction, 0-1)
     * @returns {number} Delivered activity (Bq)
     * 
     * Formula: A_delivered = A_post_decay × Y_chem
     * Units: [Bq] = [Bq] × [1]
     * 
     * Note: Chemistry yield typically ranges from 70-95% depending on separation method.
     */
    deliveredActivityWithChemistryYield: function(activity_post_decay, chemistry_yield) {
        if (activity_post_decay < 0 || chemistry_yield < 0 || chemistry_yield > 1) {
            throw new Error('Activity must be non-negative, chemistry yield must be between 0 and 1');
        }
        return activity_post_decay * chemistry_yield;
    },

    // ============================================================================
    // MONTE CARLO UNCERTAINTY (PARAMETRIC ONLY)
    // ============================================================================

    /**
     * Perform Monte Carlo uncertainty propagation (parametric only)
     * 
     * Constraints:
     * - No transport physics
     * - Deterministic kernel only
     * - Samples input parameters only
     * 
     * @param {Function} deterministicKernel - Deterministic calculation function
     * @param {Object} nominalParams - Nominal parameter values
     * @param {Object} uncertainties - Uncertainty distributions
     *   Each key: {type: 'normal'|'uniform', mean: number, std: number|range: [min, max]}
     * @param {number} n_samples - Number of Monte Carlo samples
     * @param {Function} randomGenerator - Random number generator (default: Math.random)
     * @returns {Object} {mean: number, std: number, samples: Array<number>, percentiles: Object}
     */
    monteCarloUncertainty: function(deterministicKernel, nominalParams, uncertainties, n_samples, randomGenerator) {
        if (n_samples <= 0) {
            throw new Error('Number of samples must be positive');
        }

        const rng = randomGenerator || Math.random;
        const samples = [];

        // Generate samples
        for (let i = 0; i < n_samples; i++) {
            // Sample parameters
            const sampledParams = {};
            for (const key in nominalParams) {
                if (uncertainties[key]) {
                    const unc = uncertainties[key];
                    if (unc.type === 'normal') {
                        // Box-Muller transform for normal distribution
                        const u1 = rng();
                        const u2 = rng();
                        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                        sampledParams[key] = unc.mean + z * unc.std;
                    } else if (unc.type === 'uniform') {
                        sampledParams[key] = unc.range[0] + rng() * (unc.range[1] - unc.range[0]);
                    } else {
                        sampledParams[key] = nominalParams[key];
                    }
                } else {
                    sampledParams[key] = nominalParams[key];
                }
            }

            // Run deterministic kernel
            const result = deterministicKernel(sampledParams);
            samples.push(result);
        }

        // Calculate statistics
        const mean = samples.reduce((a, b) => a + b, 0) / n_samples;
        const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n_samples;
        const std = Math.sqrt(variance);

        // Calculate percentiles
        const sorted = [...samples].sort((a, b) => a - b);
        const percentiles = {
            p5: sorted[Math.floor(n_samples * 0.05)],
            p25: sorted[Math.floor(n_samples * 0.25)],
            p50: sorted[Math.floor(n_samples * 0.50)],
            p75: sorted[Math.floor(n_samples * 0.75)],
            p95: sorted[Math.floor(n_samples * 0.95)]
        };

        return {
            mean: mean,
            std: std,
            samples: samples,
            percentiles: percentiles
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdvancedPhysics };
}

