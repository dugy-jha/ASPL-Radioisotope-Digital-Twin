/**
 * nuclearData.js
 * 
 * Central repository for nuclear data constants and lookups.
 * Extracted from routeEvaluator.js for better modularity.
 */

export const NuclearData = {
    // Natural isotopic abundances (fractions) - planning-grade values
    // Source: NIST Standard Reference Database 144 (2023)
    isotopicAbundances: {
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
    },

    /**
     * Get natural isotopic abundance for an isotope
     * 
     * @param {string} elementSymbol - Element symbol (e.g., 'Zn', 'Lu')
     * @param {number} massNumber - Mass number (e.g., 64, 67)
     * @returns {number|null} Natural isotopic abundance (fraction 0-1), or null if unknown
     */
    getIsotopicAbundance: function(elementSymbol, massNumber) {
        if (!this.isotopicAbundances[elementSymbol]) {
            return null;
        }

        const abundances = this.isotopicAbundances[elementSymbol];
        return abundances[massNumber] !== undefined ? abundances[massNumber] : null;
    }
};
