/**
 * app.js
 * 
 * Main Application Controller for ASPL Digital Twin v3.
 * Orchestrates User Input -> Physics Model -> UI Updates.
 */

import { Model } from './core/model.js';
import { Sources } from './core/sources.js';
import { Manufacturing } from './core/manufacturing.js';
import { NuclearData } from './data/nuclearData.js';
import { PathwaysRegistry, getRouteById } from './data/pathways.js';

// State Management
const State = {
    route: null,
    inputs: {
        sourceType: 'fixed_flux', // fixed_flux, dt_generator, gdt_trap
        flux: 1e14, // n/cm2/s (direct override)

        // Source Configs
        dt_yield: 1e12, // n/s
        gdt_power: 2,   // MW

        // Geometry
        distance: 10,   // cm

        time: 7,    // days
        mass: 10,   // mg
        cooling: 0  // hours
    },
    results: null
};

/**
 * Initialize Application
 */
function init() {
    console.log("ASPL Digital Twin v3 Initializing...");

    populateRouteSelector();
    setupEventListeners();

    // Select first route by default
    selectRoute(PathwaysRegistry[0].id);
}

/**
 * Populate Route Selector Dropdown
 */
function populateRouteSelector() {
    const selector = document.getElementById('routeSelector');
    selector.innerHTML = '';

    PathwaysRegistry.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${route.name} — ${route.category}`;
        selector.appendChild(option);
    });
}

/**
 * Setup Event Listeners for Inputs
 */
function setupEventListeners() {
    // Route Selector
    document.getElementById('routeSelector').addEventListener('change', (e) => {
        selectRoute(e.target.value);
    });

    // Numeric Inputs
    ['fluxInput', 'timeInput', 'massInput', 'coolingInput', 'dtYieldInput', 'gdtPowerInput', 'distInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', handleInputChange);
    });

    // Source Type Selector
    const sourceTypeSel = document.getElementById('sourceTypeSelector');
    if (sourceTypeSel) {
        sourceTypeSel.addEventListener('change', (e) => {
            State.inputs.sourceType = e.target.value;
            toggleSourceInputs(e.target.value);
            calculate();
        });
    }
}

function toggleSourceInputs(type) {
    document.getElementById('groupFixed').style.display = type === 'fixed_flux' ? 'block' : 'none';
    document.getElementById('groupDT').style.display = type === 'dt_generator' ? 'block' : 'none';
    document.getElementById('groupGDT').style.display = type === 'gdt_trap' ? 'block' : 'none';
}

/**
 * Handle Input Changes
 */
function handleInputChange(e) {
    const id = e.target.id;
    const val = parseFloat(e.target.value);

    // if (isNaN(val)) return; // Allow typing

    if (id === 'fluxInput') State.inputs.flux = val;
    if (id === 'timeInput') State.inputs.time = val;
    if (id === 'massInput') State.inputs.mass = val;
    if (id === 'coolingInput') State.inputs.cooling = val;

    if (id === 'dtYieldInput') State.inputs.dt_yield = val;
    if (id === 'gdtPowerInput') State.inputs.gdt_power = val;
    if (id === 'distInput') State.inputs.distance = val;

    calculate();
}

/**
 * Select a Route and Recalculate
 */
function selectRoute(routeId) {
    State.route = getRouteById(routeId);
    renderStaticRouteInfo();
    calculate();
}

/**
 * Render Static Info (Half-life, etc.)
 */
function renderStaticRouteInfo() {
    if (!State.route) return;

    document.getElementById('targetIsotopeDisplay').textContent = State.route.target.isotope;
    document.getElementById('productIsotopeDisplay').textContent = State.route.product.isotope;
    document.getElementById('halfLifeDisplay').textContent = `${State.route.product.halfLife} days`;
    document.getElementById('reactionDisplay').textContent = State.route.target.reaction;
}

/**
 * Core Calculation Logic
 */
function calculate() {
    if (!State.route) return;

    const { flux, time, mass, cooling } = State.inputs;
    const time_seconds = time * 24 * 3600;
    const cooling_seconds = cooling * 3600;

    // 1. Physical Constants
    const lambda = Model.decayConstant(State.route.product.halfLife);
    const sigma = (State.route.crossSection.thermal || State.route.crossSection.fast_14MeV || 0) * 1e-24; // barns to cm2

    // 2. Target Atoms Calculation
    // Mass (mg) -> Atoms. Assuming approximate atomic mass ~ mass number for planning
    const massNumber = parseInt(State.route.target.isotope.match(/\d+/)[0]);
    const element = Model.extractElementSymbol(State.route.target.isotope);
    const abundance = NuclearData.getIsotopicAbundance(element, massNumber) || 1.0;

    // N = (Mass_g / AtomicMass) * Avogadro * Abundance
    // 1 mg = 1e-3 g
    const N_target = ((mass * 1e-3) / massNumber) * 6.022e23 * abundance;

    // 3. Reaction Rate (Simplified: No self-shielding in basic view yet, or assume f=1)
    const f_shield = 1.0;
    const R = Model.reactionRate(N_target, sigma, flux, f_shield);

    // 4. Production (Saturation)
    const f_sat = Model.saturationFactor(lambda, time_seconds);
    const N_EOB = Model.atomsAtEOB(R, f_sat, lambda);
    const activity_EOB = Model.activity(lambda, N_EOB);

    // 5. Post-Processing (Cooling + Yield)
    const decay_cooling = Math.exp(-lambda * cooling_seconds);
    const activity_pre_yield = activity_EOB * decay_cooling;

    // Delivered Activity
    const delivered = Model.deliveredActivityWithChemistryYield(activity_pre_yield, State.route.chemistry.yield);

    // Specific Activity (Bq/g of product, simplified assumption: product mass ~ N * massNum)
    // Note: Accurate specific activity requires carrier mass calc. 
    // For now, clean display of total activity.

    updateUI(activity_EOB, delivered);
}

/**
 * Update UI Results
 */
function updateUI(eob, delivered) {
    // Format helpers
    const fmt = (num) => num === 0 ? "0" : num.toExponential(2);

    document.getElementById('resultEOB').textContent = `${fmt(eob)} Bq`;
    document.getElementById('resultDelivered').textContent = `${fmt(delivered)} Bq`;

    // Update simple gauge/bar (visual feedback)
    const bar = document.getElementById('yieldBar');
    if (bar) {
        // Log scale visualization hack for demo
        const logVal = Math.log10(delivered + 1);
        const percent = Math.min(100, Math.max(0, (logVal / 15) * 100)); // Assume max ~1e15
        bar.style.width = `${percent}%`;
    }
}

// Start
init();
