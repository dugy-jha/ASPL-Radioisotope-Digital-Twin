/**
 * routeEvaluator.js
 * 
 * Route Evaluation Module
 * 
 * Evaluates isotope production routes using existing physics functions.
 * This module provides feasibility assessment and classification logic.
 * 
 * Rules:
 * - Reuses existing Model functions (no new physics equations)
 * - Threshold not met → Not recommended
 * - Chemically inseparable AND carrier-added not acceptable → Not recommended
 * - Long-lived impurity present → Feasible with constraints
 * - Regulatory flag = exploratory → Feasible with constraints
 */

// Default chemistry separation yield (conservative estimate)
const DEFAULT_CHEMISTRY_YIELD = 0.85;

// ============================================================================
// ISOTOPE PATHWAYS LOOKUP
// ============================================================================

/**
 * Lookup isotope pathway from ISOTOPE_PATHWAYS registry
 * 
 * @param {Object} route - Route object from ISOTOPE_ROUTES
 * @returns {Object|null} Pathway object from ISOTOPE_PATHWAYS, or null if not found
 */
function lookupPathway(route) {
    if (!route || !route.product_isotope) {
        return null;
    }
    
    // Try to access ISOTOPE_PATHWAYS (may be in different module or loaded globally)
    let pathways = null;
    
    // Try global variable (if loaded via script tag)
    if (typeof ISOTOPE_PATHWAYS !== 'undefined' && Array.isArray(ISOTOPE_PATHWAYS)) {
        pathways = ISOTOPE_PATHWAYS;
    }
    // Try window.ISOTOPE_PATHWAYS (browser global)
    else if (typeof window !== 'undefined' && window.ISOTOPE_PATHWAYS && Array.isArray(window.ISOTOPE_PATHWAYS)) {
        pathways = window.ISOTOPE_PATHWAYS;
    }
    
    if (!pathways || !Array.isArray(pathways)) {
        return null;
    }
    
    // Lookup by product isotope (primary match)
    const productMatch = pathways.find(p => 
        p.primary_product === route.product_isotope
    );
    
    if (productMatch) {
        return productMatch;
    }
    
    // Lookup by route ID (secondary match) - normalize route ID format
    const routeIdNormalized = route.id ? route.id.toUpperCase().replace(/-/g, '_') : null;
    if (routeIdNormalized) {
        const idMatch = pathways.find(p => p.id === routeIdNormalized);
        if (idMatch) {
            return idMatch;
        }
    }
    
    // Lookup by target and product combination (tertiary match)
    if (route.target_isotope && route.product_isotope) {
        const targetProductMatch = pathways.find(p => 
            p.production && 
            p.production.target === route.target_isotope &&
            p.primary_product === route.product_isotope
        );
        if (targetProductMatch) {
            return targetProductMatch;
        }
    }
    
    return null;
}

const RouteEvaluator = {
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

    /**
     * Get natural isotopic abundance for an isotope
     * 
     * @param {string} elementSymbol - Element symbol (e.g., 'Zn', 'Lu')
     * @param {number} massNumber - Mass number (e.g., 64, 67)
     * @returns {number|null} Natural isotopic abundance (fraction 0-1), or null if unknown
     */
    getIsotopicAbundance: function(elementSymbol, massNumber) {
        // Natural isotopic abundances (fractions) - planning-grade values
        // Source: NIST Standard Reference Database 144 (2023)
        const isotopicAbundances = {
            'Zn': {
                64: 0.492,   // Zn-64: 49.2%
                66: 0.278,   // Zn-66: 27.8%
                67: 0.041,   // Zn-67: 4.1%
                68: 0.188    // Zn-68: 18.8%
            },
            'Ti': {
                46: 0.0825,  // Ti-46: 8.25%
                47: 0.0744,  // Ti-47: 7.44%
                48: 0.7372,  // Ti-48: 73.72%
                49: 0.0541,  // Ti-49: 5.41%
                50: 0.0518   // Ti-50: 5.18%
            },
            'Mo': {
                92: 0.1484,  // Mo-92: 14.84%
                94: 0.0925,  // Mo-94: 9.25%
                95: 0.1592,  // Mo-95: 15.92%
                96: 0.1668,  // Mo-96: 16.68%
                97: 0.0955,  // Mo-97: 9.55%
                98: 0.2413,  // Mo-98: 24.13%
                100: 0.0963  // Mo-100: 9.63%
            },
            'Lu': {
                175: 0.9741, // Lu-175: 97.41%
                176: 0.0259  // Lu-176: 2.59%
            },
            'Ho': {
                165: 1.0     // Ho-165: 100% (only stable isotope)
            },
            'Sm': {
                144: 0.0307, // Sm-144: 3.07%
                147: 0.1499, // Sm-147: 14.99%
                148: 0.1124, // Sm-148: 11.24%
                149: 0.1382, // Sm-149: 13.82%
                150: 0.0738, // Sm-150: 7.38%
                152: 0.2675, // Sm-152: 26.75%
                154: 0.2275  // Sm-154: 22.75%
            },
            'Dy': {
                156: 0.0006, // Dy-156: 0.06%
                158: 0.0010, // Dy-158: 0.10%
                160: 0.0234, // Dy-160: 2.34%
                161: 0.1889, // Dy-161: 18.89%
                162: 0.2548, // Dy-162: 25.48%
                163: 0.2486, // Dy-163: 24.86%
                164: 0.2826  // Dy-164: 28.26%
            },
            'Re': {
                185: 0.3740, // Re-185: 37.40%
                187: 0.6260  // Re-187: 62.60%
            },
            'Au': {
                197: 1.0     // Au-197: 100% (only stable isotope)
            },
            'W': {
                180: 0.0012, // W-180: 0.12%
                182: 0.2650, // W-182: 26.50%
                183: 0.1431, // W-183: 14.31%
                184: 0.3064, // W-184: 30.64%
                186: 0.2843  // W-186: 28.43%
            },
            'Sn': {
                112: 0.0097, // Sn-112: 0.97%
                114: 0.0066, // Sn-114: 0.66%
                115: 0.0034, // Sn-115: 0.34%
                116: 0.1454, // Sn-116: 14.54%
                117: 0.0768, // Sn-117: 7.68%
                118: 0.2422, // Sn-118: 24.22%
                119: 0.0859, // Sn-119: 8.59%
                120: 0.3259, // Sn-120: 32.59%
                122: 0.0463, // Sn-122: 4.63%
                124: 0.0579  // Sn-124: 5.79%
            },
            'Ir': {
                191: 0.373,  // Ir-191: 37.3%
                193: 0.627   // Ir-193: 62.7%
            },
            'Co': {
                59: 1.0      // Co-59: 100% (only stable isotope)
            },
            'Cu': {
                63: 0.6915,  // Cu-63: 69.15%
                65: 0.3085   // Cu-65: 30.85%
            },
            'Sc': {
                45: 1.0      // Sc-45: 100% (only stable isotope)
            }
        };

        if (!isotopicAbundances[elementSymbol]) {
            return null;
        }

        const abundances = isotopicAbundances[elementSymbol];
        return abundances[massNumber] !== undefined ? abundances[massNumber] : null;
    },

    /**
     * Evaluate an isotope production route
     * 
     * @param {Object} route - Route object from ISOTOPE_ROUTES
     * @param {Object} modelState - Current model state parameters
     * @param {number} modelState.neutronFlux - Neutron flux (cm^-2 s^-1)
     * @param {number} modelState.neutronEnergy - Neutron energy (MeV) for fast reactions
     * @param {number} modelState.targetMass - Target mass (g)
     * @param {number} modelState.enrichment - Target enrichment (fraction)
     * @param {number} modelState.irradiationTime - Irradiation time (s)
     * @param {number} modelState.selfShieldingFactor - Self-shielding factor (default 1.0)
     * @param {number} modelState.targetDensity - Target atom density (atoms/cm³, optional)
     * @returns {Object} Evaluation result
     */
    evaluateRoute: function(route, modelState) {
        if (!route || !modelState) {
            throw new Error('Route and modelState must be provided');
        }

        const reasons = [];
        const warnings = [];
        let feasible = true;
        let classification = 'Feasible';
        let impurityRiskLevel = 'Low'; // Default, will be updated by impurity trap assessment

        // ============================================================================
        // LOOKUP ISOTOPE PATHWAY
        // ============================================================================
        
        const pathway = lookupPathway(route);
        let pathwayDataAvailable = false;
        
        if (pathway) {
            pathwayDataAvailable = true;
            
            // Emit pathway warnings
            if (pathway.warnings && Array.isArray(pathway.warnings)) {
                pathway.warnings.forEach(warningCode => {
                    if (typeof console !== 'undefined' && console.warn) {
                        console.warn(`Pathway warning [${warningCode}] for route ${route.id}`);
                    }
                });
            }
        } else {
            // Pathway not found - warn and proceed conservatively
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`Isotope pathway not found for route ${route.id} (product: ${route.product_isotope}). ` +
                           `Proceeding conservatively with route metadata only.`);
            }
            warnings.push('Isotope pathway not found in canonical registry - using route metadata only');
        }

        // ============================================================================
        // THRESHOLD CHECK
        // ============================================================================
        
        // Use pathway threshold if available, otherwise route threshold
        const threshold_MeV = pathway && pathway.production && pathway.production.threshold_MeV !== undefined
            ? pathway.production.threshold_MeV
            : (route.threshold_MeV !== null ? route.threshold_MeV : null);
        
        if (threshold_MeV !== null && threshold_MeV > 0) {
            const neutronEnergy = modelState.neutronEnergy || 14.1; // Default to 14.1 MeV for fast neutrons
            if (neutronEnergy < threshold_MeV) {
                return {
                    route_id: route.id,
                    feasible: false,
                    classification: 'Not recommended',
                    reasons: [`Neutron energy (${neutronEnergy.toFixed(2)} MeV) below reaction threshold (${threshold_MeV} MeV)`],
                    warnings: warnings
                };
            }
        }

        // ============================================================================
        // CHEMICAL SEPARABILITY CHECK
        // ============================================================================
        
        // Use pathway chemistry mode if available, otherwise route flags
        const chemical_separable = pathway && pathway.chemistry
            ? (pathway.chemistry.mode !== undefined && pathway.chemistry.mode !== 'generator') // Generator mode implies separable
            : route.chemical_separable;
        const carrier_added_acceptable = pathway && pathway.chemistry && pathway.chemistry.carrier_added_ok !== undefined
            ? pathway.chemistry.carrier_added_ok
            : route.carrier_added_acceptable;
        
        if (!chemical_separable && !carrier_added_acceptable) {
            return {
                route_id: route.id,
                feasible: false,
                classification: 'Not recommended',
                reasons: ['Product is chemically inseparable and carrier-added production is not acceptable'],
                warnings: warnings
            };
        }

        // ============================================================================
        // CROSS-SECTION AND FLUX DETERMINATION
        // ============================================================================
        
        let sigma_cm2 = 0;
        let effectiveFlux = 0;
        
        // Get reaction type from pathway if available, otherwise route
        let reactionType = null;
        if (pathway && pathway.production && pathway.production.reaction) {
            // Normalize pathway reaction format "(n,γ)" to route format "n,γ"
            reactionType = pathway.production.reaction.replace(/[()]/g, '').replace('gamma', 'γ');
        } else {
            reactionType = route.reaction || 'n,γ';
        }

        // Determine cross-section based on reaction type
        if (reactionType === 'n,γ' || reactionType === 'n,gamma') {
            // Thermal/epithermal neutron reaction
            // Use pathway cross-section if available, otherwise route
            if (pathway && pathway.production && pathway.production.sigma_cm2 !== undefined) {
                sigma_cm2 = pathway.production.sigma_cm2; // Already in cm²
            } else if (route.nominal_sigma_barns !== null) {
                sigma_cm2 = route.nominal_sigma_barns * 1e-24; // Convert barns to cm²
            } else {
                warnings.push('Cross-section not specified - using conservative placeholder');
                sigma_cm2 = 1e-24; // 1 barn = 1e-24 cm² (conservative placeholder)
            }
            // Use thermal flux
            effectiveFlux = modelState.neutronFlux || 1e14; // cm^-2 s^-1
        } else {
            // Fast neutron reaction (n,p, n,2n, n,d)
            // Use pathway cross-section if available, otherwise route
            if (pathway && pathway.production && pathway.production.sigma_cm2_14MeV !== undefined) {
                sigma_cm2 = pathway.production.sigma_cm2_14MeV; // Already in cm²
            } else if (route.nominal_sigma_barns !== null) {
                sigma_cm2 = route.nominal_sigma_barns * 1e-24; // Convert barns to cm²
            } else {
                warnings.push('Cross-section not specified - using conservative placeholder');
                sigma_cm2 = 10e-27; // 10 mb = 10e-27 cm² (conservative placeholder)
            }
            
            // Apply threshold activation if threshold exists
            const neutronEnergy = modelState.neutronEnergy || 14.1; // MeV
            if (threshold_MeV !== null && threshold_MeV > 0) {
                // thresholdActivation expects cross-section in mb
                // Convert cm² to mb: 1 mb = 1e-27 cm², so mb = cm² / 1e-27
                const sigma_mb = sigma_cm2 / 1e-27;
                const effectiveSigma_mb = Model.thresholdActivation(neutronEnergy, threshold_MeV, sigma_mb);
                sigma_cm2 = effectiveSigma_mb * 1e-27; // Convert back to cm²
                
                if (sigma_cm2 === 0) {
                    return {
                        route_id: route.id,
                        feasible: false,
                        classification: 'Not recommended',
                        reasons: [`Effective cross-section is zero (threshold not met at ${neutronEnergy.toFixed(2)} MeV)`],
                        warnings: warnings
                    };
                }
            }
            
            // Use fast neutron flux (typically lower than thermal)
            effectiveFlux = modelState.neutronFlux || 1e13; // cm^-2 s^-1 (typically lower for fast)
        }

        // ============================================================================
        // RESONANCE-DOMINATED ISOTOPE WARNING
        // ============================================================================
        
        // Use pathway resonance_dominated flag if available, otherwise route
        const resonance_dominated = pathway && pathway.production && pathway.production.resonance_dominated !== undefined
            ? pathway.production.resonance_dominated
            : (route.resonance_dominated === true);
        
        // Warn if resonance-dominated isotope is used with non-thermal spectrum
        if (resonance_dominated === true) {
            const fluxProfileType = modelState.fluxProfileType || 'constant'; // Default to constant if not specified
            if (fluxProfileType !== 'pure_thermal') {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn(`Resonance-dominated isotope detected. ` +
                               `Effective resonance integral approximation may misestimate yield by 2–5× for non-1/E spectra. ` +
                               `Route: ${route.id}, Flux profile: ${fluxProfileType}`);
                }
            }
        }

        // ============================================================================
        // REACTION RATE CALCULATION
        // ============================================================================
        
        // Use pathway self_shielding flag if available, otherwise modelState
        // If pathway specifies self_shielding: true, use calculated value; if false or undefined, use modelState
        let f_shield = modelState.selfShieldingFactor || 1.0;
        if (pathway && pathway.production && pathway.production.self_shielding === false) {
            // Pathway explicitly disables self-shielding
            f_shield = 1.0;
        } else if (pathway && pathway.production && pathway.production.self_shielding === true && f_shield === 1.0) {
            // Pathway requires self-shielding but modelState doesn't provide it
            // Will be calculated later if needed (conservative: use 1.0 for now)
        }
        const enrichment = modelState.enrichment || 1.0;
        const targetMass = modelState.targetMass || 1.0; // g
        
        // Calculate number of target atoms
        // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
        const N_AVOGADRO = 6.02214076e23; // atoms/mol
        const targetElement = this.extractElementSymbol(route.target_isotope);
        const atomicMass = typeof AtomicMasses !== 'undefined' ? 
            AtomicMasses.getAtomicMass(targetElement) : 100.0; // Fallback if module not loaded
        const N_target = (targetMass * N_AVOGADRO * enrichment) / atomicMass;
        
        const reactionRate = Model.reactionRate(N_target, sigma_cm2, effectiveFlux, f_shield);

        // ============================================================================
        // ACTIVITY AND SPECIFIC ACTIVITY AT EOB
        // ============================================================================
        
        const t_irr = modelState.irradiationTime || 86400; // s
        const lambda = Model.decayConstant(route.product_half_life_days);
        
        // Product burn-up physics: OPTIONAL and data-dependent
        // Product burn-up occurs when the product isotope itself is activated during irradiation,
        // reducing the effective yield. This is significant for high-flux, long-irradiation cases.
        // 
        // Conditional logic: Only apply product burn-up if cross-section data is available.
        // Use pathway data if available, otherwise route data.
        // This preserves backward compatibility and allows routes without burn-up data to work normally.
        let N_EOB;
        let k_burn_product = 0;
        
        // Get product burn-up cross-section from pathway if available, otherwise route
        const sigma_product_burn_cm2 = pathway && pathway.production && pathway.production.sigma_product_burn_cm2 !== undefined
            ? pathway.production.sigma_product_burn_cm2
            : (route.sigma_product_burn_cm2 !== null && route.sigma_product_burn_cm2 !== undefined ? route.sigma_product_burn_cm2 : null);
        
        // Check if product burn-up should be applied
        const apply_product_burnup = pathway && pathway.production && pathway.production.burnup_product !== undefined
            ? pathway.production.burnup_product
            : (sigma_product_burn_cm2 !== null && sigma_product_burn_cm2 !== undefined && sigma_product_burn_cm2 > 0);
        
        if (apply_product_burnup && sigma_product_burn_cm2 !== null && sigma_product_burn_cm2 !== undefined && sigma_product_burn_cm2 > 0) {
            // Product burn-up data available: compute burn-up rate constant with self-shielding
            // v2.2.1: Now includes self-shielding for symmetric treatment with production reaction
            
            // Warn user about v2.2.1 change
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`Product burn-up now includes self-shielding (v2.2.1). Results may differ from v2.2.0 by 10–50% for thick or high-flux targets. Route: ${route.id}`);
            }
            
            // Estimate product atom density and target thickness for self-shielding calculation
            // Product atom density: approximate from reaction rate and saturation
            // Use target density as base, estimate product concentration from production
            const targetDensity_cm3 = modelState.targetDensity || 5e22; // Default: typical solid density (atoms/cm³)
            // Estimate product density: N_product ≈ R × f_sat / λ, where f_sat ≈ 1 - exp(-λt)
            const f_sat_approx = 1 - Math.exp(-lambda * t_irr);
            const lambda_safe = Math.max(lambda, 1e-10); // Avoid division by zero
            const N_product_approx = reactionRate * f_sat_approx / lambda_safe; // Approximate total product atoms
            // Target volume estimate: V = target_mass / mass_density
            // Mass density = (atomicMass / N_AVOGADRO) × targetDensity_cm3 (g/cm³)
            const massDensity_g_cm3 = (atomicMass / N_AVOGADRO) * targetDensity_cm3;
            const targetVolume_cm3 = massDensity_g_cm3 > 0 ? (targetMass / massDensity_g_cm3) : 1.0; // Approximate volume (cm³)
            // Product density = N_product / V_target (assuming uniform distribution)
            const productAtomDensity_cm3 = targetVolume_cm3 > 0 
                ? Math.min(N_product_approx / targetVolume_cm3, targetDensity_cm3) // Clamp to target density
                : targetDensity_cm3 * 0.1; // Fallback: 10% of target density
            // Ensure non-negative
            const productAtomDensity_cm3_clamped = Math.max(productAtomDensity_cm3, 0);
            
            // Estimate target thickness from target mass and density
            // For planning-grade: use default thickness or estimate from geometry
            const targetThickness_cm = modelState.targetThickness || 0.2; // Default: 0.2 cm (typical solid target)
            
            // Calculate product burn-up rate constant with self-shielding
            k_burn_product = Model.productBurnUpRate(
                effectiveFlux,
                sigma_product_burn_cm2,
                productAtomDensity_cm3_clamped,
                targetThickness_cm
            );
            
            // Warning: If burn-up dominates decay, yield will be strongly suppressed
            if (k_burn_product > lambda) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn(`Product burn-up dominates decay for route ${route.id}: ` +
                                `k_burn_product (${k_burn_product.toExponential(2)} s⁻¹) > lambda_decay (${lambda.toExponential(2)} s⁻¹). ` +
                                `Yield will be strongly suppressed.`);
                }
            }
            
            // Use product burn-up physics: atomsAtEOBWithProductBurnUp internally calculates
            // effective decay constant λ_eff = λ_decay + k_burn_product and applies it to saturation
            N_EOB = Model.atomsAtEOBWithProductBurnUp(reactionRate, lambda, k_burn_product, t_irr);
        } else {
            // No product burn-up data: use standard decay-only physics
            // This is the default behavior for routes without burn-up cross-section data
            const f_sat = Model.saturationFactor(lambda, t_irr);
            N_EOB = Model.atomsAtEOB(reactionRate, f_sat, lambda);
        }
        
        const activity_EOB = Model.activity(lambda, N_EOB);

        // Calculate product mass for specific activity calculation
        // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
        const ATOMIC_MASS_UNIT_g = 1.66053906660e-24; // g
        const productElement = this.extractElementSymbol(route.product_isotope);
        const productAtomicMass = typeof AtomicMasses !== 'undefined' ? 
            AtomicMasses.getAtomicMass(productElement) : 100.0; // Fallback if module not loaded
        const productMass = N_EOB * productAtomicMass * ATOMIC_MASS_UNIT_g;
        
        // For carrier-added routes, include carrier mass in specific activity calculation
        // Carrier-added specific activity includes stable carrier mass
        let totalMass = productMass;
        if (carrier_added_acceptable) {
            // For carrier-added production, add stable carrier mass
            // Default: assume carrier mass equals target mass (conservative)
            // This can be overridden by route-specific carrierMass metadata
            const carrierMass = route.carrier_mass || (modelState.targetMass || 1.0); // g, default to target mass
            totalMass = productMass + carrierMass;
            // Note: For n.c.a. routes, carrierMass is negligible (productMass only)
        }
        
        const specificActivity = Model.specificActivity(activity_EOB, Math.max(totalMass, 1e-9));

        // ============================================================================
        // IMPURITY RISK ASSESSMENT (QUALITATIVE + QUANTITATIVE)
        // ============================================================================
        
        const hasLongLivedImpurity = this.checkLongLivedImpurity(route);
        const hasChemicalInseparability = this.checkChemicalInseparability(route);
        
        // Quantitative impurity assessment (if data available)
        const quantitativeImpurityAssessment = this.assessImpurityQuantitative(
            route,
            N_target,
            sigma_cm2,
            effectiveFlux,
            f_shield,
            t_irr,
            activity_EOB,
            modelState,
            warningsRef
        );

        if (hasLongLivedImpurity) {
            reasons.push('Long-lived impurity present - may accumulate over multiple production cycles');
            classification = 'Feasible with constraints';
        }

        if (hasChemicalInseparability && !carrier_added_acceptable) {
            feasible = false;
            classification = 'Not recommended';
            reasons.push('Chemically inseparable impurity and carrier-added production not acceptable');
        } else if (hasChemicalInseparability) {
            warnings.push('Chemically inseparable impurity present - high-purity chemistry required');
        }

        // ============================================================================
        // IMPURITY TRAP ASSESSMENT
        // ============================================================================
        
        const impurityTrapAssessment = this.assessImpurityTraps(route);
        impurityRiskLevel = impurityTrapAssessment.risk_level;
        
        // Enhance risk level with quantitative assessment if available
        if (quantitativeImpurityAssessment.hasQuantitativeData) {
            const maxImpurityFraction = quantitativeImpurityAssessment.maxImpurityFraction;
            if (maxImpurityFraction > 0.01) { // >1%
                impurityRiskLevel = 'High';
                warnings.push(`QUANTITATIVE: Maximum impurity fraction ${(maxImpurityFraction * 100).toFixed(2)}% exceeds 1% threshold`);
            } else if (maxImpurityFraction > 0.001) { // 0.1-1%
                if (impurityRiskLevel === 'Low') {
                    impurityRiskLevel = 'Medium';
                }
                warnings.push(`QUANTITATIVE: Maximum impurity fraction ${(maxImpurityFraction * 100).toFixed(3)}% is in 0.1-1% range`);
            }
        }
        
        // Add warnings for high-risk impurity traps (but don't block calculations)
        if (impurityTrapAssessment.traps.length > 0) {
            impurityTrapAssessment.traps.forEach(trap => {
                if (trap.severity === 'high') {
                    warnings.push(`HIGH RISK: ${trap.message}`);
                } else if (trap.severity === 'moderate') {
                    warnings.push(`MODERATE RISK: ${trap.message}`);
                }
            });
        }
        
        // Check for FAIL condition: impurity half-life > 30 days AND inseparable
        // Note: This adds to reasons but doesn't automatically block (as per requirements)
        if (impurityTrapAssessment.has_fail_condition) {
            reasons.push('Long-lived inseparable impurity (>30 days half-life) - requires special handling');
            classification = 'Feasible with constraints';
        }

        // ============================================================================
        // REGULATORY FLAG CHECK
        // ============================================================================
        
        if (route.regulatory_flag === 'exploratory') {
            classification = 'Feasible with constraints';
            reasons.push('Exploratory route - requires special handling and regulatory review');
        } else if (route.regulatory_flag === 'constrained') {
            classification = 'Feasible with constraints';
            reasons.push('Route has operational constraints');
        }

        // ============================================================================
        // ACTIVITY THRESHOLD CHECKS (Application-Context Dependent)
        // ============================================================================
        
        // Application context thresholds (GBq)
        // Medical: viable ≥ 1 GBq, marginal 0.1–1 GBq, not viable < 0.1 GBq
        // Industrial: viable ≥ 0.1 GBq, marginal 0.01–0.1 GBq, not viable < 0.01 GBq
        // Research: viable ≥ 0.01 GBq, marginal 0.001–0.01 GBq, not viable < 0.001 GBq
        const applicationContext = modelState.applicationContext || 'medical'; // Default to medical
        const activity_GBq = activity_EOB / 1e9;
        
        let activityThresholds = {
            medical: { viable: 1.0, marginal: 0.1, notViable: 0.01 },
            industrial: { viable: 0.1, marginal: 0.01, notViable: 0.001 },
            research: { viable: 0.01, marginal: 0.001, notViable: 0.0001 }
        };
        
        const thresholds = activityThresholds[applicationContext] || activityThresholds.medical;
        
        if (activity_GBq < thresholds.notViable) {
            feasible = false;
            classification = 'Not recommended';
            reasons.push(`Activity yield at EOB (${activity_GBq.toFixed(4)} GBq) below ${applicationContext} application threshold (${thresholds.notViable} GBq)`);
        } else if (activity_GBq < thresholds.marginal) {
            classification = 'Feasible with constraints';
            reasons.push(`Activity yield at EOB (${activity_GBq.toFixed(3)} GBq) is marginal for ${applicationContext} application (threshold: ${thresholds.marginal} GBq)`);
        } else if (activity_GBq < thresholds.viable) {
            classification = 'Feasible with constraints';
            reasons.push(`Activity yield at EOB (${activity_GBq.toFixed(3)} GBq) may be insufficient for ${applicationContext} application (recommended: ≥${thresholds.viable} GBq)`);
        }

        // ============================================================================
        // SPECIFIC ACTIVITY CHECKS (for n.c.a. routes)
        // ============================================================================
        
        if (!carrier_added_acceptable) {
            // n.c.a. routes require high specific activity
            if (specificActivity < 1e12) { // Bq/g
                reasons.push(`Specific activity may be insufficient for n.c.a. requirements (${(specificActivity / 1e12).toFixed(2)} TBq/g)`);
                classification = 'Feasible with constraints';
            }
        }

        // ============================================================================
        // REACTION RATE CHECKS
        // ============================================================================
        
        if (reactionRate < 1e6) { // reactions/s
            warnings.push(`Low reaction rate (${reactionRate.toExponential(2)} reactions/s) - production may be inefficient`);
        }

        // ============================================================================
        // DELIVERED ACTIVITY (after decay + transport + chemistry yield)
        // ============================================================================
        
        // Calculate activity after decay during chemistry delay and transport
        let activity_after_decay_transport = activity_EOB;
        
        // Apply decay during chemistry delay (if chemistry delay specified)
        const chemistryDelay_hours = modelState.chemistryDelayHours || 0;
        if (chemistryDelay_hours > 0) {
            const t_chem = chemistryDelay_hours * 3600; // Convert to seconds
            activity_after_decay_transport = activity_after_decay_transport * Math.exp(-lambda * t_chem);
        }
        
        // Apply decay during transport (if transport time specified)
        const transportTime_hours = modelState.transportTimeHours || 0;
        if (transportTime_hours > 0) {
            const t_transport = transportTime_hours * 3600; // Convert to seconds
            activity_after_decay_transport = activity_after_decay_transport * Math.exp(-lambda * t_transport);
        }
        
        // Apply chemistry yield
        // Chemistry yield enforced to prevent optimistic bias.
        // If pathway.chemistry.default_yield exists, always apply it.
        // Never allow chemistry yield = 1.0 unless explicitly stated.
        let activity_delivered = activity_after_decay_transport;
        let chemistry_yield = null;
        let yield_source = null; // Track source for 1.0 validation
        
        // Priority 1: Pathway chemistry yield (always apply if exists, regardless of chemical_separable flag)
        if (pathway && pathway.chemistry && pathway.chemistry.default_yield !== undefined) {
            chemistry_yield = pathway.chemistry.default_yield;
            yield_source = 'pathway';
        }
        // Priority 2: Route chemistry yield (if explicitly provided)
        else if (route.chemistry_yield !== undefined && route.chemistry_yield !== null) {
            chemistry_yield = route.chemistry_yield;
            yield_source = 'route';
        }
        // Priority 3: Apply default only if chemically separable
        else if (chemical_separable === true) {
            chemistry_yield = DEFAULT_CHEMISTRY_YIELD; // Conservative default (0.85)
            yield_source = 'default';
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`No chemistry yield specified for route ${route.id}. Applying conservative default of 85%.`);
            }
        }
        
        // Apply chemistry yield if determined (never allow implicit 1.0)
        if (chemistry_yield !== null && chemistry_yield !== undefined) {
            // Enforce: Never allow 1.0 unless explicitly stated in pathway or route
            if (chemistry_yield >= 1.0) {
                const is_explicitly_stated = (yield_source === 'pathway' && pathway.chemistry.default_yield === 1.0) ||
                                            (yield_source === 'route' && route.chemistry_yield === 1.0);
                
                if (!is_explicitly_stated) {
                    // Clamp to conservative maximum (0.99) to prevent optimistic bias
                    chemistry_yield = 0.99;
                    if (typeof console !== 'undefined' && console.warn) {
                        console.warn(`Chemistry yield clamped to 0.99 (was >= 1.0) to prevent optimistic bias. Route: ${route.id}`);
                    }
                }
            }
            
            // Always apply chemistry yield using existing Model function
            activity_delivered = Model.deliveredActivityWithChemistryYield(activity_after_decay_transport, chemistry_yield);
        }

        // ============================================================================
        // HIGH-FLUX, LONG-IRRADIATION, THICK-TARGET WARNING
        // ============================================================================
        
        // Warn if all three conditions are met: high flux, long irradiation, thick target
        const irradiationTime_days = t_irr / 86400; // Convert seconds to days
        const targetThickness_cm = modelState.targetThickness || 0.2; // Default: 0.2 cm (typical solid target)
        
        if (effectiveFlux > 1e14 && irradiationTime_days > 7 && targetThickness_cm > 0.2) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`High-flux, long-irradiation, thick-target regime detected. ` +
                           `Even after v2.2.1 corrections, yields may be overestimated. ` +
                           `(flux: ${effectiveFlux.toExponential(2)} cm⁻² s⁻¹, time: ${irradiationTime_days.toFixed(1)} days, thickness: ${targetThickness_cm.toFixed(2)} cm)`);
            }
        }

        // ============================================================================
        // FINAL CLASSIFICATION
        // ============================================================================
        
        if (!feasible) {
            classification = 'Not recommended';
        } else if (reasons.length > 0) {
            classification = 'Feasible with constraints';
        } else {
            classification = 'Feasible';
        }

        return {
            route_id: route.id,
            feasible: feasible,
            classification: classification,
            reasons: reasons,
            warnings: warnings,
            impurity_risk_level: impurityRiskLevel
        };
    },

    /**
     * Check for long-lived impurities
     * 
     * @param {Object} route - Route object
     * @returns {boolean} True if long-lived impurity is present
     */
    checkLongLivedImpurity: function(route) {
        if (!route.impurity_risks || route.impurity_risks.length === 0) {
            return false;
        }

        const productHalfLife = route.product_half_life_days;
        
        // Known long-lived impurity patterns (heuristic)
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

        for (let i = 0; i < route.impurity_risks.length; i++) {
            const impurity = route.impurity_risks[i];
            const isLongLived = longLivedPatterns.some(pattern => pattern.test(impurity));
            
            if (isLongLived && productHalfLife < 30) {
                return true;
            }
        }

        return false;
    },

    /**
     * Check for chemical inseparability risks
     * 
     * @param {Object} route - Route object
     * @returns {boolean} True if chemically inseparable impurity is present
     */
    checkChemicalInseparability: function(route) {
        if (!route.impurity_risks || route.impurity_risks.length === 0) {
            return false;
        }

        const productElement = route.product_isotope.split('-')[0];

        for (let i = 0; i < route.impurity_risks.length; i++) {
            const impurity = route.impurity_risks[i];
            const impurityElement = impurity.match(/([A-Z][a-z]?)-?\d+/);
            
            if (impurityElement && impurityElement[1] === productElement) {
                return true;
            }
        }

        return false;
    },

    /**
     * Assess impurity trap risks
     * 
     * Rules:
     * - If impurity half-life >> product half-life → HIGH RISK
     * - If impurity is same element (Z unchanged) → HIGH RISK
     * - If impurity half-life > 30 days AND inseparable → FAIL condition
     * 
     * @param {Object} route - Route object
     * @returns {Object} Assessment result with risk_level and traps array
     */
    assessImpurityTraps: function(route) {
        const traps = [];
        let riskScore = 0;
        let hasFailCondition = false;
        const productHalfLife = route.product_half_life_days;
        const productElement = route.product_isotope.split('-')[0];

        if (!route.impurity_risks || route.impurity_risks.length === 0) {
            return {
                risk_level: 'Low',
                traps: [],
                has_fail_condition: false
            };
        }

        // Known impurity half-lives (days) - conservative estimates based on nuclear data
        // These are heuristics for common impurities, not exhaustive nuclear data
        const impurityHalfLives = {
            'Mo-100': 1e6,      // Very long-lived (effectively stable)
            'Sr-90': 10512,     // ~28.8 years
            'Co-60': 1925,      // ~5.27 years
            'Lu-178': 28.4,     // ~28.4 days
            'W-188': 69.4,      // ~69.4 days
            'Ni-59': 2.5e6,     // Very long-lived
            'Cu-65': Infinity,  // Stable
            'Zn-67': 2.4,       // ~2.4 days
            'Ho-166': 1.12,     // ~26.8 hours
            'Tm-170': 128.6,    // ~128.6 days
            'Bi-210': 5.0,      // ~5.0 days
            'Tl-204': 3.78,     // ~3.78 years
            'Cu-64': 0.53,      // ~12.7 hours
            'Zn-65': 244.0,     // ~244 days
            'Ni-63': 96.0,      // ~96 years (very long-lived)
            'Sc-46': 83.8,      // ~83.8 days
            'Ti-48': Infinity,  // Stable
            'Ca-47': 4.54,      // ~4.54 days
            'Ti-49': Infinity,  // Stable
            'Mo-98': Infinity,  // Stable
            'Tc-99m': 0.25,     // ~6 hours
            'Tc-99g': 2.13e5,   // Very long-lived
            'Re-188': 0.71,     // ~17 hours
            'Os-188': Infinity, // Stable
            'Sn-117g': Infinity, // Stable
            'Sn-118': Infinity, // Stable
            'In-117': 0.25,     // ~6 hours
            'Ra-224': 3.66,     // ~3.66 days
            'Rn-221': 0.0003,  // ~25 seconds
            'Fr-221': 0.0003,  // ~25 seconds
            'Bi-213': 0.0007,  // ~1 hour
            'Ir-192m': 241.0,   // ~241 days
            'Ir-193': Infinity, // Stable
            'Os-192': Infinity, // Stable
            'Pt-192': Infinity, // Stable
            'Co-60m': 0.0004,   // ~10.5 minutes
            'Ni-60': Infinity,  // Stable
            'Fe-60': 1e6        // Very long-lived
        };

        // Check each impurity
        route.impurity_risks.forEach(impurity => {
            // Extract isotope from impurity string (e.g., "Cu-64 from Zn-64(n,p)")
            const isotopeMatch = impurity.match(/([A-Z][a-z]?)-(\d+)/);
            if (!isotopeMatch) {
                return; // Skip if can't parse
            }

            const impurityIsotope = `${isotopeMatch[1]}-${isotopeMatch[2]}`;
            const impurityElement = isotopeMatch[1];
            const impurityHalfLife = impurityHalfLives[impurityIsotope];

            // Rule 1: Check if impurity half-life >> product half-life
            if (impurityHalfLife !== undefined && impurityHalfLife !== Infinity) {
                const halfLifeRatio = impurityHalfLife / productHalfLife;
                
                if (halfLifeRatio > 10) {
                    // Impurity half-life >> product half-life → HIGH RISK
                    riskScore += 3;
                    traps.push({
                        type: 'long_lived_impurity',
                        severity: 'high',
                        message: `Impurity ${impurityIsotope} has half-life ${impurityHalfLife.toFixed(1)} days, significantly exceeding product half-life (${productHalfLife.toFixed(2)} days, ratio ${halfLifeRatio.toFixed(1)}x)`
                    });
                } else if (halfLifeRatio > 3) {
                    // Moderate risk
                    riskScore += 1;
                    traps.push({
                        type: 'long_lived_impurity',
                        severity: 'moderate',
                        message: `Impurity ${impurityIsotope} has half-life ${impurityHalfLife.toFixed(1)} days, exceeding product half-life (${productHalfLife.toFixed(2)} days, ratio ${halfLifeRatio.toFixed(1)}x)`
                    });
                }
            } else if (impurityHalfLife === Infinity) {
                // Stable impurity → HIGH RISK if product is short-lived
                if (productHalfLife < 30) {
                    riskScore += 3;
                    traps.push({
                        type: 'stable_impurity',
                        severity: 'high',
                        message: `Stable impurity ${impurityIsotope} will accumulate indefinitely (product half-life ${productHalfLife.toFixed(2)} days)`
                    });
                }
            }

            // Rule 2: Check if impurity is same element (Z unchanged) → HIGH RISK
            if (impurityElement === productElement) {
                riskScore += 3;
                traps.push({
                    type: 'same_element_impurity',
                    severity: 'high',
                    message: `Impurity ${impurityIsotope} is same element as product (${productElement}) - chemical separation may be difficult`
                });
            }

            // Rule 3: Check if impurity half-life > 30 days AND inseparable
            if (impurityHalfLife !== undefined && 
                impurityHalfLife > 30 && 
                impurityHalfLife !== Infinity &&
                impurityElement === productElement) {
                hasFailCondition = true;
                traps.push({
                    type: 'long_lived_inseparable',
                    severity: 'high',
                    message: `FAIL CONDITION: Impurity ${impurityIsotope} has half-life ${impurityHalfLife.toFixed(1)} days (>30 days) and is same element as product - requires special handling`
                });
            }
        });

        // Determine overall risk level
        let riskLevel = 'Low';
        if (riskScore >= 6 || hasFailCondition) {
            riskLevel = 'High';
        } else if (riskScore >= 3) {
            riskLevel = 'Medium';
        }

        return {
            risk_level: riskLevel,
            traps: traps,
            has_fail_condition: hasFailCondition
        };
    },

    /**
     * Assess impurity production quantitatively
     * Calculates impurity production rates and compares to product activity
     * 
     * @param {Object} route - Route object
     * @param {number} N_target - Number of target atoms (for product-producing isotope)
     * @param {number} sigma_cm2 - Product production cross-section (cm²)
     * @param {number} effectiveFlux - Effective neutron flux (cm⁻² s⁻¹)
     * @param {number} f_shield - Self-shielding factor
     * @param {number} t_irr - Irradiation time (s)
     * @param {number} activity_product - Product activity at EOB (Bq)
     * @param {Object} modelState - Model state (for enrichment)
     * @param {Array} warnings - Warnings array to append to
     * @returns {Object} Quantitative assessment result
     */
    assessImpurityQuantitative: function(route, N_target, sigma_cm2, effectiveFlux, f_shield, t_irr, activity_product, modelState, warnings) {
        if (!route.impurity_risks || route.impurity_risks.length === 0 || activity_product <= 0) {
            return {
                hasQuantitativeData: false,
                maxImpurityFraction: 0,
                impurities: []
            };
        }

        // Planning-grade impurity cross-sections (conservative estimates)
        // Format: 'target-isotope(reaction)impurity-isotope': cross-section (barns)
        // Data quality: planning-grade (evaluated library) - values from ENDF/B-VIII.0 or TENDL-2019
        // Conservative mid-range estimates suitable for facility planning
        const impurityCrossSections = {
            // ============================================================================
            // FAST NEUTRON ROUTE IMPURITIES
            // ============================================================================
            
            // Zn-67(n,p)Cu-67 route impurities
            'Zn-64(n,p)Cu-64': 0.015, // Planning-grade (evaluated library): ~15 mb at 14.1 MeV
            'Zn-67(n,γ)Zn-65': 0.1,   // Planning-grade (evaluated library): thermal capture ~100 mb
            'Cu-63(n,p)Ni-63': 0.008, // Planning-grade (evaluated library): ~8 mb at 14.1 MeV
            
            // Ti-47(n,p)Sc-47 route impurities
            'Sc-47(n,γ)Sc-46': 0.05,  // Planning-grade (evaluated library): thermal capture ~50 mb
            'Ti-47(n,γ)Ti-48': 0.05,  // Planning-grade (evaluated library): thermal capture ~50 mb
            
            // Ti-48(n,d)Sc-47 route impurities
            'Ti-48(n,γ)Ti-49': 0.05,  // Planning-grade (evaluated library): thermal capture ~50 mb
            
            // Mo-100(n,2n)Mo-99 route impurities
            'Mo-99(n,γ)Mo-100': 0.15, // Planning-grade (evaluated library): thermal capture ~150 mb
            'Mo-99(n,2n)Mo-98': 0.3,  // Planning-grade (evaluated library): ~300 mb at 14.1 MeV
            
            // ============================================================================
            // MODERATED CAPTURE ROUTE IMPURITIES
            // ============================================================================
            
            // Ho-165(n,γ)Ho-166 route impurities
            'Ho-165(n,γ)Ho-166m': 0.5, // Planning-grade (evaluated library): thermal capture ~500 mb
            
            // Sm-152(n,γ)Sm-153 route impurities
            'Sm-153(n,γ)Sm-154': 0.2,  // Planning-grade (evaluated library): thermal capture ~200 mb
            
            // Dy-164(n,γ)Dy-165 route impurities
            'Dy-165(n,γ)Dy-166': 0.3,  // Planning-grade (evaluated library): thermal capture ~300 mb
            
            // Re-185(n,γ)Re-186 route impurities
            'Re-186(n,γ)Re-187': 0.12, // Planning-grade (evaluated library): thermal capture ~120 mb
            
            // Au-197(n,γ)Au-198 route impurities
            'Au-198(n,γ)Au-199': 0.25, // Planning-grade (evaluated library): thermal capture ~250 mb
            
            // Lu-176(n,γ)Lu-177 route impurities
            'Lu-177(n,γ)Lu-178': 0.2,  // Planning-grade (evaluated library): thermal capture ~200 mb
            
            // ============================================================================
            // GENERATOR ROUTE IMPURITIES
            // ============================================================================
            
            // W-188 → Re-188 generator impurities
            'W-188(n,γ)W-189': 0.15,   // Planning-grade (evaluated library): thermal capture ~150 mb
            
            // Sn-117m generator impurities
            'Sn-117m(n,γ)Sn-118': 0.08, // Planning-grade (evaluated library): thermal capture ~80 mb
            
            // ============================================================================
            // ALPHA/STRATEGIC ROUTE IMPURITIES
            // ============================================================================
            
            // Ra-226(n,2n)Ra-225 → Ac-225 route impurities
            'Ra-225(n,γ)Ra-224': 0.1,  // Planning-grade (evaluated library): thermal capture ~100 mb
            
            // ============================================================================
            // INDUSTRIAL ROUTE IMPURITIES
            // ============================================================================
            
            // Ir-191(n,γ)Ir-192 route impurities
            'Ir-192(n,γ)Ir-193': 0.18, // Planning-grade (evaluated library): thermal capture ~180 mb
            
            // Co-59(n,γ)Co-60 route impurities
            'Co-60(n,γ)Co-61': 0.2,    // Planning-grade (evaluated library): thermal capture ~200 mb
            
            // ============================================================================
            // DEFAULT FALLBACK
            // ============================================================================
            // If impurity cross-section not found above, use 10% of product cross-section
            // This is a conservative default but should be flagged as "data incomplete"
        };

        const impurities = [];
        let maxImpurityFraction = 0;
        let hasQuantitativeData = false;

        route.impurity_risks.forEach(impurityString => {
            // Parse impurity route (e.g., "Cu-64 from Zn-64(n,p)")
            const match = impurityString.match(/([A-Z][a-z]?)-(\d+)\s+from\s+([A-Z][a-z]?)-(\d+)\(([^)]+)\)/);
            if (!match) {
                return; // Skip if can't parse
            }

            const impurityIsotope = `${match[1]}-${match[2]}`;
            const targetIsotope = `${match[3]}-${match[4]}`;
            const reaction = match[5];
            const impurityKey = `${targetIsotope}(${reaction})${impurityIsotope}`;

            // Get impurity cross-section
            let sigma_impurity_barns = impurityCrossSections[impurityKey];
            if (!sigma_impurity_barns) {
                // Use conservative default: 10% of product cross-section
                sigma_impurity_barns = (sigma_cm2 / 1e-24) * 0.1; // Convert to barns and take 10%
            } else {
                hasQuantitativeData = true;
            }

            // Calculate impurity production rate
            const sigma_impurity_cm2 = sigma_impurity_barns * 1e-24;
            
            // Calculate impurity target atom density based on isotopic fraction
            // Parse target isotope from route to determine if impurity comes from different isotope
            const routeTargetIsotope = route.target_isotope; // e.g., 'Zn-67'
            const routeTargetElement = routeTargetIsotope.split('-')[0]; // 'Zn'
            const routeTargetMass = parseInt(routeTargetIsotope.split('-')[1]); // 67
            
            // Determine if impurity parent isotope is different from route target
            const impurityParentMass = parseInt(targetIsotope.split('-')[1]); // e.g., 64 from 'Zn-64'
            const impurityParentElement = targetIsotope.split('-')[0]; // 'Zn'
            
            let N_target_impurity = N_target; // Default: same as product target
            let impurityDataQuality = 'assumed_same_composition';
            
            if (impurityParentElement === routeTargetElement && impurityParentMass !== routeTargetMass) {
                // Impurity comes from different isotope of same element (e.g., Zn-64 in Zn-67 target)
                // Use natural isotopic abundance or enrichment metadata
                const isotopicAbundance = this.getIsotopicAbundance(impurityParentElement, impurityParentMass);
                if (isotopicAbundance !== null) {
                    // Calculate impurity atom density: N_impurity = N_total × isotopic_fraction
                    // For enriched targets, use enrichment if available, else natural abundance
                    const enrichment = modelState ? (modelState.enrichment || 1.0) : 1.0;
                    // If target is enriched in route isotope, other isotopes are depleted
                    // Conservative: use natural abundance (may underestimate for enriched targets)
                    // For enriched target, impurity fraction = natural_abundance / enrichment_factor
                    // But we need N_total, not N_enriched. Approximate: N_impurity ≈ N_target × (abundance / enrichment)
                    // This is conservative - assumes enrichment depletes other isotopes proportionally
                    const impurityFraction = isotopicAbundance / enrichment;
                    N_target_impurity = N_target * impurityFraction;
                    impurityDataQuality = 'natural_abundance';
                } else {
                    // Isotopic abundance unknown - mark as potentially underestimated
                    impurityDataQuality = 'potentially_underestimated';
                    if (warnings) {
                        warnings.push(`Impurity ${impurityIsotope} from ${targetIsotope} - isotopic abundance unknown, may be underestimated`);
                    }
                }
            } else if (impurityParentElement !== routeTargetElement) {
                // Impurity comes from different element (e.g., Cu-63 in Zn-67 target)
                // This is a trace impurity - use very small fraction
                // Conservative: assume 0.1% trace impurity
                N_target_impurity = N_target * 0.001;
                impurityDataQuality = 'trace_impurity_estimate';
            }
            // Else: same isotope (impurity from product itself) - use N_target as-is
            
            const R_impurity = Model.reactionRate(N_target_impurity, sigma_impurity_cm2, effectiveFlux, f_shield);

            // Get impurity half-life (from assessImpurityTraps database)
            const impurityHalfLives = {
                'Cu-64': 0.53, 'Zn-65': 244.0, 'Ni-63': 96.0 * 365.25,
                'Sc-46': 83.8, 'Ti-48': Infinity, 'Mo-100': 1e6,
                'Lu-178': 28.4, 'Zn-67': 2.4
            };
            const impurityHalfLife_days = impurityHalfLives[impurityIsotope];
            
            if (!impurityHalfLife_days || impurityHalfLife_days === Infinity) {
                return; // Skip stable or unknown impurities for activity calculation
            }

            // Calculate impurity activity at EOB
            const lambda_impurity = Model.decayConstant(impurityHalfLife_days);
            const f_sat_impurity = Model.saturationFactor(lambda_impurity, t_irr);
            const N_impurity_EOB = Model.atomsAtEOB(R_impurity, f_sat_impurity, lambda_impurity);
            const activity_impurity = Model.activity(lambda_impurity, N_impurity_EOB);

            // Calculate impurity fraction
            const impurityFraction = activity_impurity / activity_product;
            maxImpurityFraction = Math.max(maxImpurityFraction, impurityFraction);

            impurities.push({
                isotope: impurityIsotope,
                activity_Bq: activity_impurity,
                fraction: impurityFraction,
                cross_section_barns: sigma_impurity_barns,
                hasData: sigma_impurity_barns !== (sigma_cm2 / 1e-24) * 0.1, // True if not default
                data_quality: impurityDataQuality // 'natural_abundance', 'trace_impurity_estimate', 'assumed_same_composition', 'potentially_underestimated'
            });
        });

        return {
            hasQuantitativeData: hasQuantitativeData,
            maxImpurityFraction: maxImpurityFraction,
            impurities: impurities
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RouteEvaluator };
}

