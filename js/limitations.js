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
            title: 'Multi-Step Sequential Decay Chains Limited',
            description: 'The model supports general N-parent Bateman decay networks (branching allowed, e.g., A→C and B→C). However, sequential multi-step decay chains beyond parent→daughter (e.g., A→B→C→D) may have limitations depending on chain length and numerical stability. This may limit modeling of very long sequential decay chains.',
            severity: 'moderate',
            impact: 'Very long sequential generator systems (e.g., W-188 → Re-188 → Os-188 → ...) may have numerical limitations. Complex sequential alpha decay chains may require careful validation.',
            category: 'decay',
            affects: ['generator', 'alpha'],
            status: 'Known – Sequential Chains Limited',
            estimated_impact_magnitude: 'Branching decay networks are fully supported. Sequential chains beyond 4-5 steps may require validation for numerical stability.'
        },
        {
            id: 'product_burnup',
            title: 'Product Burn-Up Data-Dependent',
            description: 'Product burn-up physics is applied when σ_product_burn_cm2 cross-section data is provided in the route definition; otherwise product burn-up is ignored. For high-flux, long-irradiation cases, product burn-up can reduce yield by 10-50%. Routes without burn-up cross-section data will overestimate yield under these conditions.',
            severity: 'moderate',
            impact: 'Production yields may be overestimated for high-flux reactor production and long irradiations if burn-up cross-section data is not provided. Example: Lu-177(n,γ)Lu-178 reduces Lu-177 yield, but requires σ_product_burn_cm2 data to model.',
            category: 'activation',
            affects: ['high_flux', 'long_irradiation'],
            status: 'Known – Data-Dependent',
            estimated_impact_magnitude: '10-50% yield reduction for high-flux (φ > 1e14 cm⁻² s⁻¹) and long irradiations (t > 7 days) when burn-up data is available. Routes without data will not account for this effect.'
        },
        {
            id: 'spatial_flux_gradients',
            title: 'Spatial Flux Gradients - Circular Geometry Only',
            description: 'Spatial flux integration assumes a circular, radially symmetric target. Rectangular or irregular geometries are not supported in v2.x. For large targets or off-axis sources, flux can vary by 2-10× across the target.',
            severity: 'moderate',
            impact: 'Production yield accuracy may be affected for large targets. Specific activity uniformity not modeled. Non-circular geometries are not supported.',
            category: 'geometry',
            affects: ['large_targets', 'off_axis_sources', 'rectangular_targets'],
            status: 'Known – Circular Geometry Only',
            estimated_impact_magnitude: '2-10× flux variation for large targets (r > 5 cm) or off-axis sources (d/r < 2). Yield accuracy ±20-50% for non-uniform flux cases. Rectangular or irregular geometries not supported.'
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
        },
        {
            id: 'gdt_source_modeling',
            title: 'GDT Neutron Source Modeling Scope',
            description: 'GDT neutron source modeling is planning-grade only. Fusion power, wall loading, duty cycle, and availability are engineering estimates. Plasma physics, confinement, neutron transport, and first-wall lifetime are NOT modeled.',
            severity: 'moderate',
            impact: 'GDT source performance is based on engineering-level parameters. Plasma physics, confinement time, fusion gain, and detailed neutron transport are not included.',
            category: 'source',
            affects: ['gdt_sources'],
            status: 'Known – Planning-Grade',
            estimated_impact_magnitude: 'Source yield accuracy depends on engineering parameter estimates. Plasma physics and transport effects not modeled.'
        },
        {
            id: 'manufacturing_analysis',
            title: 'Manufacturing Analysis Scope',
            description: 'Manufacturing analysis (engineering, operations, cost, waste, electricity) is planning-grade only. All cost estimates, facility requirements, waste classifications, and energy consumption calculations are engineering-level approximations. Does NOT replace detailed engineering design, economic analysis, or regulatory waste classification.',
            severity: 'moderate',
            impact: 'Cost estimates, facility sizing, waste management, and energy consumption are planning-grade approximations. Actual values may vary significantly based on site-specific conditions, regulatory requirements, and detailed engineering design.',
            category: 'manufacturing',
            affects: ['cost_analysis', 'waste_management', 'facility_design'],
            status: 'Known – Planning-Grade',
            estimated_impact_magnitude: 'Cost estimates may vary by ±50-100%. Waste classifications are approximations. Facility requirements are order-of-magnitude estimates only.'
        }
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelLimitations };
}


if (typeof window !== 'undefined') {
    window.ModelLimitations = ModelLimitations;
}
