/**
 * CANONICAL ISOTOPE PATHWAYS REGISTRY
 * ----------------------------------
 * Planning-grade, physics-first pathway definitions.
 * DO NOT modify without physics audit.
 * Version: v2.2.1
 */

const ISOTOPE_PATHWAYS = [

/* =========================
 * GENERATOR SYSTEMS
 * ========================= */

{
  id: "MO99_TC99M_GENERATOR",
  category: "generator",
  primary_product: "Tc-99m",
  parents: ["Mo-99"],

  production: {
    target: "Mo-98",
    reaction: "(n,γ)",
    spectrum: "thermal",
    sigma_cm2: 1.3e-25,
    self_shielding: true,
    burnup_parent: true,
    burnup_product: false
  },

  decay_chain: [
    { from: "Mo-99", to: "Tc-99m", branching: 1.0 }
  ],

  chemistry: {
    mode: "generator",
    default_yield: 0.85,
    delay_sensitive: true
  },

  warnings: [
    "GENERATOR_DELAY_SENSITIVE",
    "DAUGHTER_DECAY_DURING_PROCESSING"
  ]
},

{
  id: "W188_RE188_GENERATOR",
  category: "generator",
  primary_product: "Re-188",
  parents: ["W-188"],

  production: {
    target: "W-186",
    reaction: "(n,γ)",
    spectrum: "thermal",
    sigma_cm2: 3.7e-26,
    self_shielding: true,
    burnup_parent: true
  },

  decay_chain: [
    { from: "W-188", to: "Re-188", branching: 1.0 }
  ],

  chemistry: {
    mode: "generator",
    default_yield: 0.85
  },

  warnings: ["GENERATOR_DELAY_SENSITIVE"]
},

/* =========================
 * THERAPEUTIC n,γ ISOTOPES
 * ========================= */

{
  id: "LU177_NCA",
  category: "therapy",
  primary_product: "Lu-177",

  production: {
    target: "Lu-176",
    reaction: "(n,γ)",
    spectrum: "thermal+epithermal",
    sigma_cm2: 2.09e-21,
    resonance_dominated: true,
    self_shielding: true,
    burnup_product: true,
    sigma_product_burn_cm2: 2.0e-21
  },

  chemistry: {
    mode: "direct",
    default_yield: 0.9
  },

  warnings: [
    "RESONANCE_DOMINATED",
    "PRODUCT_BURNUP_CRITICAL",
    "THICK_TARGET_SENSITIVITY"
  ]
},

{
  id: "HO166",
  category: "therapy",
  primary_product: "Ho-166",

  production: {
    target: "Ho-165",
    reaction: "(n,γ)",
    spectrum: "thermal",
    sigma_cm2: 6.0e-23,
    self_shielding: true
  },

  chemistry: {
    mode: "microsphere",
    carrier_added_ok: true
  },

  warnings: ["CARRIER_ADDED_ACCEPTABLE"]
},

/* =========================
 * FAST NEUTRON (D–T ADVANTAGE)
 * ========================= */

{
  id: "CU67_FAST",
  category: "theranostic",
  primary_product: "Cu-67",

  production: {
    target: "Zn-67",
    reaction: "(n,p)",
    spectrum: "fast",
    threshold_MeV: 2.0,
    sigma_cm2_14MeV: 1.0e-25,
    recoil_losses: true
  },

  chemistry: {
    mode: "difficult",
    default_yield: 0.7
  },

  warnings: [
    "FAST_ONLY",
    "RECOIL_LOSSES",
    "CHALLENGING_CHEMISTRY"
  ]
},

{
  id: "SC47_FAST",
  category: "theranostic",
  primary_product: "Sc-47",

  production: {
    target: "Ti-47",
    reaction: "(n,p)",
    spectrum: "fast",
    threshold_MeV: 3.0,
    sigma_cm2_14MeV: 8.0e-26
  },

  warnings: ["FAST_ONLY"]
},

/* =========================
 * FAST Mo-99 ROUTE
 * ========================= */

{
  id: "MO99_FAST",
  category: "industrial",
  primary_product: "Mo-99",

  production: {
    target: "Mo-100",
    reaction: "(n,2n)",
    spectrum: "fast",
    threshold_MeV: 8.0,
    sigma_cm2_14MeV: 1.5e-24
  },

  warnings: [
    "LOW_SPECIFIC_ACTIVITY",
    "NOT_REACTOR_EQUIVALENT"
  ]
},

/* =========================
 * ACTINIDE / STRATEGIC
 * ========================= */

{
  id: "TH232_U233",
  category: "actinide",
  primary_product: "U-233",

  production: {
    target: "Th-232",
    reaction: "(n,γ)",
    spectrum: "thermal",
    sigma_cm2: 7.4e-26,
    self_shielding: true
  },

  decay_chain: [
    { from: "Th-233", to: "Pa-233", branching: 1.0 },
    { from: "Pa-233", to: "U-233", branching: 1.0 }
  ],

  warnings: [
    "ACTINIDE_HANDLING",
    "REGULATORY_RESTRICTED",
    "NOT_MEDICAL"
  ]
},

{
  id: "U238_PU239",
  category: "actinide",
  primary_product: "Pu-239",

  production: {
    target: "U-238",
    reaction: "(n,γ)",
    spectrum: "fast+thermal",
    sigma_cm2: 2.7e-26
  },

  decay_chain: [
    { from: "U-239", to: "Np-239", branching: 1.0 },
    { from: "Np-239", to: "Pu-239", branching: 1.0 }
  ],

  warnings: [
    "WEAPONS_SENSITIVE",
    "NOT_FOR_COMPARATIVE_OPTIMIZATION",
    "EXPLORATORY_ONLY"
  ]
}

];

// ============================================================================
// AUDIT LOCK: Recursive freeze to prevent accidental physics edits
// ============================================================================

/**
 * Recursively freeze an object or array to prevent mutations
 * @param {*} obj - Object or array to freeze
 * @returns {*} - Frozen object or array
 */
function deepFreeze(obj) {
    // Retrieve the property names defined on obj
    const propNames = Object.getOwnPropertyNames(obj);
    
    // Freeze properties before freezing self
    propNames.forEach(name => {
        const value = obj[name];
        
        // Freeze nested objects and arrays recursively
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    });
    
    // Freeze self
    return Object.freeze(obj);
}

/**
 * Create a proxy that throws errors on mutation attempts
 * @param {*} obj - Object to protect
 * @returns {Proxy} - Protected proxy object
 */
function createFrozenProxy(obj) {
    return new Proxy(obj, {
        set(target, property, value) {
            throw new Error('Isotope pathway registry is frozen (audit lock).');
        },
        deleteProperty(target, property) {
            throw new Error('Isotope pathway registry is frozen (audit lock).');
        },
        defineProperty(target, property, descriptor) {
            throw new Error('Isotope pathway registry is frozen (audit lock).');
        },
        setPrototypeOf(target, prototype) {
            throw new Error('Isotope pathway registry is frozen (audit lock).');
        }
    });
}

// Recursively freeze the entire pathways registry
const FROZEN_PATHWAYS = deepFreeze(ISOTOPE_PATHWAYS);

// Wrap in proxy to throw errors on mutation attempts
const PROTECTED_PATHWAYS = createFrozenProxy(FROZEN_PATHWAYS);

// Export for browser compatibility (global variable)
if (typeof window !== 'undefined') {
    window.ISOTOPE_PATHWAYS = PROTECTED_PATHWAYS;
}

// Export for CommonJS (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ISOTOPE_PATHWAYS: PROTECTED_PATHWAYS };
}

