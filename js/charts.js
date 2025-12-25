/**
 * charts.js
 * 
 * Generic Radioisotope Production Digital Twin - Chart Definitions
 * 
 * STRICT SEPARATION: Plotly chart definitions only.
 * - NO physics calculations
 * - NO model logic
 * - NO DOM manipulation (except chart containers)
 * - Only Plotly chart creation and update functions
 */

const Charts = {
    /**
     * Initialize all charts
     */
    init: function() {
        this.initActivityChart('chartActivity');
        this.initReactionRateChart('chartReactionRate');
        this.initDecayChainChart('chartDecayChain');
        this.initTemperatureChart('chartTemperature');
        this.initDamageChart('chartDamage');
        this.initWaterfallChart('chartWaterfall');
        this.initTransportChart('chartTransport');
        this.initUncertaintyChart('chartUncertainty');
        this.initComparativeActivityChart('chartComparativeActivity');
        this.initComparativeSpecificActivityChart('chartComparativeSpecificActivity');
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
     * Common layout template
     */
    getLayout: function(title, xTitle, yTitle) {
        return {
            title: {
                text: title,
                font: { size: 16, color: '#2c3e50' }
            },
            xaxis: {
                title: xTitle,
                gridcolor: '#e0e0e0',
                showgrid: true
            },
            yaxis: {
                title: yTitle,
                gridcolor: '#e0e0e0',
                showgrid: true
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { l: 70, r: 30, t: 50, b: 60 },
            hovermode: 'closest',
            font: { family: 'Arial, sans-serif', size: 12 }
        };
    },

    // ============================================================================
    // CHART 1: Activity vs Irradiation Time
    // ============================================================================

    initActivityChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Activity',
            line: { color: '#3498db', width: 2 }
        }];

        const layout = this.getLayout(
            'Activity vs Irradiation Time',
            'Irradiation Time (days)',
            'Activity (Bq)'
        );

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateActivityChart: function(containerId, timeData, activityData) {
        const update = {
            x: [timeData],
            y: [activityData]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 2: Reaction Rate vs Flux / Beam Current
    // ============================================================================

    initReactionRateChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Reaction Rate',
            line: { color: '#e74c3c', width: 2 }
        }];

        const layout = this.getLayout(
            'Reaction Rate vs Source Intensity',
            'Flux (cm⁻² s⁻¹) or Beam Current (A)',
            'Reaction Rate (reactions/s)'
        );

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateReactionRateChart: function(containerId, xData, yData, xLabel) {
        const update = {
            x: [xData],
            y: [yData]
        };
        const layoutUpdate = {
            'xaxis.title': xLabel
        };
        Plotly.restyle(containerId, update);
        Plotly.relayout(containerId, layoutUpdate);
    },

    // ============================================================================
    // CHART 3: Parent–Daughter Activity vs Time
    // ============================================================================

    initDecayChainChart: function(containerId) {
        const data = [
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: 'Parent',
                line: { color: '#3498db', width: 2 }
            },
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: 'Daughter',
                line: { color: '#e74c3c', width: 2 }
            }
        ];

        const layout = this.getLayout(
            'Parent–Daughter Activity vs Time (Including Post-EOB)',
            'Time (days)',
            'Activity (Bq)'
        );
        layout.legend = { x: 0.7, y: 0.95 };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateDecayChainChart: function(containerId, timeData, parentData, daughterData) {
        const update = {
            x: [timeData, timeData],
            y: [parentData, daughterData]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 4: Temperature Rise vs Beam Power
    // ============================================================================

    initTemperatureChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Temperature Rise',
            line: { color: '#f39c12', width: 2 }
        }];

        const layout = this.getLayout(
            'Temperature Rise vs Beam Power',
            'Beam Power (W)',
            'Temperature Rise (K)'
        );

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateTemperatureChart: function(containerId, powerData, tempData) {
        const update = {
            x: [powerData],
            y: [tempData]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 5: Damage Accumulation vs Time
    // ============================================================================

    initDamageChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'DPA',
            line: { color: '#9b59b6', width: 2 }
        }];

        const layout = this.getLayout(
            'Damage Accumulation vs Time',
            'Irradiation Time (days)',
            'DPA (Displacements per Atom)'
        );

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateDamageChart: function(containerId, timeData, dpaData) {
        const update = {
            x: [timeData],
            y: [dpaData]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 6: Activity Loss Waterfall (EOB → Delivered)
    // ============================================================================

    initWaterfallChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'bar',
            name: 'Activity',
            marker: { color: '#16a085' }
        }];

        const layout = {
            title: {
                text: 'Activity Loss Waterfall',
                font: { size: 16, color: '#2c3e50' }
            },
            xaxis: {
                title: 'Stage',
                gridcolor: '#e0e0e0'
            },
            yaxis: {
                title: 'Activity (Bq)',
                gridcolor: '#e0e0e0'
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { l: 70, r: 30, t: 50, b: 60 },
            font: { family: 'Arial, sans-serif', size: 12 }
        };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateWaterfallChart: function(containerId, stages, activities) {
        const update = {
            x: [stages],
            y: [activities]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 7: Delivered Activity vs Transport Time
    // ============================================================================

    initTransportChart: function(containerId) {
        const data = [{
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines',
            name: 'Delivered Activity',
            line: { color: '#27ae60', width: 2 }
        }];

        const layout = this.getLayout(
            'Delivered Activity vs Transport Time',
            'Transport Time (hours)',
            'Activity (Bq)'
        );

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateTransportChart: function(containerId, timeData, activityData) {
        const update = {
            x: [timeData],
            y: [activityData]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // CHART 8: Yield Uncertainty Bands (±1σ, ±2σ)
    // ============================================================================

    initUncertaintyChart: function(containerId) {
        const data = [
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: 'Mean',
                line: { color: '#2c3e50', width: 2 }
            },
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: '+2σ',
                line: { color: '#95a5a6', width: 1, dash: 'dash' },
                showlegend: false
            },
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: '+1σ',
                line: { color: '#7f8c8d', width: 1, dash: 'dot' },
                showlegend: false
            },
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: '-1σ',
                line: { color: '#7f8c8d', width: 1, dash: 'dot' },
                fill: 'tonexty',
                fillcolor: 'rgba(127, 140, 141, 0.2)',
                showlegend: false
            },
            {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines',
                name: '-2σ',
                line: { color: '#95a5a6', width: 1, dash: 'dash' },
                fill: 'tonexty',
                fillcolor: 'rgba(149, 165, 166, 0.1)',
                showlegend: false
            }
        ];

        const layout = this.getLayout(
            'Yield Uncertainty Bands',
            'Irradiation Time (days)',
            'Activity (Bq)'
        );
        layout.legend = { x: 0.7, y: 0.95 };

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    updateUncertaintyChart: function(containerId, timeData, meanData, sigma1Data, sigma2Data) {
        const update = {
            x: [
                timeData, // mean
                timeData, // +2σ
                timeData, // +1σ
                timeData, // -1σ
                timeData  // -2σ
            ],
            y: [
                meanData,
                meanData.map((m, i) => m + 2 * sigma2Data[i]),
                meanData.map((m, i) => m + sigma1Data[i]),
                meanData.map((m, i) => m - sigma1Data[i]),
                meanData.map((m, i) => m - 2 * sigma2Data[i])
            ]
        };
        Plotly.restyle(containerId, update);
    },

    // ============================================================================
    // COMPARATIVE ANALYTICS CHARTS
    // ============================================================================

    /**
     * Initialize comparative activity vs time chart
     */
    initComparativeActivityChart: function(containerId) {
        const data = [];

        const layout = this.getLayout(
            'Comparative Activity vs Irradiation Time (Analytical Comparison)',
            'Irradiation Time (days)',
            'Activity (GBq)'
        );
        layout.legend = { x: 0.7, y: 0.95 };
        layout.annotations = [{
            text: 'Analytical comparison only - not production predictions',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.15,
            xanchor: 'center',
            showarrow: false,
            font: { size: 10, color: '#6c757d', style: 'italic' }
        }];

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Update comparative activity chart with multiple routes
     */
    updateComparativeActivityChart: function(containerId, routesData) {
        const data = routesData.map((route, index) => {
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
            const riskColors = {
                'Low': '#2ecc71',
                'Medium': '#f39c12',
                'High': '#e74c3c'
            };
            
            const lineColor = riskColors[route.impurity_risk] || colors[index % colors.length];
            const lineWidth = route.impurity_risk === 'High' ? 3 : route.impurity_risk === 'Medium' ? 2.5 : 2;
            const lineStyle = route.impurity_risk === 'High' ? 'dash' : 'solid';

            return {
                x: route.timeData,
                y: route.activityData,
                type: 'scatter',
                mode: 'lines',
                name: route.label,
                line: { 
                    color: lineColor, 
                    width: lineWidth,
                    dash: lineStyle
                },
                hovertemplate: `<b>${route.label}</b><br>` +
                    `Time: %{x:.2f} days<br>` +
                    `Activity: %{y:.2f} GBq<br>` +
                    `Impurity Risk: ${route.impurity_risk}<extra></extra>`
            };
        });

        const layout = this.getLayout(
            'Comparative Activity vs Irradiation Time (Analytical Comparison)',
            'Irradiation Time (days)',
            'Activity (GBq)'
        );
        layout.legend = { x: 0.7, y: 0.95 };
        layout.margin = { l: 70, r: 30, t: 50, b: 80 };
        layout.annotations = [{
            text: 'Analytical comparison only - not production predictions',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.12,
            xanchor: 'center',
            showarrow: false,
            font: { size: 10, color: '#6c757d', style: 'italic' }
        }];

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Initialize comparative specific activity vs flux chart
     */
    initComparativeSpecificActivityChart: function(containerId) {
        const data = [];

        const layout = this.getLayout(
            'Comparative Specific Activity vs Flux (Analytical Comparison)',
            'Neutron Flux (cm⁻² s⁻¹)',
            'Specific Activity (TBq/g)'
        );
        layout.xaxis.type = 'log';
        layout.yaxis.type = 'log';
        layout.legend = { x: 0.7, y: 0.95 };
        layout.annotations = [{
            text: 'Analytical comparison only - not production predictions',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.15,
            xanchor: 'center',
            showarrow: false,
            font: { size: 10, color: '#6c757d', style: 'italic' }
        }];

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    },

    /**
     * Update comparative specific activity chart with multiple routes
     */
    updateComparativeSpecificActivityChart: function(containerId, routesData) {
        const data = routesData.map((route, index) => {
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
            const riskColors = {
                'Low': '#2ecc71',
                'Medium': '#f39c12',
                'High': '#e74c3c'
            };
            
            const lineColor = riskColors[route.impurity_risk] || colors[index % colors.length];
            const lineWidth = route.impurity_risk === 'High' ? 3 : route.impurity_risk === 'Medium' ? 2.5 : 2;
            const lineStyle = route.impurity_risk === 'High' ? 'dash' : 'solid';

            return {
                x: route.fluxData,
                y: route.specificActivityData,
                type: 'scatter',
                mode: 'lines',
                name: route.label,
                line: { 
                    color: lineColor, 
                    width: lineWidth,
                    dash: lineStyle
                },
                hovertemplate: `<b>${route.label}</b><br>` +
                    `Flux: %{x:.2e} cm⁻² s⁻¹<br>` +
                    `Specific Activity: %{y:.2f} TBq/g<br>` +
                    `Impurity Risk: ${route.impurity_risk}<extra></extra>`
            };
        });

        const layout = this.getLayout(
            'Comparative Specific Activity vs Flux (Analytical Comparison)',
            'Neutron Flux (cm⁻² s⁻¹)',
            'Specific Activity (TBq/g)'
        );
        layout.xaxis.type = 'log';
        layout.yaxis.type = 'log';
        layout.legend = { x: 0.7, y: 0.95 };
        layout.margin = { l: 70, r: 30, t: 50, b: 80 };
        layout.annotations = [{
            text: 'Analytical comparison only - not production predictions',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: -0.12,
            xanchor: 'center',
            showarrow: false,
            font: { size: 10, color: '#6c757d', style: 'italic' }
        }];

        Plotly.newPlot(containerId, data, layout, this.getConfig());
    }
};

if (typeof window !== 'undefined') {
    window.Charts = Charts;
}
