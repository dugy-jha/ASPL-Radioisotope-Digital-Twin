/*
PHYSICS CORE — LOCKED
Do not modify without full revalidation.
Any UI, routing, or scoring logic must treat this as read-only.
*/

/**
 * model.js
 * 
 * Generic Radioisotope Production Digital Twin - Physics Model
 * 
 * STRICT SEPARATION: Pure physics and mathematics only.
 * - NO DOM access
 * - NO Plotly references
 * - NO UI code
 * - All functions must be pure (no side effects)
 * - All units must be explicit in comments
 * - All formulas must be readable and auditable
 * 
 * Authoritative formulas - DO NOT ALTER
 */

export const Model = {
    /**
     * Initialize model
     */
    init: function () {
        // Model initialization (no DOM access)
    },

    /**
     * Extract element symbol from isotope string
     * 
     * @param {string} isotopeString - Isotope string (e.g., 'Zn-67', 'Lu-176', 'Mo-100')
     * @returns {string} Element symbol (e.g., 'Zn', 'Lu', 'Mo')
     */
    extractElementSymbol: function (isotopeString) {
        if (!isotopeString || typeof isotopeString !== 'string') {
            return null;
        }
        // Match element symbol (1-2 letters) followed by optional dash and numbers
        const match = isotopeString.match(/^([A-Z][a-z]?)/);
        return match ? match[1] : null;
    },

    // ============================================================================
    // CORE DEFINITIONS
    // ============================================================================

    /**
     * Calculate decay constant from half-life
     * 
     * @param {number} T_half_days - Half-life (days)
     * @returns {number} Decay constant λ (s^-1)
     * 
     * Formula: λ = ln(2) / (T_half_days * 24 * 3600)
     * Units: [s^-1] = [1] / ([days] * [s/day])
     */
    decayConstant: function (T_half_days) {
        if (T_half_days <= 0) {
            throw new Error('Half-life must be positive');
        }
        return Math.LN2 / (T_half_days * 24 * 3600);
    },

    /**
     * Calculate saturation factor
     * 
     * @param {number} lambda - Decay constant λ (s^-1)
     * @param {number} t_irr_seconds - Irradiation time (s)
     * @returns {number} Saturation factor f_sat (dimensionless, 0-1)
     * 
     * Formula: f_sat = 1 - exp(-λ * t_irr_seconds)
     * Units: [1] = 1 - exp(-[s^-1] * [s])
     */
    saturationFactor: function (lambda, t_irr_seconds) {
        if (lambda < 0 || t_irr_seconds < 0) {
            throw new Error('Decay constant and time must be non-negative');
        }
        return 1 - Math.exp(-lambda * t_irr_seconds);
    },

    /**
     * Calculate saturation factor with product burn-up
     * 
     * @param {number} lambda_decay - Decay constant λ_decay (s^-1)
     * @param {number} k_burn_product - Product burn-up rate constant (s^-1)
     * @param {number} t_irr_seconds - Irradiation time (s)
     * @returns {number} Saturation factor f_sat (dimensionless, 0-1)
     * 
     * Formula: f_sat = 1 - exp(-λ_eff * t_irr_seconds)
     *          where λ_eff = λ_decay + k_burn_product
     * Units: [1] = 1 - exp(-[s^-1] * [s])
     */
    saturationFactorWithProductBurnUp: function (lambda_decay, k_burn_product, t_irr_seconds) {
        if (lambda_decay < 0 || k_burn_product < 0 || t_irr_seconds < 0) {
            throw new Error('Decay constant, burn-up rate, and time must be non-negative');
        }
        const lambda_eff = lambda_decay + k_burn_product;
        return 1 - Math.exp(-lambda_eff * t_irr_seconds);
    },

    /**
     * Calculate reaction rate
     * 
     * @param {number} N_parent - Number of parent atoms (dimensionless)
     * @param {number} sigma_cm2 - Cross-section σ (cm^2)
     * @param {number} phi - Flux φ (cm^-2 s^-1)
     * @param {number} f_shield - Shielding factor (dimensionless)
     * @returns {number} Reaction rate R (reactions/s)
     * 
     * Formula: R = N_parent * σ_cm2 * φ * f_shield
     * Units: [reactions/s] = [1] * [cm^2] * [cm^-2 s^-1] * [1]
     */
    reactionRate: function (N_parent, sigma_cm2, phi, f_shield) {
        if (N_parent < 0 || sigma_cm2 < 0 || phi < 0 || f_shield < 0) {
            throw new Error('All parameters must be non-negative');
        }
        return N_parent * sigma_cm2 * phi * f_shield;
    },

    /**
     * Calculate atoms at end of bombardment (EOB)
     * 
     * @param {number} R - Reaction rate (reactions/s)
     * @param {number} f_sat - Saturation factor (dimensionless)
     * @param {number} lambda - Decay constant λ (s^-1)
     * @returns {number} Atoms at EOB N_EOB (dimensionless)
     * 
     * Formula: N_EOB = R * f_sat / λ
     * Units: [1] = [reactions/s] * [1] / [s^-1]
     */
    atomsAtEOB: function (R, f_sat, lambda) {
        if (R < 0 || f_sat < 0 || f_sat > 1 || lambda <= 0) {
            throw new Error('Invalid parameters: R and f_sat must be non-negative, f_sat <= 1, lambda must be positive');
        }
        return R * f_sat / lambda;
    },

    /**
     * Calculate activity
     * 
     * @param {number} lambda - Decay constant λ (s^-1)
     * @param {number} N - Number of atoms (dimensionless)
     * @returns {number} Activity A (Bq)
     * 
     * Formula: A = λ * N
     * Units: [Bq] = [s^-1] * [1]
     */
    activity: function (lambda, N) {
        if (lambda < 0 || N < 0) {
            throw new Error('Decay constant and number of atoms must be non-negative');
        }
        return lambda * N;
    },

    // ============================================================================
    // GEOMETRY
    // ============================================================================

    /**
     * Calculate solid angle
     * 
     * @param {number} d - Distance from source (cm)
     * @param {number} r - Radius of target (cm)
     * @returns {number} Solid angle Ω (steradians)
     * 
     * Formula: Ω = 2π * (1 - d / sqrt(d^2 + r^2))
     * Units: [sr] = [1] * [1]
     */
    solidAngle: function (d, r) {
        if (d < 0 || r < 0) {
            throw new Error('Distance and radius must be non-negative');
        }
        if (d === 0 && r === 0) {
            return 0;
        }
        return 2 * Math.PI * (1 - d / Math.sqrt(d * d + r * r));
    },

    /**
     * Calculate geometric efficiency
     * 
     * @param {number} Omega - Solid angle Ω (steradians)
     * @returns {number} Geometric efficiency η (dimensionless, 0-1)
     * 
     * Formula: η = Ω / (4π)
     * Units: [1] = [sr] / [sr]
     */
    geometricEfficiency: function (Omega) {
        if (Omega < 0) {
            throw new Error('Solid angle must be non-negative');
        }
        return Omega / (4 * Math.PI);
    },

    /**
     * Calculate flux from point isotropic source using solid angle interception
     * 
     * Geometry model: Point isotropic source + solid-angle interception
     * Assumes point source emitting isotropically, target intercepts solid angle Ω
     * 
     * @param {number} S - Source rate (particles/s)
     * @param {number} Omega - Solid angle intercepted by target (steradians)
     * @param {number} A_target - Target area (cm^2)
     * @param {number} targetDistance_cm - (Optional) Distance from source to target (cm) - for geometry warning
     * @param {number} targetRadius_cm - (Optional) Target radius (cm) - for geometry warning
     * @returns {number} Flux φ (cm^-2 s^-1)
     * 
     * Formula: φ = (S × Ω) / A_target
     * Where Ω = 2π(1 − d / sqrt(d² + r²)) for circular target
     * 
     * Units: [cm^-2 s^-1] = ([particles/s] × [sr]) / [cm^2]
     * 
     * Note: This formulation assumes uniform flux distribution over target area.
     * For point sources at distance d >> r, inverse square law applies:
     * φ ≈ S / (4π × d²) for d >> r
     * 
     * Warning: If targetDistance_cm and targetRadius_cm are provided and d < 3×r,
     *          emits console.warn about potential flux overestimation.
     */
    fluxFromSolidAngle: function (S, Omega, A_target, targetDistance_cm, targetRadius_cm) {
        if (S < 0 || Omega < 0 || A_target <= 0) {
            throw new Error('Source rate and solid angle must be non-negative, target area must be positive');
        }

        // Warning: Flux modeling may be inaccurate for close-in targets
        if (targetDistance_cm !== undefined && targetRadius_cm !== undefined &&
            targetDistance_cm >= 0 && targetRadius_cm > 0 &&
            targetDistance_cm < 3 * targetRadius_cm) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`Flux modeling warning: target distance < 3× target radius. ` +
                    `Point-source / solid-angle approximation may overestimate flux by 10–50%.`);
            }
        }

        return (S * Omega) / A_target;
    },

    /**
     * Calculate flux from finite disk source (Approximation)
     * 
     * @param {number} S - Source rate (particles/s)
     * @param {number} targetDistance_cm - Distance (cm)
     * @param {number} targetRadius_cm - Target radius (cm)
     * @param {number} sourceRadius_cm - Source radius (cm)
     * @returns {number} Flux φ (cm^-2 s^-1)
     * 
     * Formula: Uses off-axis disk-to-disk view factor approximation or simplified effective distance
     * Current impl: Averages point-source flux over distributed source area (Geometric approximation)
     */
    fluxFiniteSource: function (S, targetDistance_cm, targetRadius_cm, sourceRadius_cm) {
        if (targetDistance_cm <= 0) return 0;

        // If source is small, use standard solid angle
        if (sourceRadius_cm <= 0.1 * targetDistance_cm) {
            const Omega = this.solidAngle(targetDistance_cm, targetRadius_cm);
            return (S * Omega) / (Math.PI * targetRadius_cm * targetRadius_cm);
        }

        // For larger sources, use effective distance approximation
        // d_eff = sqrt(d^2 + r_source^2/2) - heuristic for average distance
        const d_eff = Math.sqrt(targetDistance_cm * targetDistance_cm + 0.5 * sourceRadius_cm * sourceRadius_cm);
        const Omega_eff = this.solidAngle(d_eff, targetRadius_cm);
        return (S * Omega_eff) / (Math.PI * targetRadius_cm * targetRadius_cm);
    },

    // ============================================================================
    // SELF-SHIELDING
    // ============================================================================

    /**
     * Calculate macroscopic cross-section
     * 
     * @param {number} N_parent_density - Parent atom density (atoms/cm^3)
     * @param {number} sigma_cm2 - Microscopic cross-section σ (cm^2)
     * @returns {number} Macroscopic cross-section Σ (cm^-1)
     * 
     * Formula: Σ = N_parent_density * σ_cm2
     * Units: [cm^-1] = [atoms/cm^3] * [cm^2]
     */
    macroscopicCrossSection: function (N_parent_density, sigma_cm2) {
        if (N_parent_density < 0 || sigma_cm2 < 0) {
            throw new Error('Density and cross-section must be non-negative');
        }
        return N_parent_density * sigma_cm2;
    },

    /**
     * Calculate self-shielding factor
     * 
     * @param {number} Sigma - Macroscopic cross-section Σ (cm^-1)
     * @param {number} thickness - Target thickness (cm)
     * @returns {number} Shielding factor f_shield (dimensionless, 0-1)
     * 
     * Formula: f_shield = (1 - exp(-Σ * thickness)) / (Σ * thickness)
     * Units: [1] = [1] / ([cm^-1] * [cm])
     */
    selfShieldingFactor: function (Sigma, thickness) {
        if (Sigma < 0 || thickness < 0) {
            throw new Error('Cross-section and thickness must be non-negative');
        }
        if (Sigma === 0 || thickness === 0) {
            return 1.0;
        }
        const product = Sigma * thickness;
        return (1 - Math.exp(-product)) / product;
    },

    // ============================================================================
    // BURN-UP
    // ============================================================================

    /**
     * Calculate burn-up rate constant
     * 
     * @param {number} phi - Flux φ (cm^-2 s^-1)
     * @param {number} sigma_burn_cm2 - Burn-up cross-section σ_burn (cm^2)
     * @returns {number} Burn-up rate constant k_burn (s^-1)
     * 
     * Formula: k_burn = φ * σ_burn_cm2
     * Units: [s^-1] = [cm^-2 s^-1] * [cm^2]
     */
    burnUpRateConstant: function (phi, sigma_burn_cm2) {
        if (phi < 0 || sigma_burn_cm2 < 0) {
            throw new Error('Flux and cross-section must be non-negative');
        }
        return phi * sigma_burn_cm2;
    },

    /**
     * Calculate effective decay constant (including burn-up)
     * 
     * @param {number} lambda - Decay constant λ (s^-1)
     * @param {number} k_burn - Burn-up rate constant (s^-1)
     * @returns {number} Effective decay constant λ_eff (s^-1)
     * 
     * Formula: λ_eff = λ + k_burn
     * Units: [s^-1] = [s^-1] + [s^-1]
     */
    effectiveDecayConstant: function (lambda, k_burn) {
        if (lambda < 0 || k_burn < 0) {
            throw new Error('Decay constant and burn-up rate must be non-negative');
        }
        return lambda + k_burn;
    },

    /**
     * Calculate product burn-up rate constant
     * 
     * @param {number} phi - Flux φ (cm^-2 s^-1)
     * @param {number} sigma_burn_product_cm2 - Product burn-up cross-section σ_burn_product (cm^2)
     * @returns {number} Product burn-up rate constant k_burn_product (s^-1)
     * 
     * Formula: k_burn_product = φ * σ_burn_product_cm2
     * Units: [s^-1] = [cm^-2 s^-1] * [cm^2]
     */
    productBurnUpRateConstant: function (phi, sigma_burn_product_cm2) {
        if (phi < 0 || sigma_burn_product_cm2 < 0) {
            throw new Error('Flux and cross-section must be non-negative');
        }
        return phi * sigma_burn_product_cm2;
    },

    /**
     * Calculate effective decay constant (including product burn-up)
     * 
     * @param {number} lambda_decay - Decay constant λ_decay (s^-1)
     * @param {number} k_burn_product - Product burn-up rate constant (s^-1)
     * @returns {number} Effective decay constant λ_eff (s^-1)
     * 
     * Formula: λ_eff = λ_decay + k_burn_product
     * Units: [s^-1] = [s^-1] + [s^-1]
     */
    effectiveDecayConstantWithProductBurnUp: function (lambda_decay, k_burn_product) {
        if (lambda_decay < 0 || k_burn_product < 0) {
            throw new Error('Decay constant and burn-up rate must be non-negative');
        }
        return lambda_decay + k_burn_product;
    },

    /**
     * Calculate atoms at EOB with product burn-up
     * 
     * @param {number} R - Reaction rate (reactions/s)
     * @param {number} lambda_decay - Decay constant λ_decay (s^-1)
     * @param {number} k_burn_product - Product burn-up rate constant (s^-1)
     * @param {number} t_irr - Irradiation time (s)
     * @returns {number} Atoms at EOB N_EOB (dimensionless)
     * 
     * Formula: N_EOB = R * (1 - exp(-λ_eff * t_irr)) / λ_eff
     *          where λ_eff = λ_decay + k_burn_product
     * Units: [1] = [reactions/s] * [1] / [s^-1]
     */
    atomsAtEOBWithProductBurnUp: function (R, lambda_decay, k_burn_product, t_irr) {
        if (R < 0 || lambda_decay < 0 || k_burn_product < 0 || t_irr < 0) {
            throw new Error('All parameters must be non-negative');
        }
        const lambda_eff = this.effectiveDecayConstantWithProductBurnUp(lambda_decay, k_burn_product);
        if (lambda_eff <= 0) {
            throw new Error('Effective decay constant must be positive');
        }
        const f_sat = 1 - Math.exp(-lambda_eff * t_irr);
        return R * f_sat / lambda_eff;
    },

    // ============================================================================
    // BATEMAN EQUATIONS (MULTI-STEP DECAY CHAINS)
    // ============================================================================

    /**
     * Calculate multi-step decay chain using matrix exponential method
     * 
     * @param {Array<number>} N0 - Initial atom numbers for each isotope [N1(0), N2(0), ..., Nn(0)]
     * @param {Array<Array<number>>} decayMatrix - Decay matrix Λ (n×n)
     *   Λ[i][j] = branching ratio from isotope j to isotope i (if j decays to i)
     *   Λ[i][i] = -λ_i (decay constant of isotope i, negative)
     * @param {number} t - Time (s)
     * @returns {Array<number>} Atom numbers at time t [N1(t), N2(t), ..., Nn(t)]
     */
    batemanMultiStep: function (N0, decayMatrix, t) {
        if (!Array.isArray(N0) || !Array.isArray(decayMatrix)) {
            throw new Error('N0 and decayMatrix must be arrays');
        }
        if (N0.length !== decayMatrix.length) {
            throw new Error('N0 length must match decayMatrix dimension');
        }
        if (t < 0) {
            throw new Error('Time must be non-negative');
        }

        const n = N0.length;

        // For small chains (n ≤ 4), use recursive Bateman solution (more stable)
        if (n <= 4) {
            return this.batemanRecursive(N0, decayMatrix, t);
        }

        // For larger chains, use matrix exponential
        return this.batemanMatrixExponential(N0, decayMatrix, t);
    },

    /**
     * Recursive Bateman solution for small decay chains
     */
    batemanRecursive: function (N0, decayMatrix, t) {
        const n = N0.length;
        const N = new Array(n).fill(0);

        // Extract decay constants and branching ratios
        const lambdas = [];
        const branchingRatios = []; // branchingRatios[i][j] = BR from j to i

        for (let i = 0; i < n; i++) {
            lambdas[i] = -decayMatrix[i][i]; // Decay constant (positive)
            branchingRatios[i] = [];
            for (let j = 0; j < n; j++) {
                if (i !== j && decayMatrix[i][j] > 0) {
                    branchingRatios[i][j] = decayMatrix[i][j] / lambdas[j];
                } else {
                    branchingRatios[i][j] = 0;
                }
            }
        }

        // Calculate each isotope using recursive Bateman formula
        for (let i = 0; i < n; i++) {
            let Ni_t = 0;
            // Contribution from initial atoms of isotope i
            Ni_t += N0[i] * Math.exp(-lambdas[i] * t);

            for (let j = 0; j < n; j++) {
                if (j === i) continue;

                if (branchingRatios[i][j] > 0 && lambdas[j] > 0) {
                    const BR = branchingRatios[i][j];
                    const lambda_j = lambdas[j];
                    const lambda_i = lambdas[i];

                    if (Math.abs(lambda_i - lambda_j) < 1e-12) {
                        Ni_t += N0[j] * BR * lambda_j * t * Math.exp(-lambda_j * t);
                    } else {
                        const ratio = lambda_j / (lambda_i - lambda_j);
                        Ni_t += N0[j] * BR * ratio * (Math.exp(-lambda_j * t) - Math.exp(-lambda_i * t));
                    }
                }
            }
            N[i] = Math.max(0, Ni_t);
        }

        return N;
    },

    /**
     * Matrix exponential method for larger decay chains
     */
    batemanMatrixExponential: function (N0, decayMatrix, t) {
        const n = N0.length;
        let lambda_max = 0;
        for (let i = 0; i < n; i++) {
            const lambda_i = -decayMatrix[i][i];
            if (lambda_i > lambda_max) lambda_max = lambda_i;
        }

        let dt = Math.min(t / 1000, 0.1);
        const STABILITY_THRESHOLD = 0.2;
        if (lambda_max > 0 && lambda_max * dt > STABILITY_THRESHOLD) {
            dt = STABILITY_THRESHOLD / lambda_max;
        }

        const steps = Math.ceil(t / dt);
        const final_dt = t - (steps - 1) * dt;
        let N = [...N0];

        for (let step = 0; step < steps; step++) {
            const current_dt = (step === steps - 1) ? final_dt : dt;
            const dN = new Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    dN[i] += decayMatrix[i][j] * N[j];
                }
            }
            for (let i = 0; i < n; i++) {
                N[i] += dN[i] * current_dt;
                if (N[i] < 0) N[i] = 0;
            }
        }
        return N;
    },

    /**
     * Runge-Kutta (RK4) method for decay chains
     */
    batemanRungeKutta: function (N0, decayMatrix, t) {
        const n = N0.length;
        let N = [...N0];

        let lambda_max = 0;
        for (let i = 0; i < n; i++) {
            if (-decayMatrix[i][i] > lambda_max) lambda_max = -decayMatrix[i][i];
        }

        let dt = Math.min(t / 100, 0.5 / (lambda_max || 1e-10));
        if (dt > t) dt = t;

        const steps = Math.ceil(t / dt);
        const final_dt = t - (steps - 1) * dt;

        const deriv = (currentN) => {
            const dN = new Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    dN[i] += decayMatrix[i][j] * currentN[j];
                }
            }
            return dN;
        };

        for (let step = 0; step < steps; step++) {
            const h = (step === steps - 1) ? final_dt : dt;
            const k1 = deriv(N);
            const N2 = N.map((val, i) => val + 0.5 * h * k1[i]);
            const k2 = deriv(N2);
            const N3 = N.map((val, i) => val + 0.5 * h * k2[i]);
            const k3 = deriv(N3);
            const N4 = N.map((val, i) => val + h * k3[i]);
            const k4 = deriv(N4);
            for (let i = 0; i < n; i++) {
                N[i] += (h / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
                if (N[i] < 0) N[i] = 0;
            }
        }
        return N;
    },

    /**
     * Calculate delivered activity accounting for chemistry yield
     * 
     * @param {number} activity - Activity after decay and transport (Bq)
     * @param {number} yieldFraction - Chemistry yield (0.0 - 1.0)
     * @returns {number} Delivered activity (Bq)
     */
    deliveredActivityWithChemistryYield: function (activity, yieldFraction) {
        if (activity < 0 || yieldFraction < 0) {
            return 0;
        }
        return activity * yieldFraction;
    }
};
