/**
 * nuclearData.js
 * 
 * Central repository for nuclear data constants and lookups.
 * Natural isotopic abundances (NIST 2023)
 */

export const NuclearData = {
    // Natural isotopic abundances (fractions)
    isotopicAbundances: {
        'Zn': { 64: 0.492, 66: 0.278, 67: 0.041, 68: 0.188 },
        'Ti': { 46: 0.0825, 47: 0.0744, 48: 0.7372, 49: 0.0541, 50: 0.0518 },
        'Mo': { 92: 0.1484, 94: 0.0925, 95: 0.1592, 96: 0.1668, 97: 0.0955, 98: 0.2413, 100: 0.0963 },
        'Lu': { 175: 0.9741, 176: 0.0259 },
        'Ho': { 165: 1.0 },
        'Sm': { 144: 0.0307, 147: 0.1499, 148: 0.1124, 149: 0.1382, 150: 0.0738, 152: 0.2675, 154: 0.2275 },
        'Dy': { 156: 0.0006, 158: 0.0010, 160: 0.0234, 161: 0.1889, 162: 0.2548, 163: 0.2486, 164: 0.2826 },
        'Re': { 185: 0.3740, 187: 0.6260 },
        'Au': { 197: 1.0 },
        'W': { 180: 0.0012, 182: 0.2650, 183: 0.1431, 184: 0.3064, 186: 0.2843 },
        'Sn': { 112: 0.0097, 114: 0.0066, 115: 0.0034, 116: 0.1454, 117: 0.0768, 118: 0.2422, 119: 0.0859, 120: 0.3259, 122: 0.0463, 124: 0.0579 },
        'Ir': { 191: 0.373, 193: 0.627 },
        'Co': { 59: 1.0 },
        'Cu': { 63: 0.6915, 65: 0.3085 },
        'Sc': { 45: 1.0 }
    },

    /**
     * Get natural isotopic abundance
     * @param {string} elementSymbol 
     * @param {number} massNumber 
     * @returns {number|null} Abundance fraction or null
     */
    getIsotopicAbundance: function (elementSymbol, massNumber) {
        if (!this.isotopicAbundances[elementSymbol]) return null;
        const abundances = this.isotopicAbundances[elementSymbol];
        return abundances[massNumber] !== undefined ? abundances[massNumber] : null;
    }
};
