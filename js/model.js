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

const Model = {
    /**
     * Initialize model
     */
    init: function() {
        // Model initialization (no DOM access)
    },

    /**
     * Extract element symbol from isotope string
     * 
     * @param {string} isotopeString - Isotope string (e.g., 'Zn-67', 'Lu-176', 'Mo-100')
     * @returns {string} Element symbol (e.g., 'Zn', 'Lu', 'Mo')
     */
    extractElementSymbol: function(isotopeString) {
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
    decayConstant: function(T_half_days) {
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
    saturationFactor: function(lambda, t_irr_seconds) {
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
    saturationFactorWithProductBurnUp: function(lambda_decay, k_burn_product, t_irr_seconds) {
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
    reactionRate: function(N_parent, sigma_cm2, phi, f_shield) {
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
    atomsAtEOB: function(R, f_sat, lambda) {
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
    activity: function(lambda, N) {
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
    solidAngle: function(d, r) {
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
    geometricEfficiency: function(Omega) {
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
    fluxFromSolidAngle: function(S, Omega, A_target, targetDistance_cm, targetRadius_cm) {
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
     * Calculate effective source rate (DEPRECATED - use fluxFromSolidAngle instead)
     * 
     * @deprecated This function multiplies by 4π which is inconsistent with solid angle approach.
     * Use fluxFromSolidAngle(S, Omega, A_target) instead for consistent geometry model.
     * 
     * @param {number} S - Source rate (particles/s)
     * @param {number} eta - Geometric efficiency (dimensionless)
     * @param {number} f_ang - Angular distribution factor (dimensionless)
     * @param {number} M - Multiplication factor (dimensionless)
     * @returns {number} Effective source rate S_eff (particles/s)
     */
    effectiveSourceRate: function(S, eta, f_ang, M) {
        if (S < 0 || eta < 0 || f_ang < 0 || M < 0) {
            throw new Error('All parameters must be non-negative');
        }
        // Note: eta = Omega/(4π), so S_eff = S * (Omega/(4π)) * 4π = S * Omega
        // This is maintained for backward compatibility but fluxFromSolidAngle is preferred
        return S * eta * f_ang * 4 * Math.PI * M;
    },

    /**
     * Calculate flux (DEPRECATED - use fluxFromSolidAngle instead)
     * 
     * @deprecated Use fluxFromSolidAngle(S, Omega, A_target) for consistent geometry model.
     * 
     * @param {number} S_eff - Effective source rate (particles/s)
     * @param {number} A_target - Target area (cm^2)
     * @returns {number} Flux φ (cm^-2 s^-1)
     */
    flux: function(S_eff, A_target) {
        if (S_eff < 0 || A_target <= 0) {
            throw new Error('Source rate must be non-negative, target area must be positive');
        }
        return S_eff / A_target;
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
    macroscopicCrossSection: function(N_parent_density, sigma_cm2) {
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
    selfShieldingFactor: function(Sigma, thickness) {
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
    burnUpRateConstant: function(phi, sigma_burn_cm2) {
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
    effectiveDecayConstant: function(lambda, k_burn) {
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
     * 
     * Note: This accounts for activation of the product isotope during irradiation.
     *       For high-flux, long-irradiation cases, product burn-up can reduce yield by 10-50%.
     */
    productBurnUpRateConstant: function(phi, sigma_burn_product_cm2) {
        if (phi < 0 || sigma_burn_product_cm2 < 0) {
            throw new Error('Flux and cross-section must be non-negative');
        }
        return phi * sigma_burn_product_cm2;
    },

    /**
     * Calculate product burn-up rate constant with self-shielding
     * 
     * Planning-grade symmetric treatment of product burn-up using same geometry assumptions as production reaction.
     * 
     * @param {number} flux_cm2_s - Flux φ (cm^-2 s^-1)
     * @param {number} sigma_product_burn_cm2 - Product burn-up cross-section σ_burn_product (cm^2)
     * @param {number} product_atom_density_cm3 - Product atom density (atoms/cm^3)
     * @param {number} target_thickness_cm - Target thickness (cm)
     * @returns {number} Product burn-up rate constant k_burn_product (s^-1)
     * 
     * Formula: k_burn_product = φ * σ_burn_product * f_shield_product
     *          where f_shield_product = (1 - exp(-Σ_product * d)) / (Σ_product * d)
     *          and Σ_product = product_atom_density * σ_burn_product
     * Units: [s^-1] = [cm^-2 s^-1] * [cm^2] * [1]
     * 
     * Returns 0 if sigma_product_burn_cm2 is undefined, null, or <= 0.
     */
    productBurnUpRate: function(flux_cm2_s, sigma_product_burn_cm2, product_atom_density_cm3, target_thickness_cm) {
        // Return 0 if cross-section is not provided or invalid
        if (sigma_product_burn_cm2 === undefined || sigma_product_burn_cm2 === null || sigma_product_burn_cm2 <= 0) {
            return 0;
        }
        
        if (flux_cm2_s < 0 || product_atom_density_cm3 < 0 || target_thickness_cm < 0) {
            throw new Error('Flux, product atom density, and target thickness must be non-negative');
        }
        
        // Compute macroscopic cross-section
        const Sigma_product = this.macroscopicCrossSection(product_atom_density_cm3, sigma_product_burn_cm2);
        
        // Compute self-shielding factor
        const f_shield_product = this.selfShieldingFactor(Sigma_product, target_thickness_cm);
        
        // Return product burn-up rate constant with self-shielding
        return flux_cm2_s * sigma_product_burn_cm2 * f_shield_product;
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
     * 
     * Note: Product burn-up reduces effective half-life, increasing saturation rate
     *       but also increasing depletion rate.
     */
    effectiveDecayConstantWithProductBurnUp: function(lambda_decay, k_burn_product) {
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
    atomsAtEOBWithProductBurnUp: function(R, lambda_decay, k_burn_product, t_irr) {
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
    // BATEMAN EQUATIONS (1-STEP PARENT→DAUGHTER)
    // ============================================================================

    /**
     * Calculate daughter atoms using Bateman equation (1-step)
     * 
     * @param {number} N_parent - Initial parent atoms (dimensionless)
     * @param {number} BR - Branching ratio (dimensionless, 0-1)
     * @param {number} lambda_parent - Parent decay constant λ_p (s^-1)
     * @param {number} lambda_daughter - Daughter decay constant λ_d (s^-1)
     * @param {number} t - Time (s)
     * @returns {number} Daughter atoms N_daughter(t) (dimensionless)
     * 
     * Formula: N_daughter(t) = N_parent * BR * (λ_parent / (λ_d - λ_p)) * (exp(-λ_p * t) - exp(-λ_d * t))
     * Units: [1] = [1] * [1] * [s^-1] / [s^-1] * [1]
     */
    batemanOneStep: function(N_parent, BR, lambda_parent, lambda_daughter, t) {
        if (N_parent < 0 || BR < 0 || BR > 1 || lambda_parent < 0 || lambda_daughter < 0 || t < 0) {
            throw new Error('Invalid parameters');
        }
        if (Math.abs(lambda_daughter - lambda_parent) < 1e-12) {
            // Special case: λ_d ≈ λ_p (secular equilibrium)
            return N_parent * BR * lambda_parent * t * Math.exp(-lambda_parent * t);
        }
        const ratio = lambda_parent / (lambda_daughter - lambda_parent);
        const exp_parent = Math.exp(-lambda_parent * t);
        const exp_daughter = Math.exp(-lambda_daughter * t);
        return N_parent * BR * ratio * (exp_parent - exp_daughter);
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
     * 
     * Formula: N(t) = exp(Λt) × N(0)
     * Units: [1] = [1] × [1]
     * 
     * Note: For numerical stability, uses recursive Bateman solution for small chains (n ≤ 4),
     *       matrix exponential for larger chains (n > 4).
     */
    batemanMultiStep: function(N0, decayMatrix, t) {
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
     * Supports general N-parent branching decay chains: A → C, B → C, etc.
     * 
     * @param {Array<number>} N0 - Initial atom numbers
     * @param {Array<Array<number>>} decayMatrix - Decay matrix
     * @param {number} t - Time (s)
     * @returns {Array<number>} Atom numbers at time t
     */
    batemanRecursive: function(N0, decayMatrix, t) {
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
                    // Extract branching ratio: decayMatrix[i][j] = BR * lambda_j
                    branchingRatios[i][j] = decayMatrix[i][j] / lambdas[j];
                } else {
                    branchingRatios[i][j] = 0;
                }
            }
        }

        // Runtime guard: Check for invalid branching ratios (sum > 1.0)
        // For each parent isotope j, sum of branching ratios to all daughters should be ≤ 1.0
        for (let j = 0; j < n; j++) {
            let sumBR = 0;
            for (let i = 0; i < n; i++) {
                if (i !== j) {
                    sumBR += branchingRatios[i][j];
                }
            }
            if (sumBR > 1.0001) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn(`WARNING: Isotope ${j} has total branching ratio sum = ${sumBR.toFixed(6)} > 1.0. ` +
                                `This violates conservation (sum of BRs should be ≤ 1.0).`);
                }
            }
        }

        // Calculate each isotope using recursive Bateman formula
        for (let i = 0; i < n; i++) {
            let Ni_t = 0;

            // Contribution from initial atoms of isotope i
            Ni_t += N0[i] * Math.exp(-lambdas[i] * t);

            // Contribution from parent isotopes
            // FIXED: Previously, this loop only considered j < i, which broke branching chains.
            // For branching chains (e.g., A → C and B → C), we must consider ALL parents j,
            // regardless of index ordering. The condition j < i was incorrect for general networks.
            // 
            // Correct approach: For each isotope i, sum contributions from ALL parent isotopes j
            // where branchingRatios[i][j] > 0, regardless of whether j < i or j > i.
            // This allows correct handling of:
            // - Linear chains: A → B → C (j < i works, but full iteration is correct)
            // - Branching chains: A → C, B → C (requires j can be > i)
            // - Complex networks: Any parent-daughter relationship
            //
            // Formula for each parent j → i:
            //   N_i(t) += N_j(0) * BR_ji * (lambda_j / (lambda_i - lambda_j)) * 
            //             (exp(-lambda_j * t) - exp(-lambda_i * t))
            //   Special case: if lambda_i ≈ lambda_j (secular equilibrium)
            for (let j = 0; j < n; j++) {
                // Skip self (j === i) - isotope cannot be its own parent
                if (j === i) continue;
                
                // Only consider parents that actually decay to isotope i
                if (branchingRatios[i][j] > 0 && lambdas[j] > 0) {
                    const BR = branchingRatios[i][j];
                    const lambda_j = lambdas[j];
                    const lambda_i = lambdas[i];

                    if (Math.abs(lambda_i - lambda_j) < 1e-12) {
                        // Secular equilibrium case: N_i(t) = N_j(0) * BR * lambda_j * t * exp(-lambda_j * t)
                        Ni_t += N0[j] * BR * lambda_j * t * Math.exp(-lambda_j * t);
                    } else {
                        // General case: N_i(t) = N_j(0) * BR * (lambda_j / (lambda_i - lambda_j)) * 
                        //   (exp(-lambda_j * t) - exp(-lambda_i * t))
                        const ratio = lambda_j / (lambda_i - lambda_j);
                        Ni_t += N0[j] * BR * ratio * (Math.exp(-lambda_j * t) - Math.exp(-lambda_i * t));
                    }
                }
            }

            N[i] = Math.max(0, Ni_t); // Prevent negative atoms
        }

        return N;
    },

    /**
     * Matrix exponential method for larger decay chains
     * Uses explicit Euler method for matrix exponential
     * 
     * @param {Array<number>} N0 - Initial atom numbers
     * @param {Array<Array<number>>} decayMatrix - Decay matrix
     * @param {number} t - Time (s)
     * @returns {Array<number>} Atom numbers at time t
     * 
     * Note: Matrix exponential solved via explicit Euler method.
     *       Stable for planning-grade decay chains.
     *       Not suitable for stiff systems without timestep refinement.
     *       Numerical stability guard ensures λ_max × dt ≤ 0.2.
     */
    batemanMatrixExponential: function(N0, decayMatrix, t) {
        const n = N0.length;
        
        // Find maximum decay constant for stability check
        let lambda_max = 0;
        for (let i = 0; i < n; i++) {
            const lambda_i = -decayMatrix[i][i]; // Decay constant (positive)
            if (lambda_i > lambda_max) {
                lambda_max = lambda_i;
            }
        }
        
        // Initial adaptive time step
        let dt = Math.min(t / 1000, 0.1);
        
        // Numerical stability guard: ensure λ_max × dt ≤ 0.2
        // For stiff systems (large decay constant differences), reduce timestep
        const STABILITY_THRESHOLD = 0.2;
        if (lambda_max > 0 && lambda_max * dt > STABILITY_THRESHOLD) {
            const original_dt = dt;
            dt = STABILITY_THRESHOLD / lambda_max;
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`Matrix exponential stability guard: Reduced timestep from ${original_dt.toExponential(2)} s to ${dt.toExponential(2)} s ` +
                            `(λ_max = ${lambda_max.toExponential(2)} s⁻¹, λ_max × dt = ${(lambda_max * dt).toFixed(3)})`);
            }
        }
        
        const steps = Math.ceil(t / dt);
        const final_dt = t - (steps - 1) * dt;

        let N = [...N0];

        // Euler method: N(t+dt) = N(t) + Λ × N(t) × dt
        for (let step = 0; step < steps; step++) {
            const current_dt = (step === steps - 1) ? final_dt : dt;
            const dN = new Array(n).fill(0);

            // Calculate dN/dt = Λ × N
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    dN[i] += decayMatrix[i][j] * N[j];
                }
            }

            // Update N
            for (let i = 0; i < n; i++) {
                N[i] += dN[i] * current_dt;
                if (N[i] < 0) N[i] = 0; // Prevent negative atoms
            }
        }

        return N;
    },

    /**
     * Build decay matrix from chain definition
     * 
     * @param {Array<Object>} chain - Chain definition
     *   Each element: {isotope: string, lambda: number, parents: [{isotope: string, BR: number}]}
     * @returns {Object} {decayMatrix: Array<Array<number>>, isotopeOrder: Array<string>}
     */
    buildDecayMatrix: function(chain) {
        const n = chain.length;
        const decayMatrix = [];
        const isotopeOrder = chain.map(c => c.isotope);

        // Initialize matrix
        for (let i = 0; i < n; i++) {
            decayMatrix[i] = new Array(n).fill(0);
        }

        // Fill matrix
        for (let i = 0; i < n; i++) {
            const isotope = chain[i];
            
            // Diagonal: negative decay constant
            decayMatrix[i][i] = -isotope.lambda;

            // Off-diagonal: branching ratios from parents
            if (isotope.parents) {
                isotope.parents.forEach(parent => {
                    const parentIndex = isotopeOrder.indexOf(parent.isotope);
                    if (parentIndex >= 0 && parentIndex < i) {
                        // Parent decays to this isotope with branching ratio BR
                        decayMatrix[i][parentIndex] = parent.BR * chain[parentIndex].lambda;
                    }
                });
            }
        }

        return { decayMatrix, isotopeOrder };
    },

    // ============================================================================
    // CHARGED PARTICLES
    // ============================================================================

    /**
     * Calculate particle rate from beam current
     * 
     * @param {number} I - Beam current (A)
     * @param {number} q - Particle charge (elementary charge units, e.g., 1 for protons, 2 for alpha)
     * @returns {number} Particle rate N_dot (particles/s)
     * 
     * Formula: N_dot = I / q
     * Units: [particles/s] = [A] / [e]
     * Note: q in elementary charge units, I in amperes
     * Conversion: 1 A = 6.241509074e18 elementary charges/s
     */
    particleRate: function(I, q) {
        if (I < 0 || q <= 0) {
            throw new Error('Current must be non-negative, charge must be positive');
        }
        const elementaryCharge = 1.602176634e-19; // C
        return I / (q * elementaryCharge);
    },

    /**
     * Calculate beam power
     * 
     * @param {number} N_dot - Particle rate (particles/s)
     * @param {number} E_MeV - Particle energy (MeV)
     * @returns {number} Beam power P (W)
     * 
     * Formula: P = N_dot * E_MeV * 1.602e-13
     * Units: [W] = [particles/s] * [MeV] * [J/MeV]
     * Note: 1 MeV = 1.602176634e-13 J
     */
    beamPower: function(N_dot, E_MeV) {
        if (N_dot < 0 || E_MeV < 0) {
            throw new Error('Particle rate and energy must be non-negative');
        }
        return N_dot * E_MeV * 1.602e-13;
    },

    // ============================================================================
    // THERMAL DERATING
    // ============================================================================

    /**
     * Calculate temperature rise
     * 
     * @param {number} P - Power (W)
     * @param {number} m_dot - Mass flow rate ṁ (kg/s)
     * @param {number} Cp - Specific heat capacity (J/(kg·K))
     * @returns {number} Temperature rise ΔT (K)
     * 
     * Formula: ΔT = P / (ṁ * Cp)
     * Units: [K] = [W] / ([kg/s] * [J/(kg·K)])
     */
    temperatureRise: function(P, m_dot, Cp) {
        if (P < 0 || m_dot <= 0 || Cp <= 0) {
            throw new Error('Power must be non-negative, mass flow rate and heat capacity must be positive');
        }
        return P / (m_dot * Cp);
    },

    /**
     * Calculate thermal derating factor
     * 
     * @param {number} deltaT - Temperature rise ΔT (K)
     * @param {number} deltaT_max - Maximum allowed temperature rise (K)
     * @returns {number} Thermal derating factor f_T (dimensionless, 0-1)
     * 
     * Formula: f_T = 1 if ΔT <= ΔT_max else ΔT_max / ΔT
     * Units: [1] = [1]
     */
    thermalDerating: function(deltaT, deltaT_max) {
        if (deltaT < 0 || deltaT_max <= 0) {
            throw new Error('Temperature rise must be non-negative, maximum temperature rise must be positive');
        }
        if (deltaT <= deltaT_max) {
            return 1.0;
        }
        return deltaT_max / deltaT;
    },

    // ============================================================================
    // DAMAGE DERATING
    // ============================================================================

    /**
     * Calculate damage time limit
     * 
     * @param {number} dpa_limit - DPA limit (dimensionless)
     * @param {number} dpa_rate - DPA rate (s^-1)
     * @returns {number} Damage time limit t_damage (s)
     * 
     * Formula: t_damage = dpa_limit / dpa_rate
     * Units: [s] = [1] / [s^-1]
     */
    damageTimeLimit: function(dpa_limit, dpa_rate) {
        if (dpa_limit < 0 || dpa_rate <= 0) {
            throw new Error('DPA limit must be non-negative, DPA rate must be positive');
        }
        return dpa_limit / dpa_rate;
    },

    /**
     * Calculate damage derating factor
     * 
     * @param {number} t_irr_seconds - Irradiation time (s)
     * @param {number} t_damage - Damage time limit (s)
     * @returns {number} Damage derating factor f_D (dimensionless, 0-1)
     * 
     * Formula: f_D = 1 if t_irr_seconds <= t_damage else t_damage / t_irr_seconds
     * Units: [1] = [1]
     */
    damageDerating: function(t_irr_seconds, t_damage) {
        if (t_irr_seconds < 0 || t_damage <= 0) {
            throw new Error('Irradiation time must be non-negative, damage time limit must be positive');
        }
        if (t_irr_seconds <= t_damage) {
            return 1.0;
        }
        return t_damage / t_irr_seconds;
    },

    // ============================================================================
    // UNCERTAINTY PROPAGATION (RSS)
    // ============================================================================

    /**
     * Calculate total uncertainty using root-sum-square (RSS)
     * 
     * @param {Array<number>} uncertainties - Array of individual uncertainties [σ_flux, σ_sigma, σ_geom, σ_chem, ...]
     * @returns {number} Total uncertainty σ_total (same units as input)
     * 
     * Formula: σ_total = sqrt(σ_flux^2 + σ_sigma^2 + σ_geom^2 + σ_chem^2 + ...)
     * Units: Output has same units as input uncertainties
     */
    uncertaintyRSS: function(uncertainties) {
        if (!Array.isArray(uncertainties) || uncertainties.length === 0) {
            throw new Error('Uncertainties must be a non-empty array');
        }
        let sumSquares = 0;
        for (let i = 0; i < uncertainties.length; i++) {
            if (uncertainties[i] < 0) {
                throw new Error('All uncertainties must be non-negative');
            }
            sumSquares += uncertainties[i] * uncertainties[i];
        }
        return Math.sqrt(sumSquares);
    },

    // ============================================================================
    // ISOTOPE ROUTE EVALUATION
    // ============================================================================

    /**
     * Evaluate threshold activation for threshold reactions
     * 
     * @param {number} neutronEnergy - Neutron energy (MeV)
     * @param {number} thresholdEnergy - Reaction threshold energy (MeV)
     * @param {number} crossSectionAtEnergy - Cross-section at neutron energy (mb)
     * @param {Object} options - Optional parameters
     * @param {boolean} options.useEnergyScaling - If true, use energy-dependent scaling (default: false, conservative step-function)
     * @param {string} options.reactionType - Reaction type ('n,p', 'n,2n', 'n,d') for scaling exponent
     * @returns {number} Effective cross-section (mb), 0 if below threshold
     * 
     * Formula (step-function, default): σ_eff = σ(E) if E > E_threshold else 0
     * Formula (energy-scaled, optional): σ_eff = σ₁₄.₁ × ((E − E_thr)/(14.1 − E_thr))^n for E > E_thr
     * 
     * Units: [mb] = [mb]
     * 
     * Note: Energy scaling is planning-grade and optional. Default conservative step-function
     * is maintained for backward compatibility.
     */
    thresholdActivation: function(neutronEnergy, thresholdEnergy, crossSectionAtEnergy, options) {
        options = options || {};
        const useEnergyScaling = options.useEnergyScaling || false;
        const reactionType = options.reactionType || 'n,p';
        
        if (neutronEnergy < thresholdEnergy) {
            return 0;
        }
        
        // Default: conservative step-function (backward compatible)
        if (!useEnergyScaling) {
            return crossSectionAtEnergy;
        }
        
        // Optional: energy-dependent scaling (planning-grade)
        // Scaling exponent: n = 1.5 for (n,p), n = 2.0 for (n,2n)
        const scalingExponent = reactionType === 'n,2n' ? 2.0 : 1.5;
        const referenceEnergy = 14.1; // MeV (cross-section reference energy)
        
        if (neutronEnergy >= referenceEnergy) {
            // Above reference energy: use cross-section as-is (may decrease for n,2n but not modeled)
            return crossSectionAtEnergy;
        }
        
        // Between threshold and reference: scale with energy
        const energyRatio = (neutronEnergy - thresholdEnergy) / (referenceEnergy - thresholdEnergy);
        if (energyRatio <= 0) {
            return 0;
        }
        
        const scaledCrossSection = crossSectionAtEnergy * Math.pow(energyRatio, scalingExponent);
        return scaledCrossSection;
    },

    /**
     * Calculate specific activity
     * 
     * @param {number} activity - Activity A (Bq)
     * @param {number} mass - Mass of product (g)
     * @returns {number} Specific activity (Bq/g)
     * 
     * Formula: SA = A / m
     * Units: [Bq/g] = [Bq] / [g]
     */
    specificActivity: function(activity, mass) {
        if (mass <= 0) {
            throw new Error('Mass must be positive');
        }
        return activity / mass;
    },

    /**
     * Evaluate an isotope production route
     * 
     * @param {Object} route - Route object from IsotopeRouteRegistry
     * @param {Object} conditions - Production conditions
     * @param {number} conditions.neutronFlux - Neutron flux (cm^-2 s^-1) for thermal reactions
     * @param {number} conditions.neutronEnergy - Neutron energy (MeV) for threshold reactions
     * @param {number} conditions.targetDensity - Target atom density (atoms/cm³)
     * @param {number} conditions.targetMass - Target mass (g)
     * @param {number} conditions.enrichment - Target enrichment (fraction)
     * @param {number} conditions.irradiationTime - Irradiation time (s)
     * @param {number} conditions.selfShieldingFactor - Self-shielding factor (default 1.0)
     * @returns {Object} Evaluation results
     */
    evaluateRoute: function(route, conditions) {
        if (!route || !conditions) {
            throw new Error('Route and conditions must be provided');
        }

        const f_shield = conditions.selfShieldingFactor || 1.0;
        const enrichment = conditions.enrichment || 1.0;
        const targetDensity = conditions.targetDensity || 5e22; // atoms/cm³
        const targetMass = conditions.targetMass || 1.0; // g
        const t_irr = conditions.irradiationTime || 86400; // s

        // Determine cross-section based on reaction type
        let sigma = 0;
        let reactionRate = 0;
        let effectiveFlux = 0;

        const reaction = route.reaction || route.reaction_type;

        if (reaction === 'n,gamma' || reaction === 'n,γ') {
            // Thermal neutron reaction
            const cs = route.cross_section_thermal || (route.nominal_sigma_barns && (reaction === 'n,γ' || reaction === 'n,gamma') ? route.nominal_sigma_barns : null);
            if (!cs) {
                throw new Error('Thermal cross-section not defined for n,gamma reaction');
            }
            sigma = cs * 1e-24; // Convert barns to cm²
            effectiveFlux = conditions.neutronFlux || 1e14; // cm^-2 s^-1
            
            // Calculate number of target atoms
            // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
            const N_AVOGADRO = 6.02214076e23; // atoms/mol
            const targetElement = this.extractElementSymbol(route.target_isotope);
            const atomicMass = typeof AtomicMasses !== 'undefined' ? 
                AtomicMasses.getAtomicMass(targetElement) : 100.0; // Fallback if module not loaded
            const N_target = (targetMass * N_AVOGADRO * enrichment) / atomicMass;
            
            reactionRate = this.reactionRate(N_target, sigma, effectiveFlux, f_shield);
        } else if (reaction === 'n,p' || reaction === 'n,2n' || reaction === 'n,d') {
            // Threshold reaction
            if (!conditions.neutronEnergy) {
                throw new Error('Neutron energy required for threshold reactions');
            }
            const cs_14 = route.cross_section_14_1_MeV || (route.nominal_sigma_barns && (reaction === 'n,p' || reaction === 'n,2n' || reaction === 'n,d') ? route.nominal_sigma_barns : null);
            if (!cs_14) {
                throw new Error('Cross-section at 14.1 MeV not defined for threshold reaction');
            }
            
            // Convert mb to cm² (1 mb = 1e-27 cm²)
            // Note: nominal_sigma_barns is in barns (1e-24), cross_section_14_1_MeV is in mb (1e-27)
            const sigma_14_1_MeV = route.cross_section_14_1_MeV ? route.cross_section_14_1_MeV * 1e-27 : route.nominal_sigma_barns * 1e-24;
            
            // Apply threshold activation
            const threshold = route.threshold_energy !== undefined ? route.threshold_energy : (route.threshold_MeV !== undefined ? route.threshold_MeV : 0);
            sigma = this.thresholdActivation(
                conditions.neutronEnergy,
                threshold,
                sigma_14_1_MeV / 1e-27 // thresholdActivation expects mb
            ) * 1e-27;
            
            // For threshold reactions, assume fast neutron flux
            effectiveFlux = conditions.neutronFlux || 1e13; // cm^-2 s^-1 (typically lower than thermal)
            
            // Calculate number of target atoms
            // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
            const N_AVOGADRO = 6.02214076e23; // atoms/mol
            const targetElement = this.extractElementSymbol(route.target_isotope);
            const atomicMass = typeof AtomicMasses !== 'undefined' ? 
                AtomicMasses.getAtomicMass(targetElement) : 100.0; // Fallback if module not loaded
            const N_target = (targetMass * N_AVOGADRO * enrichment) / atomicMass;
            
            reactionRate = this.reactionRate(N_target, sigma, effectiveFlux, f_shield);
        } else if (reaction === 'alpha') {
            // Alpha particle reaction (charged particle beam)
            // Placeholder: use simplified reaction rate calculation
            // Actual calculation would require beam current, target thickness, etc.
            // For now, use placeholder reaction rate
            const PLACEHOLDER_ALPHA_CROSS_SECTION = 1e-26; // cm² (placeholder)
            const PLACEHOLDER_ALPHA_FLUX = 1e10; // particles/cm²/s (placeholder)
            
            sigma = PLACEHOLDER_ALPHA_CROSS_SECTION;
            effectiveFlux = PLACEHOLDER_ALPHA_FLUX;
            
            // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
            const N_AVOGADRO = 6.02214076e23; // atoms/mol
            const targetElement = this.extractElementSymbol(route.target_isotope);
            const atomicMass = typeof AtomicMasses !== 'undefined' ? 
                AtomicMasses.getAtomicMass(targetElement) : 100.0; // Fallback if module not loaded
            const N_target = (targetMass * N_AVOGADRO * enrichment) / atomicMass;
            
            reactionRate = this.reactionRate(N_target, sigma, effectiveFlux, f_shield);
        } else {
            throw new Error(`Unknown reaction type: ${route.reaction_type}`);
        }

        // Calculate product atoms and activity
        const lambda = this.decayConstant(route.product_half_life_days);
        const f_sat = this.saturationFactor(lambda, t_irr);
        const N_product = this.atomsAtEOB(reactionRate, f_sat, lambda);
        const activity = this.activity(lambda, N_product);

        // Calculate product mass for specific activity calculation
        // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
        const ATOMIC_MASS_UNIT_g = 1.66053906660e-24; // g
        const productElement = this.extractElementSymbol(route.product_isotope);
        const productAtomicMass = typeof AtomicMasses !== 'undefined' ? 
            AtomicMasses.getAtomicMass(productElement) : 100.0; // Fallback if module not loaded
        const productMass = N_product * productAtomicMass * ATOMIC_MASS_UNIT_g;
        const specificActivity = this.specificActivity(activity, Math.max(productMass, 1e-9));

        // Qualitative impurity assessment
        const impurityRiskLevel = this.assessImpurityRisk(route, reactionRate, t_irr);

        // Impurity trap assessment
        const impurityTraps = this.assessImpurityTraps(route);

        // Route classification
        const feasibility = this.classifyRouteFeasibility(
            route,
            reactionRate,
            activity,
            specificActivity,
            impurityRiskLevel
        );

        return {
            route: route,
            reaction_rate: reactionRate, // reactions/s
            product_atoms: N_product,
            activity: activity, // Bq
            specific_activity: specificActivity, // Bq/g
            impurity_risk_level: impurityRiskLevel,
            impurity_traps: impurityTraps,
            feasibility: feasibility.classification,
            feasibility_reasons: feasibility.reasons,
            cross_section_used: sigma, // cm²
            effective_flux: effectiveFlux, // cm^-2 s^-1
            saturation_factor: f_sat
        };
    },

    /**
     * Assess impurity risk qualitatively
     * 
     * @param {Object} route - Route object
     * @param {number} reactionRate - Production reaction rate (reactions/s)
     * @param {number} irradiationTime - Irradiation time (s)
     * @returns {string} Risk level: 'low', 'moderate', 'high'
     */
    assessImpurityRisk: function(route, reactionRate, irradiationTime) {
        // Simple heuristic based on route characteristics
        let riskScore = 0;

        // More impurities listed = higher risk
        if (route.known_impurity_risks) {
            riskScore += route.known_impurity_risks.length;
        }

        // Longer irradiation = more time for impurity buildup
        const irradiationDays = irradiationTime / 86400;
        if (irradiationDays > 7) {
            riskScore += 1;
        }
        if (irradiationDays > 30) {
            riskScore += 1;
        }

        // High reaction rate = more product = more potential impurities
        if (reactionRate > 1e12) {
            riskScore += 1;
        }

        // Threshold reactions may have additional activation products
        if (route.reaction_type === 'n,p' || route.reaction_type === 'n,2n') {
            riskScore += 1;
        }

        // Classify risk
        if (riskScore <= 2) {
            return 'low';
        } else if (riskScore <= 4) {
            return 'moderate';
        } else {
            return 'high';
        }
    },

    /**
     * Assess impurity trap risks
     * Checks for long-lived impurities and chemical inseparability
     * 
     * @param {Object} route - Route object
     * @returns {Array<Object>} Array of impurity trap warnings {type: string, severity: string, message: string}
     */
    assessImpurityTraps: function(route) {
        const traps = [];
        const productHalfLife = route.product_half_life_days;

        if (!route.known_impurity_risks || route.known_impurity_risks.length === 0) {
            return traps;
        }

        // Known long-lived impurity patterns (inferred from common nuclear data)
        // These are heuristics based on typical impurity behavior
        const longLivedPatterns = [
            /Mo-100/,  // Very long-lived
            /Sr-90/,   // Very long-lived
            /Co-60/,   // Long-lived
            /Lu-178/,  // Long-lived relative to Lu-177
            /W-188/,   // Long-lived
            /Ni-59/,   // Very long-lived
            /Cu-65/,   // Stable
            /Zn-67/,   // Long-lived
            /Ho-166/,  // Long-lived
            /Tm-170/,  // Long-lived
            /Bi-210/,  // Long-lived
            /Tl-204/   // Long-lived
        ];

        // Check each known impurity
        route.known_impurity_risks.forEach(impurity => {
            // Check for long-lived impurities (half-life >> product half-life)
            const isLongLived = longLivedPatterns.some(pattern => pattern.test(impurity));
            
            if (isLongLived && productHalfLife < 10) {
                // Product half-life < 10 days and impurity is long-lived
                traps.push({
                    type: 'long_lived_impurity',
                    severity: 'high',
                    message: `Long-lived impurity identified: ${impurity}. Impurity half-life significantly exceeds product half-life (${productHalfLife.toFixed(2)} days). May accumulate over multiple production cycles.`
                });
            } else if (isLongLived && productHalfLife < 30) {
                // Product half-life < 30 days and impurity is long-lived
                traps.push({
                    type: 'long_lived_impurity',
                    severity: 'moderate',
                    message: `Long-lived impurity identified: ${impurity}. Impurity half-life exceeds product half-life (${productHalfLife.toFixed(2)} days). Consider decay time before reuse.`
                });
            }

            // Check for chemically similar impurities (inferred from element)
            // Same element = potential chemical inseparability risk
            const productElement = route.product_isotope.split('-')[0];
            const impurityElement = impurity.match(/([A-Z][a-z]?)-?\d+/);
            if (impurityElement && impurityElement[1] === productElement) {
                traps.push({
                    type: 'chemical_inseparability',
                    severity: 'high',
                    message: `Chemically similar impurity: ${impurity}. Same element as product (${productElement}) may complicate chemical separation.`
                });
            }
        });

        // Check if route requires n.c.a. but has many impurities
        if (!route.carrier_added_acceptable && route.known_impurity_risks.length >= 3) {
            traps.push({
                type: 'nca_impurity_burden',
                severity: 'moderate',
                message: `No-carrier-added route with multiple impurity risks (${route.known_impurity_risks.length} identified). High-purity chemistry required.`
            });
        }

        return traps;
    },

    /**
     * Classify route feasibility
     * 
     * @param {Object} route - Route object
     * @param {number} reactionRate - Production reaction rate (reactions/s)
     * @param {number} activity - Product activity (Bq)
     * @param {number} specificActivity - Specific activity (Bq/g)
     * @param {string} impurityRiskLevel - Impurity risk level
     * @returns {Object} {classification: string, reasons: string[]}
     */
    classifyRouteFeasibility: function(route, reactionRate, activity, specificActivity, impurityRiskLevel) {
        const reasons = [];
        let classification = 'Feasible';

        // Check reaction rate (too low = not feasible)
        if (reactionRate < 1e6) {
            classification = 'Not recommended';
            reasons.push('Reaction rate too low for practical production');
        }

        // Check activity (too low = not feasible)
        const activity_GBq = activity / 1e9;
        if (activity_GBq < 0.1) {
            classification = 'Not recommended';
            reasons.push('Product activity too low (< 0.1 GBq)');
        }

        // Check specific activity requirements
        if (!route.carrier_added_acceptable) {
            // n.c.a. routes need high specific activity
            if (specificActivity < 1e12) { // Bq/g
                classification = 'Feasible with constraints';
                reasons.push('Specific activity may be insufficient for n.c.a. requirements');
            }
        }

        // Check impurity risk
        if (impurityRiskLevel === 'high') {
            if (classification === 'Feasible') {
                classification = 'Feasible with constraints';
            }
            reasons.push('High impurity risk requires careful chemistry');
        }

        // Check chemical separability
        if (!route.chemical_separability) {
            classification = 'Not recommended';
            reasons.push('Chemical separation not feasible');
        }

        // Check threshold reactions (may require special facilities)
        if (route.reaction_type === 'n,p' || route.reaction_type === 'n,2n') {
            if (classification === 'Feasible') {
                classification = 'Feasible with constraints';
            }
            reasons.push('Requires fast neutron source or accelerator');
        }

        // Check alpha particle reactions (require charged particle accelerator)
        if (route.reaction_type === 'alpha') {
            if (classification === 'Feasible') {
                classification = 'Feasible with constraints';
            }
            reasons.push('Requires charged particle accelerator');
        }

        // If no reasons, add positive note
        if (reasons.length === 0 && classification === 'Feasible') {
            reasons.push('Route meets all feasibility criteria');
        }

        return {
            classification: classification,
            reasons: reasons
        };
    }
};

// Initialize model when script loads
Model.init();

// ============================================================================
// MODEL SELF-TEST
// ============================================================================
export function modelSelfTest() {
  const lambda = Math.log(2) / (1 * 24 * 3600);
  const R = 1e9;
  const t = 1 * 24 * 3600;
  const f = 1 - Math.exp(-lambda * t);
  return R * f / lambda;
}
