/**
 * routes.js
 * 
 * Isotope Route Registry
 * 
 * Defines radioisotope production routes with physical and operational parameters.
 * These are scenario definitions for planning purposes, not regulatory approvals.
 */

const IsotopeRouteRegistry = {
    /**
     * Registry of isotope production routes
     * Each route defines physical parameters and operational characteristics
     */
    routes: [
        {
            target_isotope: 'Lu-176',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 2090, // barns (thermal)
            product_isotope: 'Lu-177',
            product_half_life_days: 6.647,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. preferred
            known_impurity_risks: [
                'Lu-177m (metastable state)',
                'Lu-178 from Lu-177(n,γ)',
                'Hf-177 from Lu-177 decay'
            ]
        },
        {
            target_isotope: 'Mo-98',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 0.13, // barns (thermal)
            product_isotope: 'Mo-99',
            product_half_life_days: 2.75,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'Mo-100 from Mo-99(n,γ)',
                'Tc-99m from Mo-99 decay (desired daughter)',
                'Tc-99g from Mo-99 decay'
            ]
        },
        {
            target_isotope: 'Y-89',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 1.28, // barns (thermal)
            product_isotope: 'Y-90',
            product_half_life_days: 2.67,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. required
            known_impurity_risks: [
                'Y-91 from Y-90(n,γ)',
                'Sr-90 from Y-90 decay (daughter)'
            ]
        },
        {
            target_isotope: 'W-186',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 37.9, // barns (thermal)
            product_isotope: 'W-187',
            product_half_life_days: 0.94,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'W-188 from W-187(n,γ)',
                'Re-187 from W-187 decay'
            ]
        },
        {
            target_isotope: 'Cu-63',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 4.5, // barns (thermal)
            product_isotope: 'Cu-64',
            product_half_life_days: 0.53,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. preferred
            known_impurity_risks: [
                'Cu-65 from Cu-64(n,γ)',
                'Ni-64 from Cu-64 decay'
            ]
        },
        {
            target_isotope: 'Ti-50',
            reaction_type: 'n,p',
            threshold_energy: 0.0, // Very low threshold
            cross_section_14_1_MeV: 15.0, // mb (millibarns) at 14.1 MeV
            cross_section_thermal: null, // Not applicable
            product_isotope: 'Sc-50',
            product_half_life_days: 0.0007, // Very short
            chemical_separability: true,
            carrier_added_acceptable: false,
            known_impurity_risks: [
                'Sc-46 from Sc-50(n,γ)',
                'Ti-51 from Ti-50(n,γ)Ti-51 decay'
            ]
        },
        {
            target_isotope: 'Ni-58',
            reaction_type: 'n,p',
            threshold_energy: 0.0, // Very low threshold
            cross_section_14_1_MeV: 20.0, // mb at 14.1 MeV
            cross_section_thermal: null, // Not applicable
            product_isotope: 'Co-58',
            product_half_life_days: 70.8,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'Co-60 from Co-58(n,γ)',
                'Ni-59 from Ni-58(n,γ)',
                'Fe-58 from Co-58 decay'
            ]
        },
        {
            target_isotope: 'Mo-100',
            reaction_type: 'n,2n',
            threshold_energy: 8.0, // MeV
            cross_section_14_1_MeV: 500.0, // mb at 14.1 MeV
            cross_section_thermal: null, // Not applicable
            product_isotope: 'Mo-99',
            product_half_life_days: 2.75,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'Mo-98 from Mo-99(n,2n)',
                'Tc-99m from Mo-99 decay (desired daughter)',
                'Mo-100 from Mo-99(n,γ)'
            ]
        },
        {
            target_isotope: 'Zn-68',
            reaction_type: 'n,p',
            threshold_energy: 0.0, // Very low threshold
            cross_section_14_1_MeV: 25.0, // mb at 14.1 MeV
            cross_section_thermal: null, // Not applicable
            product_isotope: 'Cu-67',
            product_half_life_days: 2.58,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. preferred
            known_impurity_risks: [
                'Cu-64 from Cu-67(n,γ)',
                'Zn-67 from Zn-68(n,γ)',
                'Ni-67 from Cu-67 decay'
            ]
        },
        {
            target_isotope: 'Sr-88',
            reaction_type: 'n,gamma',
            threshold_energy: 0, // Thermal neutron reaction
            cross_section_14_1_MeV: null, // Not applicable for thermal
            cross_section_thermal: 0.058, // barns (thermal)
            product_isotope: 'Sr-89',
            product_half_life_days: 50.5,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'Sr-90 from Sr-89(n,γ)',
                'Y-89 from Sr-89 decay'
            ]
        },
        {
            target_isotope: 'Bi-209',
            reaction_type: 'alpha',
            threshold_energy: null, // Not applicable
            cross_section_14_1_MeV: null, // Not applicable
            cross_section_thermal: null, // Not applicable
            product_isotope: 'At-211',
            product_half_life_days: 0.0035,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. required
            known_impurity_risks: [
                'At-210 from At-211 decay',
                'Po-211 from At-211 decay',
                'Bi-210 from Bi-209(α,2n) side reaction'
            ]
        },
        {
            target_isotope: 'Tl-203',
            reaction_type: 'alpha',
            threshold_energy: null,
            cross_section_14_1_MeV: null,
            cross_section_thermal: null,
            product_isotope: 'Bi-211',
            product_half_life_days: 0.19,
            chemical_separability: true,
            carrier_added_acceptable: false, // n.c.a. required
            known_impurity_risks: [
                'Bi-210 from Bi-211 decay',
                'Tl-204 from Tl-203 side reactions',
                'Pb-207 from Bi-211 decay'
            ]
        },
        {
            target_isotope: 'Ho-165',
            reaction_type: 'alpha',
            threshold_energy: null,
            cross_section_14_1_MeV: null,
            cross_section_thermal: null,
            product_isotope: 'Tm-169',
            product_half_life_days: 128.6,
            chemical_separability: true,
            carrier_added_acceptable: true,
            known_impurity_risks: [
                'Tm-170 from Tm-169 side reactions',
                'Er-169 from Tm-169 decay',
                'Ho-166 from Ho-165 side reactions'
            ]
        }
    ],

    /**
     * Get route by target isotope
     * @param {string} targetIsotope - Target isotope (e.g., 'Lu-176')
     * @returns {Object|null} Route object or null if not found
     */
    getRouteByTarget: function(targetIsotope) {
        return this.routes.find(route => route.target_isotope === targetIsotope) || null;
    },

    /**
     * Get route by product isotope
     * @param {string} productIsotope - Product isotope (e.g., 'Lu-177')
     * @returns {Array} Array of route objects that produce this isotope
     */
    getRoutesByProduct: function(productIsotope) {
        return this.routes.filter(route => route.product_isotope === productIsotope);
    },

    /**
     * Get routes by reaction type
     * @param {string} reactionType - Reaction type ('n,gamma', 'n,p', 'n,2n', 'alpha')
     * @returns {Array} Array of route objects with this reaction type
     */
    getRoutesByReactionType: function(reactionType) {
        return this.routes.filter(route => route.reaction_type === reactionType);
    },

    /**
     * Get fast neutron routes (n,p and n,2n reactions)
     * @returns {Array} Array of fast neutron route objects
     */
    getFastNeutronRoutes: function() {
        return this.routes.filter(route => 
            route.reaction_type === 'n,p' || route.reaction_type === 'n,2n'
        );
    },

    /**
     * Get moderated capture routes (thermal n,gamma reactions)
     * @returns {Array} Array of moderated capture route objects
     */
    getModeratedCaptureRoutes: function() {
        return this.routes.filter(route => route.reaction_type === 'n,gamma');
    },

    /**
     * Get alpha precursor routes
     * @returns {Array} Array of alpha particle route objects
     */
    getAlphaPrecursorRoutes: function() {
        return this.routes.filter(route => route.reaction_type === 'alpha');
    },

    /**
     * Get all routes
     * @returns {Array} Array of all route objects
     */
    getAllRoutes: function() {
        return this.routes;
    }
};

