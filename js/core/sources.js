/**
 * sources.js
 * 
 * Neutron Source Models (SyRD-03 / ConOps).
 * Converts engineering parameters (MW, geometry) into effective neutron flux.
 */

export const Sources = {

    TYPES: {
        FIXED_FLUX: 'fixed_flux',
        DT_GENERATOR: 'dt_generator',
        GDT_TRAP: 'gdt_trap'
    },

    /**
     * Calculate Effective Flux based on Source Configuration
     * @param {string} type - Source type (fixed_flux, dt_generator, gdt_trap)
     * @param {Object} params - Source parameters
     * @param {number} dist_cm - Distance from source to target (cm)
     */
    calculateFlux: function (type, params, dist_cm = 10) {
        if (type === this.TYPES.FIXED_FLUX) {
            return params.flux || 0;
        }

        if (type === this.TYPES.DT_GENERATOR) {
            return this.dtGeneratorFlux(params, dist_cm);
        }

        if (type === this.TYPES.GDT_TRAP) {
            return this.gdtTrapFlux(params, dist_cm);
        }

        return 0;
    },

    /**
     * D-T Neutron Generator Model
     * Point source approximation (valid for dist >> source_radius)
     * Yield ~ 1e14 n/s is high end, usually 1e8 - 1e12 n/s.
     */
    dtGeneratorFlux: function (params, dist_cm) {
        const { yieldRate_n_s = 1e10 } = params;

        // Flux = Yield / (4 * PI * r^2)
        // Simple point source attenuation
        if (dist_cm <= 0.1) dist_cm = 0.1; // Prevent singularity

        const area = 4 * Math.PI * Math.pow(dist_cm, 2);
        return yieldRate_n_s / area;
    },

    /**
     * Gas Dynamic Trap (GDT) Model
     * Linear source approximation or simplified volumetric.
     * Based on legacy gdtSource.js logic.
     */
    gdtTrapFlux: function (params, dist_cm) {
        // Engineering params
        const {
            fusionPower_MW = 1,
            neutronsPerMW = 3.55e17, // Standard D-T fusion (approx 17.6 MeV/n => ~3.55e17 n/J? 1W=1J/s. 14MeV/n = 2.24e-12 J. 1/2.24e-12 = 4.46e11 n/s/W = 4.46e17 n/s/MW. Close enough.)
            dutyCycle = 1.0,
            availability = 0.9,
            wallLoadingLimit_MWm2 = 2.0 // Constraint
        } = params;

        // 1. Calculate Neutron Yield
        const yield_n_s = fusionPower_MW * neutronsPerMW;

        // 2. Average over time (Availability * Duty)
        // Note: For physics Activation, we usually use Peak Flux for saturation, 
        // and handle downtime via duty cycle factors in the Bateman eq or post-process.
        // However, for "Effective Flux" in simple models, we often derate.
        // Let's return Peak Flux for the core calc, but export average yield for Manufacturing.

        // Simple geometry (Cylindrical approx): Flux ~ Yield / Area
        // Assume Source is a line source of length L ~ 10m? 
        // Or generic "close proximity" approximation.
        // Legacy code didn't specify geometry, just "Effective Yield".
        // Let's implement a standard cylindrical fall-off: Flux = Yield / (2 * PI * r * L)

        const L_cm = 500; // 5 meters effective length assumption
        const r_cm = Math.max(dist_cm, 5); // Minimum radius (wall)

        const area = 2 * Math.PI * r_cm * L_cm;
        const flux_peak = yield_n_s / area;

        // Apply Limiters?
        // If Wall Loading is exceeded, we might need to assume the machine is dialed back.
        // But usually that's a warning, not a hard clamp in sizing.

        return flux_peak;
    },

    /**
     * Get Defaults for UI
     */
    getDefaults: function (type) {
        if (type === this.TYPES.DT_GENERATOR) {
            return { yieldRate_n_s: 1e12 };
        }
        if (type === this.TYPES.GDT_TRAP) {
            return {
                fusionPower_MW: 2,
                neutronsPerMW: 4.4e17,
                dutyCycle: 1.0,
                availability: 0.9
            };
        }
        return {};
    }
};
