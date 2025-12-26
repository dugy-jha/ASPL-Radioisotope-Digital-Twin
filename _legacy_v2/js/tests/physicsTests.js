/**
 * physicsTests.js
 * 
 * Verification suite for new physics models (RK4 solver, Finite Source Flux).
 * Run this in the browser console or via a test runner.
 */

import { Model } from '../model.js';

export const PhysicsTests = {
    runAll: function () {
        console.group('Physics Verification Tests');
        this.testRK4Solver();
        this.testFiniteSourceFlux();
        console.groupEnd();
    },

    /**
     * Test RK4 Solver against Analytical Solution (Bateman)
     * Case: A -> B -> (stable)
     */
    testRK4Solver: function () {
        console.group('Test: RK4 Solver Accuracy');

        // Setup: A -> B (stable)
        // T1/2 = 1 day (lambda = 0.693 d^-1)
        // T1/2_B = 1000 years (effectively stable for short test)
        // Actually let's do A -> B -> C where B is also decaying fast for stiffness
        // T1/2_A = 10 days
        // T1/2_B = 1 day
        const lambda_A = Math.LN2 / (10 * 86400);
        const lambda_B = Math.LN2 / (1 * 86400);

        // Decay matrix [A, B] (excluding C)
        // A decays to B
        // Matrix:
        // [-lambda_A, 0]
        // [lambda_A, -lambda_B]
        const decayMatrix = [
            [-lambda_A, 0],
            [lambda_A, -lambda_B]
        ];

        const N0 = [1e20, 0];
        const t = 5 * 86400; // 5 days

        // Analytical Solution
        const N_A_analytical = N0[0] * Math.exp(-lambda_A * t);
        const N_B_analytical = N0[0] * lambda_A / (lambda_B - lambda_A) * (Math.exp(-lambda_A * t) - Math.exp(-lambda_B * t));

        // RK4 Solution
        const N_RK4 = Model.batemanRungeKutta(N0, decayMatrix, t);

        // Compare
        const err_A = Math.abs(N_RK4[0] - N_A_analytical) / N_A_analytical;
        const err_B = Math.abs(N_RK4[1] - N_B_analytical) / N_B_analytical;

        console.log(`Time: ${t / 86400} days`);
        console.log(`N_A: Analytical=${N_A_analytical.toExponential(4)}, RK4=${N_RK4[0].toExponential(4)}, Error=${err_A.toExponential(4)}`);
        console.log(`N_B: Analytical=${N_B_analytical.toExponential(4)}, RK4=${N_RK4[1].toExponential(4)}, Error=${err_B.toExponential(4)}`);

        if (err_A < 1e-4 && err_B < 1e-4) {
            console.log('%cPASS: RK4 matches analytical solution within 0.01%', 'color:green');
        } else {
            console.error('FAIL: RK4 error too high');
        }
        console.groupEnd();
    },

    /**
     * Test Finite Source Flux
     */
    testFiniteSourceFlux: function () {
        console.group('Test: Finite Source Flux');

        const S = 1e14;
        const d = 10; // cm
        const r_target = 1; // cm

        // 1. Point source (r_source = 0) should equal solidAngle
        const phi_point = Model.fluxFromSolidAngle(S, Model.solidAngle(d, r_target), Math.PI * r_target * r_target);
        const phi_finite_0 = Model.fluxFiniteSource(S, d, r_target, 0);

        console.log(`Point Source Flux: ${phi_point.toExponential(4)}`);
        console.log(`Finite Source (r=0): ${phi_finite_0.toExponential(4)}`);

        if (Math.abs(phi_finite_0 - phi_point) < 1e-10) {
            console.log('%cPASS: Finite flux reduces to point flux for r_source=0', 'color:green');
        } else {
            console.error('FAIL: Finite flux (r=0) mismatch');
        }

        // 2. Large source (r_source = d) should be lower than point source (geometric dilution)
        const r_source = 10;
        const phi_finite_large = Model.fluxFiniteSource(S, d, r_target, r_source);
        console.log(`Finite Source (r=10): ${phi_finite_large.toExponential(4)}`);

        if (phi_finite_large < phi_point) {
            console.log('%cPASS: Finite source flux is lower than point source (as expected)', 'color:green');
        } else {
            console.warn('WARNING: Finite source flux >= point flux?');
        }

        console.groupEnd();
    }
};

// Auto-run if loaded directly? No, let user call it.
// Expose
window.PhysicsTests = PhysicsTests;
