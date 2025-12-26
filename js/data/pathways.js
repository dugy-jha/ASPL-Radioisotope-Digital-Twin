/**
 * pathways.js
 * 
 * Unified Isotope Production Pathways Registry.
 * Consolidates physics parameters and impurity risks.
 */

export const PathwaysRegistry = [
    // --- THERAPEUTIC / THERANOSTIC ---

    {
        id: "LU177_NCA",
        category: "Therapy",
        name: "Lu-177 (n.c.a.)",
        target: { isotope: "Lu-176", reaction: "(n,γ)", spectrum: "thermal+epithermal" },
        product: { isotope: "Lu-177", halfLife: 6.647 }, // days
        crossSection: { thermal: 2090, burnup: 2.0e-21 }, // barns, cm2
        chemistry: { yield: 0.9, separation: "direct" },
        impurities: ["Lu-177m", "Lu-178"],
        warnings: ["Resonance Dominated", "Product Burnup Critical"]
    },
    {
        id: "LU177_CA",
        // Note: Legacy route implied, added for completeness or if needed, 
        // but arguably LU177_NCA covers the main interest. 
        // Kept simple for now.
        category: "Therapy",
        name: "Lu-177 (c.a.)",
        // carrier-added usually means lower specific activity, same reaction physically
        target: { isotope: "Lu-176", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Lu-177", halfLife: 6.647 },
        crossSection: { thermal: 2090 },
        chemistry: { yield: 0.95 },
        impurities: []
    },
    {
        id: "HO166",
        category: "Therapy",
        name: "Ho-166",
        target: { isotope: "Ho-165", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Ho-166", halfLife: 1.117 }, // 26.8 hrs ~ 1.12 days
        crossSection: { thermal: 60 }, // barns
        chemistry: { yield: 0.95, mode: "microsphere" },
        impurities: []
    },
    {
        id: "SM153",
        category: "Therapy",
        name: "Sm-153",
        target: { isotope: "Sm-152", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Sm-153", halfLife: 1.93 },
        crossSection: { thermal: 206 },
        chemistry: { yield: 0.9 },
        impurities: ["Eu-154 (long-lived)"]
    },

    // --- GENERATORS ---

    {
        id: "MO99_TC99M",
        category: "Generator",
        name: "Mo-99 / Tc-99m",
        target: { isotope: "Mo-98", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Mo-99", halfLife: 2.75 },
        crossSection: { thermal: 0.13 },
        chemistry: { yield: 0.85, mode: "generator" },
        impurities: ["Mo-100", "Tc-99g"],
        warnings: ["Generator Decay Sensitive"]
    },
    {
        id: "W188_RE188",
        category: "Generator",
        name: "W-188 / Re-188",
        target: { isotope: "W-186", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "W-188", halfLife: 69.4 },
        crossSection: { thermal: 37.9 }, // 37.9 barns
        chemistry: { yield: 0.85 },
        impurities: ["Re-187"]
    },

    // --- DIAGNOSTIC / OTHER ---

    {
        id: "CU64",
        category: "Diagnostic",
        name: "Cu-64",
        target: { isotope: "Cu-63", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Cu-64", halfLife: 0.53 },
        crossSection: { thermal: 4.5 },
        chemistry: { yield: 0.9 },
        impurities: ["Cu-65"]
    },
    {
        id: "Y90",
        category: "Therapy",
        name: "Y-90",
        target: { isotope: "Y-89", reaction: "(n,γ)", spectrum: "thermal" },
        product: { isotope: "Y-90", halfLife: 2.67 },
        crossSection: { thermal: 1.28 },
        chemistry: { yield: 0.9 },
        impurities: ["Y-91", "Sr-90"]
    },
    {
        id: "I125",
        category: "Brachytherapy",
        name: "I-125",
        target: { isotope: "Xe-124", reaction: "(n,γ) -> decay", spectrum: "thermal" },
        product: { isotope: "I-125", halfLife: 59.4 },
        crossSection: { thermal: 165 }, // Xe-124 section
        chemistry: { yield: 0.85 },
        impurities: ["I-126"]
    },

    // --- FAST NEUTRON ---

    {
        id: "CU67_FAST",
        category: "Theranostic (Fast)",
        name: "Cu-67 (Fast n,p)",
        target: { isotope: "Zn-67", reaction: "(n,p)", spectrum: "fast" },
        product: { isotope: "Cu-67", halfLife: 2.58 },
        crossSection: { fast_14MeV: 0.100 }, // ~100 mb
        chemistry: { yield: 0.7, mode: "difficult" },
        warnings: ["Fast Neutron Only", "Recoil Losses"]
    },
    {
        id: "SC47_FAST",
        category: "Theranostic (Fast)",
        name: "Sc-47 (Fast n,p)",
        target: { isotope: "Ti-47", reaction: "(n,p)", spectrum: "fast" },
        product: { isotope: "Sc-47", halfLife: 3.35 },
        crossSection: { fast_14MeV: 0.080 }, // ~80 mb
        chemistry: { yield: 0.8 },
        warnings: ["Fast Neutron Only"]
    }
];

// Helper to get route by ID
export function getRouteById(id) {
    return PathwaysRegistry.find(p => p.id === id);
}
