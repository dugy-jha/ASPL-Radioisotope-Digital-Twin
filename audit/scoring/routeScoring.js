/**
 * routeScoring.js
 * 
 * Route Scoring Module
 * 
 * Provides deterministic scoring overlay for isotope production routes.
 * Scoring is based on evaluation results and route characteristics.
 * 
 * Rules:
 * - All scoring is deterministic (no randomness)
 * - All scoring criteria are explicit and transparent
 * - Scoring does not modify physics calculations
 * - Scoring is an analytical overlay only
 * 
 * Classification thresholds:
 * - ≥4.0 → High Priority
 * - 2.5-4.0 → Conditional
 * - <2.5 → Low Priority
 */

const RouteScoring = {
    /**
     * Score a route based on evaluation results
     * 
     * @param {Object} route - Route object from ISOTOPE_ROUTES
     * @param {Object} evaluationResult - Result from RouteEvaluator.evaluateRoute()
     * @returns {Object} Scoring result
     */
    scoreRoute: function(route, evaluationResult) {
        if (!route || !evaluationResult) {
            throw new Error('Route and evaluationResult must be provided');
        }

        const breakdown = {
            physics: this.scorePhysics(route, evaluationResult),
            yield: this.scoreYield(evaluationResult),
            specific_activity: this.scoreSpecificActivity(route, evaluationResult),
            impurity: this.scoreImpurity(evaluationResult),
            logistics: this.scoreLogistics(route),
            regulatory: this.scoreRegulatory(route)
        };

        // Total score is average of all category scores (0-5 scale)
        const total_score = (
            breakdown.physics +
            breakdown.yield +
            breakdown.specific_activity +
            breakdown.impurity +
            breakdown.logistics +
            breakdown.regulatory
        ) / 6;

        // Classification based on total score
        let classification;
        if (total_score >= 4.0) {
            classification = 'High Priority';
        } else if (total_score >= 2.5) {
            classification = 'Conditional';
        } else {
            classification = 'Low Priority';
        }

        return {
            total_score: total_score,
            breakdown: breakdown,
            classification: classification
        };
    },

    /**
     * Score physics feasibility
     * Based on feasibility classification and threshold requirements
     * 
     * @param {Object} route - Route object
     * @param {Object} evaluationResult - Evaluation result
     * @returns {number} Score 0-5
     */
    scorePhysics: function(route, evaluationResult) {
        // Base score from feasibility classification
        let score = 0;
        
        if (evaluationResult.classification === 'Feasible') {
            score = 5.0;
        } else if (evaluationResult.classification === 'Feasible with constraints') {
            score = 3.0;
        } else if (evaluationResult.classification === 'Not recommended') {
            score = 0.5;
        }

        // Penalize if threshold not met (should be caught in feasibility, but double-check)
        if (route.threshold_MeV !== null && route.threshold_MeV > 0) {
            // Threshold routes require fast neutrons - if not feasible, physics is problematic
            if (evaluationResult.classification === 'Not recommended' && 
                evaluationResult.reasons.some(r => r.includes('threshold'))) {
                score = 0.0;
            }
        }

        // Penalize if cross-section is missing (planning uncertainty)
        if (route.nominal_sigma_barns === null || route.nominal_sigma_barns === 0) {
            score = Math.max(0, score - 1.0);
        }

        return Math.max(0, Math.min(5, score));
    },

    /**
     * Score production yield
     * Based on reaction rate and activity at EOB
     * 
     * @param {Object} evaluationResult - Evaluation result
     * @returns {number} Score 0-5
     */
    scoreYield: function(evaluationResult) {
        // Note: evaluationResult may not have activity/reaction_rate if evaluation failed
        // Use feasibility as proxy if detailed metrics unavailable
        
        if (evaluationResult.classification === 'Not recommended') {
            return 0.5;
        }

        // If we have reaction rate and activity, score based on those
        // Thresholds are arbitrary but deterministic
        const reactionRate = evaluationResult.reaction_rate || 0;
        const activity_GBq = (evaluationResult.activity || 0) / 1e9;

        let score = 2.5; // Base score for feasible routes

        // Reaction rate scoring (reactions/s)
        if (reactionRate >= 1e12) {
            score += 1.0; // Very high yield
        } else if (reactionRate >= 1e10) {
            score += 0.5; // High yield
        } else if (reactionRate >= 1e8) {
            score += 0.0; // Moderate yield
        } else if (reactionRate >= 1e6) {
            score -= 0.5; // Low yield
        } else {
            score -= 1.0; // Very low yield
        }

        // Activity scoring (GBq)
        if (activity_GBq >= 100) {
            score += 1.0; // Very high activity
        } else if (activity_GBq >= 10) {
            score += 0.5; // High activity
        } else if (activity_GBq >= 1) {
            score += 0.0; // Moderate activity
        } else if (activity_GBq >= 0.1) {
            score -= 0.5; // Low activity
        } else {
            score -= 1.0; // Very low activity
        }

        return Math.max(0, Math.min(5, score));
    },

    /**
     * Score specific activity
     * Based on specific activity requirements for n.c.a. vs carrier-added routes
     * 
     * @param {Object} route - Route object
     * @param {Object} evaluationResult - Evaluation result
     * @returns {number} Score 0-5
     */
    scoreSpecificActivity: function(route, evaluationResult) {
        const specificActivity = evaluationResult.specific_activity || 0;
        const specificActivity_TBq_g = specificActivity / 1e12;

        let score = 2.5; // Base score

        if (!route.carrier_added_acceptable) {
            // n.c.a. routes require high specific activity
            if (specificActivity_TBq_g >= 10) {
                score = 5.0; // Excellent for n.c.a.
            } else if (specificActivity_TBq_g >= 1) {
                score = 4.0; // Good for n.c.a.
            } else if (specificActivity_TBq_g >= 0.1) {
                score = 2.5; // Marginal for n.c.a.
            } else {
                score = 1.0; // Insufficient for n.c.a.
            }
        } else {
            // Carrier-added routes have less stringent requirements
            if (specificActivity_TBq_g >= 1) {
                score = 5.0; // Excellent
            } else if (specificActivity_TBq_g >= 0.1) {
                score = 4.0; // Good
            } else if (specificActivity_TBq_g >= 0.01) {
                score = 3.0; // Acceptable
            } else {
                score = 2.0; // Low but acceptable for carrier-added
            }
        }

        return Math.max(0, Math.min(5, score));
    },

    /**
     * Score impurity risk
     * Based on impurity risk level and known impurity risks
     * 
     * @param {Object} evaluationResult - Evaluation result
     * @returns {number} Score 0-5
     */
    scoreImpurity: function(evaluationResult) {
        const impurityRiskLevel = evaluationResult.impurity_risk_level || 'Unknown';
        const hasWarnings = evaluationResult.warnings && evaluationResult.warnings.length > 0;
        const hasFailCondition = evaluationResult.reasons && 
            evaluationResult.reasons.some(r => r.includes('impurity') || r.includes('Impurity'));

        let score = 3.0; // Base score

        // Score based on risk level
        if (impurityRiskLevel === 'Low') {
            score = 5.0;
        } else if (impurityRiskLevel === 'Medium') {
            score = 3.0;
        } else if (impurityRiskLevel === 'High') {
            score = 1.0;
        } else {
            score = 2.0; // Unknown risk
        }

        // Penalize for warnings
        if (hasWarnings) {
            const highRiskWarnings = evaluationResult.warnings.filter(w => 
                w.includes('HIGH RISK') || w.includes('FAIL CONDITION')
            ).length;
            score -= highRiskWarnings * 1.0;
            score -= (evaluationResult.warnings.length - highRiskWarnings) * 0.3;
        }

        // Penalize for fail conditions
        if (hasFailCondition) {
            score -= 1.5;
        }

        return Math.max(0, Math.min(5, score));
    },

    /**
     * Score logistics feasibility
     * Based on half-life, chemical separability, and carrier requirements
     * 
     * @param {Object} route - Route object
     * @returns {number} Score 0-5
     */
    scoreLogistics: function(route) {
        let score = 3.0; // Base score

        // Half-life scoring (days)
        // Optimal range: 1-10 days for medical isotopes, longer for industrial
        const halfLife = route.product_half_life_days;

        if (route.category === 'industrial') {
            // Industrial routes benefit from longer half-lives
            if (halfLife >= 30) {
                score += 1.0; // Long shelf life
            } else if (halfLife >= 7) {
                score += 0.5; // Good shelf life
            } else if (halfLife < 1) {
                score -= 0.5; // Very short for industrial use
            }
        } else {
            // Medical/therapeutic routes: optimal 1-10 days
            if (halfLife >= 1 && halfLife <= 10) {
                score += 1.0; // Optimal range
            } else if (halfLife >= 0.5 && halfLife < 1) {
                score += 0.5; // Acceptable but short
            } else if (halfLife > 10 && halfLife <= 30) {
                score += 0.0; // Acceptable but longer
            } else if (halfLife > 30) {
                score -= 0.5; // Long for medical use
            } else {
                score -= 1.0; // Very short, logistics challenging
            }
        }

        // Chemical separability
        if (!route.chemical_separable) {
            score -= 1.5; // Significant logistics challenge
        }

        // Carrier-added acceptability
        if (!route.carrier_added_acceptable && route.category !== 'industrial') {
            // n.c.a. requirement adds complexity
            score -= 0.3;
        }

        return Math.max(0, Math.min(5, score));
    },

    /**
     * Score regulatory feasibility
     * Based on regulatory flag and route characteristics
     * 
     * @param {Object} route - Route object
     * @returns {number} Score 0-5
     */
    scoreRegulatory: function(route) {
        let score = 3.0; // Base score

        // Regulatory flag scoring
        if (route.regulatory_flag === 'standard') {
            score = 5.0; // Standard regulatory pathway
        } else if (route.regulatory_flag === 'constrained') {
            score = 3.0; // Some constraints but manageable
        } else if (route.regulatory_flag === 'exploratory') {
            score = 1.5; // Exploratory routes have significant regulatory uncertainty
        }

        // Additional penalties for alpha/strategic routes
        if (route.category === 'alpha') {
            score -= 1.0; // Alpha routes have additional regulatory requirements
        }

        // Data quality affects regulatory confidence
        if (route.data_quality === 'planning-conservative') {
            // Planning estimates may require additional validation for regulatory approval
            score -= 0.2;
        }

        return Math.max(0, Math.min(5, score));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RouteScoring };
}

