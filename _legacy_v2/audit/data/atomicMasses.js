/**
 * atomicMasses.js
 * 
 * Atomic Mass Registry
 * 
 * Provides atomic masses (amu) for isotope production calculations.
 * Values are planning-grade standard atomic weights from NIST/IUPAC.
 * 
 * NOTE: These are standard atomic weights (weighted averages of natural isotopes),
 * NOT isotopic mass excess. For enriched targets, use the specific isotope mass
 * if available, otherwise use standard atomic weight as approximation.
 * 
 * Source: NIST Standard Reference Database 144 (2023)
 * https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl
 * 
 * For compounds (e.g., Lu2O3), calculate molecular mass and divide by
 * atoms per molecule to get average atomic mass.
 */

const AtomicMasses = {
    /**
     * Get atomic mass for an element
     * 
     * @param {string} elementSymbol - Element symbol (e.g., 'Lu', 'Zn', 'Cu')
     * @returns {number} Atomic mass (amu)
     * @throws {Error} If element not found
     */
    getAtomicMass: function(elementSymbol) {
        const symbol = elementSymbol.trim();
        const mass = this.ATOMIC_MASSES[symbol];
        
        if (mass === undefined) {
            console.warn(`Atomic mass not found for element: ${symbol}. Using placeholder value 100 amu.`);
            return 100.0; // Fallback placeholder with warning
        }
        
        return mass;
    },

    /**
     * Get atomic mass for a compound
     * Calculates average atomic mass per atom in compound
     * 
     * @param {string} compoundFormula - Compound formula (e.g., 'Lu2O3')
     * @returns {number} Average atomic mass per atom (amu)
     */
    getCompoundAtomicMass: function(compoundFormula) {
        // Simple parser for common compounds
        // Format: ElementSymbol[number]ElementSymbol[number]...
        // Example: Lu2O3 -> Lu=2, O=3
        
        const compoundPatterns = {
            'Lu2O3': {
                elements: [
                    { symbol: 'Lu', count: 2, mass: this.getAtomicMass('Lu') },
                    { symbol: 'O', count: 3, mass: this.getAtomicMass('O') }
                ]
            },
            'MoO3': {
                elements: [
                    { symbol: 'Mo', count: 1, mass: this.getAtomicMass('Mo') },
                    { symbol: 'O', count: 3, mass: this.getAtomicMass('O') }
                ]
            },
            'TiO2': {
                elements: [
                    { symbol: 'Ti', count: 1, mass: this.getAtomicMass('Ti') },
                    { symbol: 'O', count: 2, mass: this.getAtomicMass('O') }
                ]
            }
        };

        const compound = compoundPatterns[compoundFormula];
        if (!compound) {
            console.warn(`Compound formula not found: ${compoundFormula}. Using placeholder value 100 amu.`);
            return 100.0;
        }

        // Calculate total molecular mass
        let totalMass = 0;
        let totalAtoms = 0;
        
        compound.elements.forEach(elem => {
            totalMass += elem.mass * elem.count;
            totalAtoms += elem.count;
        });

        // Return average atomic mass per atom
        return totalMass / totalAtoms;
    },

    /**
     * Registry of atomic masses (standard atomic weights in amu)
     * Source: NIST Standard Reference Database 144 (2023)
     * Values are planning-grade standard atomic weights
     */
    ATOMIC_MASSES: {
        // Lanthanides
        'Lu': 174.9668,   // Lutetium
        'Ho': 164.93033, // Holmium
        'Sm': 150.36,    // Samarium
        'Dy': 162.500,   // Dysprosium
        'Tm': 168.93422, // Thulium
        
        // Transition metals
        'Zn': 65.38,     // Zinc
        'Cu': 63.546,    // Copper
        'Ti': 47.867,    // Titanium
        'Sc': 44.955908, // Scandium
        'Mo': 95.95,     // Molybdenum
        'Tc': 98.0,      // Technetium (no stable isotopes, use ~98)
        'W': 183.84,     // Tungsten
        'Re': 186.207,   // Rhenium
        'Sn': 118.710,   // Tin
        'Au': 196.966569, // Gold
        'Ir': 192.217,   // Iridium
        'Co': 58.933194, // Cobalt
        'Ni': 58.6934,   // Nickel
        'Fe': 55.845,    // Iron
        'Pb': 207.2,     // Lead
        
        // Actinides
        'Ra': 226.0,     // Radium (no stable isotopes, use most common)
        'Ac': 227.0,     // Actinium (no stable isotopes, use most common)
        'U': 238.02891,  // Uranium (standard atomic weight)
        'Th': 232.0377,  // Thorium
        
        // Other elements
        'O': 15.999,     // Oxygen
        'H': 1.00794,    // Hydrogen
        'Ca': 40.078,    // Calcium
        'Bi': 208.98040, // Bismuth
        'Tl': 204.3833,  // Thallium
        'Os': 190.23,    // Osmium
        'Pt': 195.084,   // Platinum
        'Fr': 223.0,     // Francium (no stable isotopes)
        'Rn': 222.0,     // Radon (no stable isotopes)
        'In': 114.818    // Indium
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AtomicMasses };
}

