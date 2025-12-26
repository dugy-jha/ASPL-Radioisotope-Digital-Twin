/**
 * manufacturingCharts.js
 * 
 * Manufacturing Analysis Visualizations
 * 
 * Plotly chart definitions for manufacturing analysis dashboard.
 * NO physics calculations - only visualization of analysis results.
 */

const ManufacturingCharts = {
    /**
     * Initialize manufacturing charts
     */
    init: function() {
        // Charts will be initialized when data is available
    },

    /**
     * Common chart configuration
     */
    getConfig: function() {
        return {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d']
        };
    },

    /**
     * Cost Breakdown Pie Chart
     * 
     * @param {string} containerId - DOM element ID
     * @param {Object} costData - Cost analysis results
     */
    costBreakdownChart: function(containerId, costData) {
        const data = [{
            labels: ['Capital', 'Operating', 'Electricity'],
            values: [
                costData.summary.costBreakdown.capital_pct,
                costData.summary.costBreakdown.operating_pct,
                costData.summary.costBreakdown.electricity_pct
            ],
            type: 'pie',
            marker: {
                colors: ['#3498db', '#2ecc71', '#f39c12']
            },
            textinfo: 'label+percent',
            textposition: 'outside'
        }];

        const layout = {
            title: 'Annual Cost Breakdown',
            font: { size: 12 },
            margin: { t: 50, b: 50, l: 50, r: 50 }
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Electricity Consumption Over Time
     * 
     * @param {string} containerId - DOM element ID
     * @param {Object} electricityData - Electricity analysis results
     */
    electricityConsumptionChart: function(containerId, electricityData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyConsumption_MWh = electricityData.consumption.annual_MWh / 12;

        const data = [{
            x: months,
            y: Array(12).fill(monthlyConsumption_MWh),
            type: 'bar',
            marker: { color: '#3498db' },
            name: 'Monthly Consumption'
        }];

        const layout = {
            title: 'Monthly Electricity Consumption',
            xaxis: { title: 'Month' },
            yaxis: { title: 'Consumption (MWh)' },
            font: { size: 12 }
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Waste Stream Timeline
     * 
     * @param {string} containerId - DOM element ID
     * @param {Object} wasteData - Waste stream analysis results
     */
    wasteStreamChart: function(containerId, wasteData) {
        const years = Array.from({length: 20}, (_, i) => i + 1);
        const decayConstant = Math.log(2) / (wasteData.radioactivity.halfLife_days * 365);
        
        const cumulativeMass = years.map(year => 
            wasteData.wasteGeneration.annualMass_kg * year
        );
        
        const activityOverTime = years.map(year => {
            const time_years = year - wasteData.radioactivity.storageTime_years;
            if (time_years <= 0) return wasteData.radioactivity.initialActivity_GBq * year;
            return wasteData.radioactivity.initialActivity_GBq * year * 
                   Math.exp(-decayConstant * time_years * 365);
        });

        const data = [
            {
                x: years,
                y: cumulativeMass,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Cumulative Waste Mass (kg)',
                yaxis: 'y',
                line: { color: '#e74c3c' }
            },
            {
                x: years,
                y: activityOverTime,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Total Activity (GBq)',
                yaxis: 'y2',
                line: { color: '#9b59b6' }
            }
        ];

        const layout = {
            title: 'Waste Stream Accumulation Over Time',
            xaxis: { title: 'Years' },
            yaxis: { 
                title: 'Cumulative Mass (kg)',
                side: 'left'
            },
            yaxis2: {
                title: 'Total Activity (GBq)',
                overlaying: 'y',
                side: 'right'
            },
            font: { size: 12 }
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Operations Timeline
     * 
     * @param {string} containerId - DOM element ID
     * @param {Object} operationsData - Operations analysis results
     */
    operationsTimelineChart: function(containerId, operationsData) {
        const cycleTime_days = operationsData.cycleTime.total_days;
        const batchesPerYear = operationsData.throughput.batchesPerYear;
        
        const months = 12;
        const batchesPerMonth = batchesPerYear / 12;
        const days = Array.from({length: 365}, (_, i) => i + 1);
        
        const productionDays = days.map(day => {
            const cycleNumber = Math.floor(day / cycleTime_days);
            const dayInCycle = day % cycleTime_days;
            return dayInCycle < operationsData.cycleTime.irradiation_days ? 1 : 0;
        });

        const data = [{
            x: days,
            y: productionDays,
            type: 'scatter',
            mode: 'lines',
            name: 'Production Status',
            line: { color: '#2ecc71', width: 2 },
            fill: 'tozeroy'
        }];

        const layout = {
            title: 'Annual Production Schedule',
            xaxis: { title: 'Day of Year' },
            yaxis: { 
                title: 'Production Active',
                range: [0, 1.2]
            },
            font: { size: 12 },
            shapes: [{
                type: 'rect',
                xref: 'x',
                yref: 'y',
                x0: 0,
                y0: 0,
                x1: 365,
                y1: 1,
                fillcolor: 'rgba(46, 204, 113, 0.1)',
                line: { width: 0 }
            }]
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Engineering Constraints Dashboard
     * 
     * @param {string} containerId - DOM element ID
     * @param {Object} engineeringData - Engineering analysis results
     */
    engineeringConstraintsChart: function(containerId, engineeringData) {
        const categories = ['Thermal', 'Damage'];
        const current = [
            engineeringData.thermal.deltaT_K,
            engineeringData.damage.totalDPA
        ];
        const limits = [
            engineeringData.thermal.maxDeltaT_K,
            engineeringData.damage.maxDPA
        ];
        const utilization = [
            (engineeringData.thermal.deltaT_K / engineeringData.thermal.maxDeltaT_K) * 100,
            (engineeringData.damage.totalDPA / engineeringData.damage.maxDPA) * 100
        ];

        const data = [
            {
                x: categories,
                y: current,
                type: 'bar',
                name: 'Current Value',
                marker: { color: '#3498db' }
            },
            {
                x: categories,
                y: limits,
                type: 'bar',
                name: 'Design Limit',
                marker: { color: '#e74c3c', opacity: 0.5 }
            }
        ];

        const layout = {
            title: 'Engineering Constraints Status',
            xaxis: { title: 'Constraint Type' },
            yaxis: { title: 'Value' },
            barmode: 'group',
            font: { size: 12 },
            annotations: [
                {
                    x: 'Thermal',
                    y: engineeringData.thermal.maxDeltaT_K,
                    text: `${utilization[0].toFixed(1)}%`,
                    showarrow: true,
                    arrowhead: 2
                },
                {
                    x: 'Damage',
                    y: engineeringData.damage.maxDPA,
                    text: `${utilization[1].toFixed(1)}%`,
                    showarrow: true,
                    arrowhead: 2
                }
            ]
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ManufacturingCharts };
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.ManufacturingCharts = ManufacturingCharts;
}

