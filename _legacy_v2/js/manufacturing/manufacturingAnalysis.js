/*
MANUFACTURING ANALYSIS MODULE - PLANNING-GRADE
This module provides engineering, operations, cost, waste, and energy analysis
for radioisotope manufacturing facilities.
It does NOT replace detailed engineering design or economic analysis.
All outputs are planning-grade estimates only.
*/

/**
 * Manufacturing Analysis Engine
 * 
 * Provides comprehensive analysis of radioisotope manufacturing including:
 * - Engineering constraints (thermal, damage, facility requirements)
 * - Operations (scheduling, uptime, maintenance windows)
 * - Cost analysis (capital, operational, per-dose)
 * - Waste stream management (radioactive waste, disposal)
 * - Electricity consumption
 */
const ManufacturingAnalysis = {
    /**
     * Engineering Analysis
     * 
     * @param {Object} params - Engineering parameters
     * @param {number} params.beamPower_MW - Beam power (MW)
     * @param {number} params.coolantFlow_kg_s - Coolant flow rate (kg/s)
     * @param {number} params.heatCapacity_J_kgK - Coolant heat capacity (J/(kg·K))
     * @param {number} params.maxDeltaT_K - Maximum temperature rise (K)
     * @param {number} params.dpaRate_dpa_s - Damage accumulation rate (DPA/s)
     * @param {number} params.irradiationTime_days - Irradiation duration (days)
     * @param {number} params.maxDPA - Maximum DPA limit
     * @returns {Object} Engineering analysis results
     */
    engineeringAnalysis: function(params) {
        const {
            beamPower_MW = 0,
            coolantFlow_kg_s = 0.1,
            heatCapacity_J_kgK = 4184,
            maxDeltaT_K = 50,
            dpaRate_dpa_s = 1e-8,
            irradiationTime_days = 7,
            maxDPA = 10
        } = params;

        // Thermal analysis
        const deltaT_K = beamPower_MW * 1e6 / (coolantFlow_kg_s * heatCapacity_J_kgK);
        const thermalDerate = deltaT_K > maxDeltaT_K ? maxDeltaT_K / deltaT_K : 1.0;
        const thermalStatus = deltaT_K > maxDeltaT_K ? 'exceeded' : 'within_limit';

        // Damage analysis
        const totalDPA = dpaRate_dpa_s * irradiationTime_days * 86400;
        const damageDerate = totalDPA > maxDPA ? maxDPA / totalDPA : 1.0;
        const damageStatus = totalDPA > maxDPA ? 'exceeded' : 'within_limit';

        // Facility requirements (planning-grade estimates)
        const targetArea_m2 = Math.PI * 0.01 * 0.01; // Assume 1cm radius target
        const facilityFootprint_m2 = 50; // Planning estimate
        const shieldingThickness_m = 1.5; // Planning estimate for high-flux source

        return {
            thermal: {
                deltaT_K,
                maxDeltaT_K,
                thermalDerate,
                status: thermalStatus,
                coolingRequired_MW: beamPower_MW * (1 - thermalDerate)
            },
            damage: {
                totalDPA,
                maxDPA,
                damageDerate,
                status: damageStatus,
                remainingLife_fraction: 1 - (totalDPA / maxDPA)
            },
            facility: {
                targetArea_m2,
                facilityFootprint_m2,
                shieldingThickness_m,
                estimatedConstructionCost_USD: facilityFootprint_m2 * 5000 // Planning estimate $/m²
            }
        };
    },

    /**
     * Operations Analysis
     * 
     * @param {Object} params - Operations parameters
     * @param {number} params.irradiationTime_days - Irradiation duration (days)
     * @param {number} params.processingTime_hours - Post-EOB processing time (hours)
     * @param {number} params.transportTime_hours - Transport time (hours)
     * @param {number} params.sourceUptime - Source availability (0-1)
     * @param {number} params.maintenanceWindow_days - Maintenance window per cycle (days)
     * @param {number} params.targetsPerBatch - Number of targets per batch
     * @returns {Object} Operations analysis results
     */
    operationsAnalysis: function(params) {
        const {
            irradiationTime_days = 7,
            processingTime_hours = 24,
            transportTime_hours = 48,
            sourceUptime = 0.85,
            maintenanceWindow_days = 1,
            targetsPerBatch = 1
        } = params;

        const totalCycleTime_days = irradiationTime_days + 
                                    (processingTime_hours / 24) + 
                                    (transportTime_hours / 24) + 
                                    maintenanceWindow_days;

        const batchesPerYear = (365 * sourceUptime) / totalCycleTime_days;
        const effectiveUptime = sourceUptime * (irradiationTime_days / totalCycleTime_days);

        return {
            cycleTime: {
                irradiation_days: irradiationTime_days,
                processing_hours: processingTime_hours,
                transport_hours: transportTime_hours,
                maintenance_days: maintenanceWindow_days,
                total_days: totalCycleTime_days
            },
            throughput: {
                batchesPerYear,
                targetsPerYear: batchesPerYear * targetsPerBatch,
                effectiveUptime
            },
            scheduling: {
                annualOperatingDays: 365 * sourceUptime,
                maintenanceDaysPerYear: (365 / totalCycleTime_days) * maintenanceWindow_days,
                productionDaysPerYear: 365 * sourceUptime - ((365 / totalCycleTime_days) * maintenanceWindow_days)
            }
        };
    },

    /**
     * Cost Analysis
     * 
     * @param {Object} params - Cost parameters
     * @param {number} params.capitalCost_USD - Facility capital cost (USD)
     * @param {number} params.annualOperatingCost_USD - Annual operating cost (USD)
     * @param {number} params.electricityCost_USD_kWh - Electricity cost (USD/kWh)
     * @param {number} params.sourcePower_MW - Source power consumption (MW)
     * @param {number} params.auxiliaryPower_MW - Auxiliary systems power (MW)
     * @param {number} params.annualOperatingHours - Annual operating hours
     * @param {number} params.annualProduction_GBq - Annual production (GBq)
     * @param {number} params.amortizationYears - Capital amortization period (years)
     * @returns {Object} Cost analysis results
     */
    costAnalysis: function(params) {
        const {
            capitalCost_USD = 10e6,
            annualOperatingCost_USD = 2e6,
            electricityCost_USD_kWh = 0.10,
            sourcePower_MW = 1.0,
            auxiliaryPower_MW = 0.5,
            annualOperatingHours = 7000,
            annualProduction_GBq = 1000,
            amortizationYears = 20
        } = params;

        // Electricity costs
        const totalPower_MW = sourcePower_MW + auxiliaryPower_MW;
        const annualElectricity_kWh = totalPower_MW * 1000 * annualOperatingHours;
        const annualElectricityCost_USD = annualElectricity_kWh * electricityCost_USD_kWh;

        // Capital amortization
        const annualCapitalCost_USD = capitalCost_USD / amortizationYears;

        // Total annual cost
        const totalAnnualCost_USD = annualOperatingCost_USD + 
                                   annualElectricityCost_USD + 
                                   annualCapitalCost_USD;

        // Per-dose cost
        const costPerGBq_USD = annualProduction_GBq > 0 ? 
                               totalAnnualCost_USD / annualProduction_GBq : 
                               0;

        return {
            capital: {
                total_USD: capitalCost_USD,
                annualAmortized_USD: annualCapitalCost_USD,
                amortizationYears
            },
            operating: {
                base_USD: annualOperatingCost_USD,
                electricity_USD: annualElectricityCost_USD,
                total_USD: totalAnnualCost_USD
            },
            electricity: {
                totalPower_MW,
                annualConsumption_kWh: annualElectricity_kWh,
                cost_USD: annualElectricityCost_USD,
                costPerHour_USD: annualElectricityCost_USD / annualOperatingHours
            },
            production: {
                annualProduction_GBq,
                costPerGBq_USD,
                costPerDose_USD: costPerGBq_USD // Assuming 1 dose = 1 GBq (planning estimate)
            },
            summary: {
                totalAnnualCost_USD,
                costBreakdown: {
                    capital_pct: (annualCapitalCost_USD / totalAnnualCost_USD) * 100,
                    operating_pct: (annualOperatingCost_USD / totalAnnualCost_USD) * 100,
                    electricity_pct: (annualElectricityCost_USD / totalAnnualCost_USD) * 100
                }
            }
        };
    },

    /**
     * Waste Stream Management
     * 
     * @param {Object} params - Waste parameters
     * @param {number} params.targetMass_kg - Target mass per batch (kg)
     * @param {number} params.batchesPerYear - Batches per year
     * @param {number} params.chemistryWasteFraction - Fraction of target mass becoming waste
     * @param {number} params.targetHalfLife_days - Target isotope half-life (days)
     * @param {number} params.storageTime_years - Storage time before disposal (years)
     * @returns {Object} Waste stream analysis
     */
    wasteStreamAnalysis: function(params) {
        const {
            targetMass_kg = 0.1,
            batchesPerYear = 50,
            chemistryWasteFraction = 0.1,
            targetHalfLife_days = 6.65,
            storageTime_years = 10
        } = params;

        const annualWasteMass_kg = targetMass_kg * batchesPerYear * chemistryWasteFraction;
        const decayConstant_per_s = Math.log(2) / (targetHalfLife_days * 86400);
        const storageTime_s = storageTime_years * 365 * 86400;
        const decayFactor = Math.exp(-decayConstant_per_s * storageTime_s);
        const remainingActivity_fraction = 1 - decayFactor;

        // Waste classification (planning-grade estimates)
        const activityPerKg_GBq = 1000; // Planning estimate
        const totalActivity_GBq = annualWasteMass_kg * activityPerKg_GBq;
        const activityAfterStorage_GBq = totalActivity_GBq * remainingActivity_fraction;

        // Disposal cost estimates (planning-grade)
        const disposalCostPerKg_USD = activityAfterStorage_GBq > 100 ? 10000 : 1000;
        const annualDisposalCost_USD = annualWasteMass_kg * disposalCostPerKg_USD;

        return {
            wasteGeneration: {
                annualMass_kg: annualWasteMass_kg,
                batchesPerYear,
                wastePerBatch_kg: targetMass_kg * chemistryWasteFraction
            },
            radioactivity: {
                initialActivity_GBq: totalActivity_GBq,
                halfLife_days: targetHalfLife_days,
                storageTime_years,
                decayFactor,
                activityAfterStorage_GBq,
                remainingFraction: remainingActivity_fraction
            },
            disposal: {
                annualDisposalCost_USD,
                costPerKg_USD: disposalCostPerKg_USD,
                classification: activityAfterStorage_GBq > 100 ? 'high_activity' : 'low_activity',
                storageRequired_m3: annualWasteMass_kg * 0.001 // Planning estimate: 1 m³ per 1000 kg
            }
        };
    },

    /**
     * Electricity Consumption Analysis
     * 
     * @param {Object} params - Power parameters
     * @param {number} params.sourcePower_MW - Source power (MW)
     * @param {number} params.auxiliaryPower_MW - Auxiliary power (MW)
     * @param {number} params.coolingPower_MW - Cooling system power (MW)
     * @param {number} params.annualOperatingHours - Annual operating hours
     * @param {number} params.dutyCycle - Source duty cycle (0-1)
     * @returns {Object} Electricity consumption analysis
     */
    electricityAnalysis: function(params) {
        const {
            sourcePower_MW = 1.0,
            auxiliaryPower_MW = 0.5,
            coolingPower_MW = 0.2,
            annualOperatingHours = 7000,
            dutyCycle = 1.0
        } = params;

        const averageSourcePower_MW = sourcePower_MW * dutyCycle;
        const totalAveragePower_MW = averageSourcePower_MW + auxiliaryPower_MW + coolingPower_MW;
        const peakPower_MW = sourcePower_MW + auxiliaryPower_MW + coolingPower_MW;

        const annualConsumption_MWh = totalAveragePower_MW * annualOperatingHours;
        const annualConsumption_kWh = annualConsumption_MWh * 1000;

        // Carbon footprint estimate (planning-grade, assumes grid average)
        const carbonIntensity_kgCO2_per_MWh = 0.5; // Planning estimate
        const annualCO2_kg = annualConsumption_MWh * carbonIntensity_kgCO2_per_MWh;

        return {
            power: {
                source_MW: sourcePower_MW,
                averageSource_MW: averageSourcePower_MW,
                auxiliary_MW: auxiliaryPower_MW,
                cooling_MW: coolingPower_MW,
                totalAverage_MW: totalAveragePower_MW,
                peak_MW: peakPower_MW,
                dutyCycle
            },
            consumption: {
                annual_MWh: annualConsumption_MWh,
                annual_kWh: annualConsumption_kWh,
                average_kW: totalAveragePower_MW * 1000,
                peak_kW: peakPower_MW * 1000
            },
            environmental: {
                annualCO2_kg,
                carbonIntensity_kgCO2_per_MWh,
                operatingHours: annualOperatingHours
            }
        };
    },

    /**
     * Comprehensive Manufacturing Analysis
     * 
     * Combines all analysis modules
     * 
     * @param {Object} params - All manufacturing parameters
     * @returns {Object} Complete manufacturing analysis
     */
    comprehensiveAnalysis: function(params) {
        const engineering = this.engineeringAnalysis(params);
        const operations = this.operationsAnalysis(params);
        const cost = this.costAnalysis(params);
        const waste = this.wasteStreamAnalysis(params);
        const electricity = this.electricityAnalysis(params);

        return {
            engineering,
            operations,
            cost,
            waste,
            electricity,
            summary: {
                feasibility: {
                    thermal: engineering.thermal.status === 'within_limit',
                    damage: engineering.damage.status === 'within_limit',
                    overall: engineering.thermal.status === 'within_limit' && 
                            engineering.damage.status === 'within_limit'
                },
                keyMetrics: {
                    annualProduction_GBq: operations.throughput.targetsPerYear * 100, // Planning estimate
                    costPerGBq_USD: cost.production.costPerGBq_USD,
                    annualElectricity_MWh: electricity.consumption.annual_MWh,
                    annualWaste_kg: waste.wasteGeneration.annualMass_kg
                }
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ManufacturingAnalysis };
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.ManufacturingAnalysis = ManufacturingAnalysis;
}

