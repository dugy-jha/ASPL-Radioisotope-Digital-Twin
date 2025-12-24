/**
 * limitations.js
 * 
 * Model Scope & Limitations Registry
 * 
 * Explicit documentation of physics limitations and assumptions in the digital twin.
 * This registry is used to inform users of model boundaries and missing physics effects.
 * 
 * All limitations are categorized by severity and impact.
 */

const ModelLimitations = {
    /**
     * Get all model limitations
     * 
     * @returns {Array<Object>} Array of limitation objects
     */
    getAllLimitations: function() {
        return this.LIMITATIONS;
    },

    /**
     * Get limitations by category
     * 
     * @param {string} category - Category ('high', 'moderate', 'low')
     * @returns {Array<Object>} Filtered limitations
     */
    getByCategory: function(category) {
        return this.LIMITATIONS.filter(lim => lim.severity === category);
    },

    /**
     * Registry of model limitations
     * 
     * Each limitation includes:
     * - id: Unique identifier
     * - title: Short title
     * - description: Detailed explanation
     * - severity: 'high', 'moderate', 'low'
     * - impact: Description of impact on calculations
     * - category: Physics domain ('decay', 'activation', 'engineering', 'geometry', 'uncertainty')
     */
    LIMITATIONS: [
        {
            id: 'multi_step_decay',
            title: 'Multi-Step Decay Chains Not Implemented',
            description: 'The model implements single-step parent→daughter decay chains only. Multi-step decay chains (e.g., A→B→C→D) are not supported. This limits modeling of complex generator systems and alpha decay chains.',
            severity: 'high',
            impact: 'Cannot model generator systems with multiple daughters (e.g., W-188 → Re-188 → Os-188). Cannot model alpha decay chains (e.g., Ra-225 → Ac-225 → Fr-221 → ...).',
            category: 'decay',
            affects: ['generator', 'alpha']
        },
        {
            id: 'product_burnup',
            title: 'Product Burn-Up Not Implemented',
            description: 'The model does not account for activation of the product isotope during irradiation. For high-flux, long-irradiation cases, product burn-up can reduce yield by 10-50%.',
            severity: 'high',
            impact: 'Production yields may be overestimated for high-flux reactor production and long irradiations. Example: Lu-177(n,γ)Lu-178 reduces Lu-177 yield.',
            category: 'activation',
            affects: ['high_flux', 'long_irradiation']
        },
        {
            id: 'spatial_flux_gradients',
            title: 'Spatial Flux Gradients Neglected',
            description: 'The model assumes uniform flux distribution across the target area. For large targets or off-axis sources, flux can vary by 2-10× across the target.',
            severity: 'moderate',
            impact: 'Production yield accuracy may be affected for large targets. Specific activity uniformity not modeled.',
            category: 'geometry',
            affects: ['large_targets', 'off_axis_sources']
        },
        {
            id: 'time_dependent_flux',
            title: 'Time-Dependent Flux Not Implemented',
            description: 'The model assumes constant flux/beam current during irradiation. Flux variation due to source decay, power ramps, or shutdowns is not modeled.',
            severity: 'moderate',
            impact: 'Production yield accuracy may be affected for long irradiations with varying source strength. Accelerator-driven sources with duty cycles are approximated.',
            category: 'activation',
            affects: ['long_irradiation', 'accelerator_sources']
        },
        {
            id: 'epithermal_resonance',
            title: 'Epithermal Resonance Integrals Neglected',
            description: 'The model uses a single "thermal" cross-section and does not separately treat epithermal neutrons (0.5 eV - 100 keV). Some isotopes have large epithermal resonance integrals.',
            severity: 'moderate',
            impact: 'Production yields may be underestimated for isotopes with large resonance integrals (e.g., Lu-176 has resonance at 0.142 eV). Epithermal activation can contribute 10-30% of total production.',
            category: 'activation',
            affects: ['resonance_isotopes']
        },
        {
            id: 'thermal_gradients',
            title: 'Detailed Thermal Gradients Not Implemented',
            description: 'The thermal model assumes uniform temperature distribution. Spatial temperature gradients, heat conduction, and coolant flow patterns are not modeled.',
            severity: 'moderate',
            impact: 'Thermal limits may be overly conservative for high-power designs. Hot spots may exceed material limits even if average ΔT < ΔT_max.',
            category: 'engineering',
            affects: ['high_power', 'beam_power']
        },
        {
            id: 'charged_particle_range',
            title: 'Charged-Particle Range and Stopping Power Not Implemented',
            description: 'For alpha particle reactions, energy loss and range calculations are not performed. Cross-section energy dependence with depth is not modeled.',
            severity: 'low',
            impact: 'Alpha particle route evaluations use placeholder cross-sections. Production yield accuracy limited for charged-particle routes.',
            category: 'activation',
            affects: ['alpha_routes']
        },
        {
            id: 'chemistry_yield',
            title: 'Chemistry Separation Yield Not Quantified',
            description: 'The model accounts for decay during chemistry delay but does not include quantitative separation yield losses (typically 70-95% yield).',
            severity: 'low',
            impact: 'Delivered activity may be overestimated. Chemistry yield losses are not included in calculations.',
            category: 'logistics',
            affects: ['delivered_activity']
        },
        {
            id: 'correlated_uncertainty',
            title: 'Correlated Uncertainty Not Modeled',
            description: 'Uncertainty propagation uses root-sum-square (RSS) method, which assumes uncorrelated parameters. Correlated uncertainties are not handled.',
            severity: 'low',
            impact: 'Total uncertainty may be underestimated if parameters are correlated. RSS method is conservative for independent parameters.',
            category: 'uncertainty',
            affects: ['uncertainty_quantification']
        },
        {
            id: 'annealing_effects',
            title: 'Radiation Damage Annealing Not Modeled',
            description: 'Damage accumulation assumes linear DPA accumulation with no annealing or recovery effects.',
            severity: 'low',
            impact: 'Damage limits may be overly conservative for materials that exhibit annealing at elevated temperatures.',
            category: 'engineering',
            affects: ['damage_derating']
        }
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelLimitations };
}

