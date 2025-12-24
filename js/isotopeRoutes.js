/**
 * isotopeRoutes.js
 * 
 * Isotope Production Route Registry
 * 
 * Structured registry of radioisotope production routes with physical parameters.
 * This file contains route definitions only - no calculations or physics logic.
 * 
 * All cross-section values are planning-level estimates:
 * - Values represent conservative lower-bound or mid-range estimates
 * - Values are suitable for facility planning and design studies
 * - Values do not represent evaluated nuclear data library values
 * - Values are not validated against experimental measurements
 * - Accuracy claims are not made for these planning values
 * 
 * These are scenario definitions for planning purposes, not regulatory approvals.
 */

const ISOTOPE_ROUTES = [
    // ============================================================================
    // FAST NEUTRON ROUTES (14 MeV)
    // ============================================================================
    
    {
        id: 'zn67-np-cu67',
        category: 'fast',
        target_isotope: 'Zn-67',
        reaction: 'n,p',
        threshold_MeV: 0.0,
        nominal_sigma_barns: 0.020, // Planning estimate: conservative lower-bound at 14.1 MeV
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for 14.1 MeV neutrons. Actual values may vary with neutron energy spectrum.',
        product_isotope: 'Cu-67',
        product_half_life_days: 2.58,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'Cu-64 from Zn-64(n,p)',
            'Zn-65 from Zn-67(n,γ)',
            'Ni-63 from Cu-63(n,p)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS I', // Fast-dominant (minimal moderation)
        required_spectrum: 'fast', // Fast neutron spectrum required
        moderator_complexity: 'low', // Minimal moderation needed
        shielding_complexity: 'medium' // Moderate shielding for 14 MeV neutrons
    },
    
    {
        id: 'ti47-np-sc47',
        category: 'fast',
        target_isotope: 'Ti-47',
        reaction: 'n,p',
        threshold_MeV: 0.0,
        nominal_sigma_barns: 0.012, // Planning estimate: conservative lower-bound at 14.1 MeV
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for 14.1 MeV neutrons. Threshold is very low, enabling production at moderate neutron energies.',
        product_isotope: 'Sc-47',
        product_half_life_days: 3.35,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'Sc-46 from Sc-47(n,γ)',
            'Ti-48 from Ti-47(n,γ)',
            'Ca-47 from Sc-47 decay'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS I', // Fast-dominant (minimal moderation)
        required_spectrum: 'fast', // Fast neutron spectrum required
        moderator_complexity: 'low', // Minimal moderation needed
        shielding_complexity: 'medium' // Moderate shielding for 14 MeV neutrons
    },
    
    {
        id: 'ti48-nd-sc47',
        category: 'fast',
        target_isotope: 'Ti-48',
        reaction: 'n,d',
        threshold_MeV: 2.0, // Planning estimate: approximate threshold for (n,d) reaction
        nominal_sigma_barns: 0.008, // Planning estimate: conservative lower-bound at 14.1 MeV
        data_quality: 'planning-conservative',
        notes: 'Cross-section and threshold are planning estimates. (n,d) reactions are less common than (n,p) and may have higher uncertainty.',
        product_isotope: 'Sc-47',
        product_half_life_days: 3.35,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'Sc-46 from Sc-47(n,γ)',
            'Ti-49 from Ti-48(n,γ)',
            'Ca-47 from Sc-47 decay'
        ],
        regulatory_flag: 'constrained',
        // D-T Generator Classification
        generator_class: 'CLASS I', // Fast-dominant (minimal moderation)
        required_spectrum: 'fast', // Fast neutron spectrum required
        moderator_complexity: 'low', // Minimal moderation needed
        shielding_complexity: 'medium' // Moderate shielding for 14 MeV neutrons
    },
    
    {
        id: 'mo100-n2n-mo99',
        category: 'fast',
        target_isotope: 'Mo-100',
        reaction: 'n,2n',
        threshold_MeV: 8.0,
        nominal_sigma_barns: 0.4, // Planning estimate: conservative lower-bound at 14.1 MeV
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for 14.1 MeV neutrons. (n,2n) reactions typically have higher cross-sections than (n,p) at fast neutron energies.',
        product_isotope: 'Mo-99',
        product_half_life_days: 2.75,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: true,
        carrier_mass: null, // Default: use target mass (conservative). Can be overridden with route-specific value.
        impurity_risks: [
            'Mo-98 from Mo-99(n,2n)',
            'Mo-100 from Mo-99(n,γ)',
            'Tc-99m from Mo-99 decay (desired daughter)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS I', // Fast-dominant (minimal moderation)
        required_spectrum: 'fast', // Fast neutron spectrum required
        moderator_complexity: 'low', // Minimal moderation needed
        shielding_complexity: 'medium' // Moderate shielding for 14 MeV neutrons
    },
    
    // ============================================================================
    // MODERATED CAPTURE ROUTES (Thermal/Epithermal)
    // ============================================================================
    
    {
        id: 'ho165-ng-ho166',
        category: 'moderated',
        target_isotope: 'Ho-165',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 55, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Actual values depend on neutron spectrum and may be higher.',
        product_isotope: 'Ho-166',
        product_half_life_days: 1.12, // ~26.8 hours
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        resonance_dominated: true, // Ho-165 has resonance-dominated capture
        impurity_risks: [
            'Ho-166m from Ho-165(n,γ)',
            'Dy-166 from Ho-166 decay',
            'Er-166 from Ho-166(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'sm152-ng-sm153',
        category: 'moderated',
        target_isotope: 'Sm-152',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 180, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Samarium has high neutron capture cross-sections due to resonance structure.',
        product_isotope: 'Sm-153',
        product_half_life_days: 1.93, // ~46.3 hours
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        resonance_dominated: true, // Samarium isotopes have strong resonance structure
        impurity_risks: [
            'Sm-154 from Sm-153(n,γ)',
            'Pm-153 from Sm-153 decay',
            'Eu-153 from Sm-153(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'dy164-ng-dy165',
        category: 'moderated',
        target_isotope: 'Dy-164',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 2400, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Dysprosium-164 has one of the highest thermal capture cross-sections due to strong resonance.',
        product_isotope: 'Dy-165',
        product_half_life_days: 0.097, // ~2.33 hours
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        resonance_dominated: true, // Dy-164 has strong resonance structure
        impurity_risks: [
            'Dy-166 from Dy-165(n,γ)',
            'Tb-165 from Dy-165 decay',
            'Ho-165 from Dy-165(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 're185-ng-re186',
        category: 'moderated',
        target_isotope: 'Re-185',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 100, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Rhenium has moderate thermal capture cross-sections.',
        product_isotope: 'Re-186',
        product_half_life_days: 3.72,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'Re-187 from Re-186(n,γ)',
            'Os-186 from Re-186 decay',
            'W-186 from Re-186(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'au197-ng-au198',
        category: 'moderated',
        target_isotope: 'Au-197',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 90, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Gold-197 has well-characterized capture cross-section suitable for planning studies.',
        product_isotope: 'Au-198',
        product_half_life_days: 2.7,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: true,
        carrier_mass: null, // Default: use target mass (conservative). Can be overridden with route-specific value.
        impurity_risks: [
            'Au-199 from Au-198(n,γ)',
            'Hg-198 from Au-198 decay',
            'Pt-198 from Au-198(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    // ============================================================================
    // GENERATOR ROUTES (Parent → Daughter)
    // ============================================================================
    
    {
        id: 'mo99-tc99m-generator',
        category: 'generator',
        target_isotope: 'Mo-98',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 0.13, // Planning estimate: mid-range value for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a planning estimate for thermal neutron capture. Mo-99 production via Mo-98(n,γ) is a well-established route, but this value is for planning purposes only.',
        product_isotope: 'Mo-99',
        product_half_life_days: 2.75, // Parent half-life
        chemical_separable: true,
        carrier_added_acceptable: true,
        carrier_mass: null, // Default: use target mass (conservative). Can be overridden with route-specific value.
        impurity_risks: [
            'Mo-100 from Mo-99(n,γ)',
            'Tc-99m from Mo-99 decay (desired daughter)',
            'Tc-99g from Mo-99 decay'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'w188-re188-generator',
        category: 'generator',
        target_isotope: 'W-186',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 35, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. W-188 generator system requires long irradiation times due to parent half-life.',
        product_isotope: 'W-188',
        product_half_life_days: 69.4, // Parent half-life
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'W-189 from W-188(n,γ)',
            'Re-188 from W-188 decay (desired daughter)',
            'Os-188 from W-188 decay'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'sn117m-generator',
        category: 'generator',
        target_isotope: 'Sn-116',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 0.5, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Sn-117m has low capture cross-section, requiring high flux for practical production.',
        product_isotope: 'Sn-117m',
        product_half_life_days: 13.6,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. preferred
        impurity_risks: [
            'Sn-117g from Sn-117m decay',
            'Sn-118 from Sn-117m(n,γ)',
            'In-117 from Sn-117m decay'
        ],
        regulatory_flag: 'constrained',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    // ============================================================================
    // ALPHA / PRECURSOR ROUTES
    // ============================================================================
    
    {
        id: 'ra226-n2n-ra225-ac225',
        category: 'alpha',
        target_isotope: 'Ra-226',
        reaction: 'n,2n',
        threshold_MeV: 7.5, // Planning estimate: approximate threshold for (n,2n) on Ra-226
        nominal_sigma_barns: 0.040, // Planning estimate: conservative lower-bound at 14.1 MeV
        data_quality: 'planning-conservative',
        notes: 'Cross-section and threshold are planning estimates. This route is exploratory and subject to significant regulatory constraints. Ra-226 handling requires special facilities.',
        product_isotope: 'Ra-225', // Decays to Ac-225
        product_half_life_days: 14.9, // Ra-225 half-life
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: false, // n.c.a. required
        impurity_risks: [
            'Ac-225 from Ra-225 decay (desired product)',
            'Ra-224 from Ra-225(n,γ)',
            'Rn-221 from Ra-225 decay',
            'Fr-221 from Ac-225 decay',
            'Bi-213 from Ac-225 decay chain'
        ],
        regulatory_flag: 'exploratory', // Experimental route, requires special handling
        // D-T Generator Classification
        generator_class: 'CLASS I', // Fast-dominant (minimal moderation)
        required_spectrum: 'fast', // Fast neutron spectrum required
        moderator_complexity: 'low', // Minimal moderation needed
        shielding_complexity: 'high' // High shielding required for alpha emitters
    },
    
    // ============================================================================
    // INDUSTRIAL ROUTES
    // ============================================================================
    
    {
        id: 'ir191-ng-ir192',
        category: 'industrial',
        target_isotope: 'Ir-191',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 850, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Iridium-191 has one of the highest thermal capture cross-sections, enabling efficient production.',
        product_isotope: 'Ir-192',
        product_half_life_days: 73.8,
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: true,
        carrier_mass: null, // Default: use target mass (conservative). Can be overridden with route-specific value.
        impurity_risks: [
            'Ir-192m from Ir-191(n,γ)',
            'Ir-193 from Ir-192(n,γ)',
            'Os-192 from Ir-192 decay',
            'Pt-192 from Ir-192(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    },
    
    {
        id: 'co59-ng-co60',
        category: 'industrial',
        target_isotope: 'Co-59',
        reaction: 'n,γ',
        threshold_MeV: null,
        nominal_sigma_barns: 33, // Planning estimate: conservative lower-bound for thermal neutrons
        data_quality: 'planning-conservative',
        notes: 'Cross-section is a conservative planning estimate for thermal neutron capture. Co-60 production is well-established, but this value is for planning purposes only.',
        product_isotope: 'Co-60',
        product_half_life_days: 1925.0, // ~5.27 years
        sigma_product_burn_cm2: null, // Optional microscopic cross-section for product isotope burn-up during irradiation (cm², already converted)
        chemical_separable: true,
        carrier_added_acceptable: true,
        carrier_mass: null, // Default: use target mass (conservative). Can be overridden with route-specific value.
        impurity_risks: [
            'Co-60m from Co-59(n,γ)',
            'Ni-60 from Co-60 decay',
            'Fe-60 from Co-60(n,γ)'
        ],
        regulatory_flag: 'standard',
        // D-T Generator Classification
        generator_class: 'CLASS III', // Fully moderated (reactor-like)
        required_spectrum: 'thermal', // Thermal neutron spectrum required
        moderator_complexity: 'high', // Significant moderation required
        shielding_complexity: 'low' // Lower energy neutrons, less shielding needed
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ISOTOPE_ROUTES };
}

