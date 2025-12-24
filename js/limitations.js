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
            affects: ['generator', 'alpha'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Critical for alpha routes and complex generator systems. Blocks accurate modeling of Ra-225 → Ac-225 production chain.'
        },
        {
            id: 'product_burnup',
            title: 'Product Burn-Up Not Implemented',
            description: 'The model does not account for activation of the product isotope during irradiation. For high-flux, long-irradiation cases, product burn-up can reduce yield by 10-50%.',
            severity: 'high',
            impact: 'Production yields may be overestimated for high-flux reactor production and long irradiations. Example: Lu-177(n,γ)Lu-178 reduces Lu-177 yield.',
            category: 'activation',
            affects: ['high_flux', 'long_irradiation'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: '10-50% yield reduction for high-flux (φ > 1e14 cm⁻² s⁻¹) and long irradiations (t > 7 days). Critical for reactor production routes.'
        },
        {
            id: 'spatial_flux_gradients',
            title: 'Spatial Flux Gradients Neglected',
            description: 'The model assumes uniform flux distribution across the target area. For large targets or off-axis sources, flux can vary by 2-10× across the target.',
            severity: 'moderate',
            impact: 'Production yield accuracy may be affected for large targets. Specific activity uniformity not modeled.',
            category: 'geometry',
            affects: ['large_targets', 'off_axis_sources'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: '2-10× flux variation for large targets (r > 5 cm) or off-axis sources (d/r < 2). Yield accuracy ±20-50% for non-uniform flux cases.'
        },
        {
            id: 'time_dependent_flux',
            title: 'Time-Dependent Flux Not Implemented',
            description: 'The model assumes constant flux/beam current during irradiation. Flux variation due to source decay, power ramps, or shutdowns is not modeled.',
            severity: 'moderate',
            impact: 'Production yield accuracy may be affected for long irradiations with varying source strength. Accelerator-driven sources with duty cycles are approximated.',
            category: 'activation',
            affects: ['long_irradiation', 'accelerator_sources'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Yield accuracy ±10-30% for long irradiations (t > 14 days) with source decay or power ramps. Duty cycle approximation valid for <20% variation.'
        },
        {
            id: 'epithermal_resonance',
            title: 'Epithermal Resonance Integrals Neglected',
            description: 'The model uses a single "thermal" cross-section and does not separately treat epithermal neutrons (0.5 eV - 100 keV). Some isotopes have large epithermal resonance integrals.',
            severity: 'moderate',
            impact: 'Production yields may be underestimated for isotopes with large resonance integrals (e.g., Lu-176 has resonance at 0.142 eV). Epithermal activation can contribute 10-30% of total production.',
            category: 'activation',
            affects: ['resonance_isotopes'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: '10-30% yield underestimation for isotopes with large resonance integrals (Lu-176, Dy-164, Sm-152). Critical for moderated capture routes.'
        },
        {
            id: 'thermal_gradients',
            title: 'Detailed Thermal Gradients Not Implemented',
            description: 'The thermal model assumes uniform temperature distribution. Spatial temperature gradients, heat conduction, and coolant flow patterns are not modeled.',
            severity: 'moderate',
            impact: 'Thermal limits may be overly conservative for high-power designs. Hot spots may exceed material limits even if average ΔT < ΔT_max.',
            category: 'engineering',
            affects: ['high_power', 'beam_power'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Temperature gradients 50-100 K for high-power targets (P > 1 kW). Hot spots may exceed limits by 20-50% even if average ΔT acceptable.'
        },
        {
            id: 'charged_particle_range',
            title: 'Charged-Particle Range and Stopping Power Not Implemented',
            description: 'For alpha particle reactions, energy loss and range calculations are not performed. Cross-section energy dependence with depth is not modeled.',
            severity: 'low',
            impact: 'Alpha particle route evaluations use placeholder cross-sections. Production yield accuracy limited for charged-particle routes.',
            category: 'activation',
            affects: ['alpha_routes'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Placeholder cross-sections used. Yield accuracy ±50-100% for alpha routes. Range effects not accounted for.'
        },
        {
            id: 'chemistry_yield',
            title: 'Chemistry Separation Yield Not Quantified',
            description: 'The model accounts for decay during chemistry delay but does not include quantitative separation yield losses (typically 70-95% yield).',
            severity: 'low',
            impact: 'Delivered activity may be overestimated. Chemistry yield losses are not included in calculations.',
            category: 'logistics',
            affects: ['delivered_activity'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Delivered activity overestimated by 5-30% (typical separation yields 70-95%). Not critical for planning but affects delivered activity accuracy.'
        },
        {
            id: 'correlated_uncertainty',
            title: 'Correlated Uncertainty Not Modeled',
            description: 'Uncertainty propagation uses root-sum-square (RSS) method, which assumes uncorrelated parameters. Correlated uncertainties are not handled.',
            severity: 'low',
            impact: 'Total uncertainty may be underestimated if parameters are correlated. RSS method is conservative for independent parameters.',
            category: 'uncertainty',
            affects: ['uncertainty_quantification'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Total uncertainty may be underestimated by 10-20% if parameters are strongly correlated. RSS is conservative for independent parameters.'
        },
        {
            id: 'annealing_effects',
            title: 'Radiation Damage Annealing Not Modeled',
            description: 'Damage accumulation assumes linear DPA accumulation with no annealing or recovery effects.',
            severity: 'low',
            impact: 'Damage limits may be overly conservative for materials that exhibit annealing at elevated temperatures.',
            category: 'engineering',
            affects: ['damage_derating'],
            status: 'Known – Not Implemented',
            estimated_impact_magnitude: 'Damage limits conservative by 10-30% for materials with annealing (e.g., Cu, Al at elevated temperatures). Linear accumulation assumed.'
        },
        {
            id: 'cfd_solver',
            title: 'CFD Solver Not Implemented',
            description: 'Computational Fluid Dynamics (CFD) solver is not implemented. Thermal boundary conditions can be exported for external CFD solvers.',
            severity: 'low',
            impact: 'Detailed thermal-hydraulic analysis requires external CFD solver. Export interface provided.',
            category: 'engineering',
            affects: ['thermal_analysis'],
            status: 'Explicitly Excluded',
            estimated_impact_magnitude: 'Thermal analysis limited to simplified models. Export interface available for external CFD solvers.'
        },
        {
            id: 'neutron_transport',
            title: 'Neutron Transport Solver Not Implemented',
            description: 'Neutron transport solver (e.g., MCNP, OpenMC) is not implemented. Geometry and source definitions can be exported for external transport solvers.',
            severity: 'low',
            impact: 'Detailed neutron flux calculations require external transport solver. Export interface provided.',
            category: 'activation',
            affects: ['flux_calculations'],
            status: 'Explicitly Excluded',
            estimated_impact_magnitude: 'Flux calculations use simplified geometry models. Export interface available for external transport solvers.'
        },
        {
            id: 'licensing_approval',
            title: 'Licensing Approval Not Provided',
            description: 'This digital twin does not provide regulatory licensing approval. It is a planning tool only.',
            severity: 'low',
            impact: 'Users must obtain appropriate regulatory approvals independently.',
            category: 'regulatory',
            affects: ['all'],
            status: 'Explicitly Excluded',
            estimated_impact_magnitude: 'No impact on calculations. Regulatory approval must be obtained through appropriate channels.'
        },
        {
            id: 'production_guarantees',
            title: 'Production Guarantees Not Provided',
            description: 'This digital twin does not guarantee production yields or facility performance. Results are planning estimates only.',
            severity: 'low',
            impact: 'Users must validate production yields through experimental measurements.',
            category: 'operations',
            affects: ['all'],
            status: 'Explicitly Excluded',
            estimated_impact_magnitude: 'No impact on calculations. Production yields are planning estimates, not guarantees.'
        },
        {
            id: 'economic_optimization',
            title: 'Economic Optimization Not Implemented',
            description: 'Economic optimization, cost modeling, and business case analysis are not implemented.',
            severity: 'low',
            impact: 'Economic analysis requires external tools or manual calculations.',
            category: 'business',
            affects: ['business_planning'],
            status: 'Explicitly Excluded',
            estimated_impact_magnitude: 'No impact on physics calculations. Economic analysis requires external tools.'
        }
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelLimitations };
}

