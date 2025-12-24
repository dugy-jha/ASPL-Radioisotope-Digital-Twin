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
     * Calculate effective source rate
     * 
     * @param {number} S - Source rate (particles/s)
     * @param {number} eta - Geometric efficiency (dimensionless)
     * @param {number} f_ang - Angular distribution factor (dimensionless)
     * @param {number} M - Multiplication factor (dimensionless)
     * @returns {number} Effective source rate S_eff (particles/s)
     * 
     * Formula: S_eff = S * η * f_ang * 4π * M
     * Units: [particles/s] = [particles/s] * [1] * [1] * [1] * [1]
     */
    effectiveSourceRate: function(S, eta, f_ang, M) {
        if (S < 0 || eta < 0 || f_ang < 0 || M < 0) {
            throw new Error('All parameters must be non-negative');
        }
        return S * eta * f_ang * 4 * Math.PI * M;
    },

    /**
     * Calculate flux
     * 
     * @param {number} S_eff - Effective source rate (particles/s)
     * @param {number} A_target - Target area (cm^2)
     * @returns {number} Flux φ (cm^-2 s^-1)
     * 
     * Formula: φ = S_eff / A_target
     * Units: [cm^-2 s^-1] = [particles/s] / [cm^2]
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
    }
};

// Initialize model when script loads
Model.init();
