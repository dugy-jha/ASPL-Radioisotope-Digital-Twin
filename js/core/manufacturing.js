/**
 * manufacturing.js
 * 
 * Manufacturing Analysis Module (ConOps-6).
 * Provides engineering-grade estimates for Cost, Waste, and Energy.
 */

export const Manufacturing = {

    /**
     * Comprehensive Manufacturing Analysis
     */
    analyze: function (params) {
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
                    annualProduction_GBq: operations.throughput.targetsPerYear * params.yieldPerTarget_GBq,
                    costPerGBq_USD: cost.production.costPerGBq_USD,
                    annualElectricity_MWh: electricity.consumption.annual_MWh,
                    annualWaste_kg: waste.wasteGeneration.annualMass_kg
                }
            }
        };
    },

    engineeringAnalysis: function (params) {
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
        const deltaT_K = beamPower_MW > 0 ? (beamPower_MW * 1e6 / (coolantFlow_kg_s * heatCapacity_J_kgK)) : 0;
        const thermalDerate = deltaT_K > maxDeltaT_K ? maxDeltaT_K / deltaT_K : 1.0;
        const thermalStatus = deltaT_K > maxDeltaT_K ? 'exceeded' : 'within_limit';

        // Damage analysis
        const totalDPA = dpaRate_dpa_s * irradiationTime_days * 86400;
        const damageDerate = totalDPA > maxDPA ? maxDPA / totalDPA : 1.0;
        const damageStatus = totalDPA > maxDPA ? 'exceeded' : 'within_limit';

        return {
            thermal: { deltaT_K, maxDeltaT_K, status: thermalStatus },
            damage: { totalDPA, maxDPA, status: damageStatus }
        };
    },

    operationsAnalysis: function (params) {
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

        return {
            cycleTime: { total_days: totalCycleTime_days },
            throughput: { batchesPerYear, targetsPerYear: batchesPerYear * targetsPerBatch }
        };
    },

    costAnalysis: function (params) {
        const {
            capitalCost_USD = 10e6,
            annualOperatingCost_USD = 2e6,
            electricityCost_USD_kWh = 0.10,
            sourcePower_MW = 1.0,
            annualOperatingHours = 7000,
            annualProduction_GBq = 1000,
            amortizationYears = 20
        } = params;

        const annualElectricityCost_USD = sourcePower_MW * 1000 * annualOperatingHours * electricityCost_USD_kWh;
        const annualCapitalCost_USD = capitalCost_USD / amortizationYears;
        const totalAnnualCost_USD = annualOperatingCost_USD + annualElectricityCost_USD + annualCapitalCost_USD;

        const costPerGBq_USD = annualProduction_GBq > 0 ? totalAnnualCost_USD / annualProduction_GBq : 0;

        return {
            production: { costPerGBq_USD },
            summary: { totalAnnualCost_USD, annualElectricityCost_USD }
        };
    },

    wasteStreamAnalysis: function (params) {
        const {
            targetMass_kg = 0.001,
            batchesPerYear = 50,
            chemistryWasteFraction = 0.1,
            disposalCostPerKg_USD = 5000
        } = params;

        const annualWasteMass_kg = targetMass_kg * batchesPerYear * chemistryWasteFraction;
        const annualDisposalCost_USD = annualWasteMass_kg * disposalCostPerKg_USD;

        return {
            wasteGeneration: { annualMass_kg: annualWasteMass_kg },
            disposal: { annualDisposalCost_USD }
        };
    },

    electricityAnalysis: function (params) {
        const {
            sourcePower_MW = 1.0,
            annualOperatingHours = 7000
        } = params;

        const annualConsumption_MWh = sourcePower_MW * annualOperatingHours;

        return {
            consumption: { annual_MWh: annualConsumption_MWh }
        };
    }
};
