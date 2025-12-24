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
        // THRESHOLD CHECK
        // ============================================================================
        
        if (route.threshold_MeV !== null && route.threshold_MeV > 0) {
            const neutronEnergy = modelState.neutronEnergy || 14.1; // Default to 14.1 MeV for fast neutrons
            if (neutronEnergy < route.threshold_MeV) {
                return {
                    route_id: route.id,
                    feasible: false,
                    classification: 'Not recommended',
                    reasons: [`Neutron energy (${neutronEnergy.toFixed(2)} MeV) below reaction threshold (${route.threshold_MeV} MeV)`],
                    warnings: []
                };
            }
        }

        // ============================================================================
        // CHEMICAL SEPARABILITY CHECK
        // ============================================================================
        
        if (!route.chemical_separable && !route.carrier_added_acceptable) {
            return {
                route_id: route.id,
                feasible: false,
                classification: 'Not recommended',
                reasons: ['Product is chemically inseparable and carrier-added production is not acceptable'],
                warnings: []
            };
        }

        // ============================================================================
        // CROSS-SECTION AND FLUX DETERMINATION
        // ============================================================================
        
        let sigma_cm2 = 0;
        let effectiveFlux = 0;

        // Determine cross-section based on reaction type
        if (route.reaction === 'n,γ' || route.reaction === 'n,gamma') {
            // Thermal/epithermal neutron reaction
            if (route.nominal_sigma_barns === null) {
                warnings.push('Cross-section not specified - using conservative placeholder');
                // Use conservative placeholder: assume 1 barn thermal
                sigma_cm2 = 1e-24; // 1 barn = 1e-24 cm²
            } else {
                sigma_cm2 = route.nominal_sigma_barns * 1e-24; // Convert barns to cm²
            }
            // Use thermal flux
            effectiveFlux = modelState.neutronFlux || 1e14; // cm^-2 s^-1
        } else {
            // Fast neutron reaction (n,p, n,2n, n,d)
            if (route.nominal_sigma_barns === null) {
                warnings.push('Cross-section not specified - using conservative placeholder');
                // Use conservative placeholder: assume 10 mb at 14.1 MeV
                sigma_cm2 = 10e-27; // 10 mb = 10e-27 cm²
            } else {
                // Convert barns to cm² (1 barn = 1e-24 cm²)
                // Note: nominal_sigma_barns is always in barns (field name convention)
                sigma_cm2 = route.nominal_sigma_barns * 1e-24;
            }
            
            // Apply threshold activation if threshold exists
            const neutronEnergy = modelState.neutronEnergy || 14.1; // MeV
            if (route.threshold_MeV !== null && route.threshold_MeV > 0) {
                // thresholdActivation expects cross-section in mb
                // Convert cm² to mb: 1 mb = 1e-27 cm², so mb = cm² / 1e-27
                const sigma_mb = sigma_cm2 / 1e-27;
                const effectiveSigma_mb = Model.thresholdActivation(neutronEnergy, route.threshold_MeV, sigma_mb);
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
        // REACTION RATE CALCULATION
        // ============================================================================
        
        const f_shield = modelState.selfShieldingFactor || 1.0;
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
        const f_sat = Model.saturationFactor(lambda, t_irr);
        const N_EOB = Model.atomsAtEOB(reactionRate, f_sat, lambda);
        const activity_EOB = Model.activity(lambda, N_EOB);

        // Calculate product mass for specific activity calculation
        // Atomic masses are planning-grade values sourced from standard atomic weights; not isotopic mass excess.
        const ATOMIC_MASS_UNIT_g = 1.66053906660e-24; // g
        const productElement = this.extractElementSymbol(route.product_isotope);
        const productAtomicMass = typeof AtomicMasses !== 'undefined' ? 
            AtomicMasses.getAtomicMass(productElement) : 100.0; // Fallback if module not loaded
        const productMass = N_EOB * productAtomicMass * ATOMIC_MASS_UNIT_g;
        const specificActivity = Model.specificActivity(activity_EOB, Math.max(productMass, 1e-9));

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
            activity_EOB
        );

        if (hasLongLivedImpurity) {
            reasons.push('Long-lived impurity present - may accumulate over multiple production cycles');
            classification = 'Feasible with constraints';
        }

        if (hasChemicalInseparability && !route.carrier_added_acceptable) {
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
        // ACTIVITY THRESHOLD CHECKS
        // ============================================================================
        
        const activity_GBq = activity_EOB / 1e9;
        if (activity_GBq < 0.1) {
            reasons.push(`Low activity yield at EOB (${activity_GBq.toFixed(3)} GBq) - may be insufficient for practical use`);
            if (activity_GBq < 0.01) {
                feasible = false;
                classification = 'Not recommended';
            } else {
                classification = 'Feasible with constraints';
            }
        }

        // ============================================================================
        // SPECIFIC ACTIVITY CHECKS (for n.c.a. routes)
        // ============================================================================
        
        if (!route.carrier_added_acceptable) {
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
     * @param {number} N_target - Number of target atoms
     * @param {number} sigma_cm2 - Product production cross-section (cm²)
     * @param {number} effectiveFlux - Effective neutron flux (cm⁻² s⁻¹)
     * @param {number} f_shield - Self-shielding factor
     * @param {number} t_irr - Irradiation time (s)
     * @param {number} activity_product - Product activity at EOB (Bq)
     * @returns {Object} Quantitative assessment result
     */
    assessImpurityQuantitative: function(route, N_target, sigma_cm2, effectiveFlux, f_shield, t_irr, activity_product) {
        if (!route.impurity_risks || route.impurity_risks.length === 0 || activity_product <= 0) {
            return {
                hasQuantitativeData: false,
                maxImpurityFraction: 0,
                impurities: []
            };
        }

        // Planning-grade impurity cross-sections (conservative estimates)
        // Format: 'target-isotope(reaction)impurity-isotope': cross-section (barns)
        const impurityCrossSections = {
            // Zn-67(n,p)Cu-67 route impurities
            'Zn-64(n,p)Cu-64': 0.015, // Planning estimate: ~15 mb at 14.1 MeV
            'Zn-67(n,γ)Zn-65': 0.1,   // Planning estimate: thermal capture
            'Cu-63(n,p)Ni-63': 0.008, // Planning estimate: ~8 mb at 14.1 MeV
            
            // Ti-47(n,p)Sc-47 route impurities
            'Sc-47(n,γ)Sc-46': 0.05,  // Planning estimate: thermal capture
            'Ti-47(n,γ)Ti-48': 0.05,  // Planning estimate: thermal capture
            
            // Mo-100(n,2n)Mo-99 route impurities
            'Mo-99(n,γ)Mo-100': 0.15, // Planning estimate: thermal capture
            
            // Lu-176(n,γ)Lu-177 route impurities
            'Lu-177(n,γ)Lu-178': 0.2, // Planning estimate: thermal capture
            
            // Default: use 10% of product cross-section as conservative estimate
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
            // Assume same target atom density (simplified - actual would depend on target composition)
            const R_impurity = Model.reactionRate(N_target, sigma_impurity_cm2, effectiveFlux, f_shield);

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
                hasData: sigma_impurity_barns !== (sigma_cm2 / 1e-24) * 0.1 // True if not default
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

