/**
 * app.js
 * 
 * Main entry point for the application.
 * Handles initialization and global exposure for debugging.
 */

import { Model } from './model.js';
import { RouteEvaluator } from './routeEvaluator.js';
import { UI } from './ui.js';
import { Charts } from './charts.js';

import { DT_NEUTRONS_PER_MW } from './sources/sourceConstants.js';
import { gdtNeutronSource } from './sources/gdtSource.js';

// Expose globals for debugging/legacy compatibility (if needed)
window.Model = Model;
window.RouteEvaluator = RouteEvaluator;
window.UI = UI;
window.Charts = Charts;
window.DT_NEUTRONS_PER_MW = DT_NEUTRONS_PER_MW;
window.gdtNeutronSource = gdtNeutronSource;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Application...');

    // Initialize Model
    Model.init();

    // Initialize UI
    UI.init();

    console.log('Application Initialized.');
});
