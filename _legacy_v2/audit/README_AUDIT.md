# Generic Radioisotope Production Digital Twin
## Frozen Audit Snapshot (v2.2.1)

---

## 1. Purpose of This Audit Snapshot

This directory contains a **frozen, read-only snapshot** of the Generic Radioisotope Production Digital Twin implementation, organized for independent technical, numerical, and regulatory review.

**Important Notes:**
- This snapshot is intended for audit and review purposes only
- This is **not** a production system or deployment package
- This is **not** a licensing submission or regulatory approval document
- Code in this directory must not be edited or modified
- All findings should reference original source files in the main codebase
- This snapshot reflects the implementation state at a specific point in time

---

## 2. Scope of the Digital Twin

### What the Model DOES

The Generic Radioisotope Production Digital Twin provides deterministic, physics-first calculations for:

- **Radioisotope production** via neutron activation and charged-particle reactions
- **Decay physics**: Single-step and multi-step Bateman decay chains (including branching networks)
- **Burn-up effects**: Parent target burn-up and product isotope burn-up (when cross-section data provided)
- **Flux models**: Constant, time-dependent (duty-cycle, ramp, step), and spatial flux distributions
- **Geometry**: Solid-angle flux calculations, self-shielding, circular target integration
- **Epithermal resonance integrals**: Thermal and epithermal neutron contributions
- **Chemistry and logistics**: Decay during processing delays, chemistry yield losses, transport decay
- **Uncertainty propagation**: Parametric Monte Carlo uncertainty (root-sum-square for deterministic)
- **Route evaluation**: Feasibility classification for isotope production routes
- **Route scoring**: Comparative metrics for D–T neutron generator concepts

### What the Model DOES NOT Do

The following capabilities are **explicitly excluded** from this digital twin:

- **Neutron transport solvers**: No MCNP, Serpent, OpenMC, or other transport code implementation
  - Export interfaces provided for external transport solvers
- **CFD solvers**: No Computational Fluid Dynamics implementation
  - Thermal boundary conditions can be exported for external CFD tools
- **Facility licensing**: No safety case generation or licensing approval
- **Economic optimization**: No cost modeling or business case analysis
- **Production guarantees**: No yield guarantees or facility performance commitments

---

## 3. Physics & Numerical Assumptions

The following explicit assumptions are made throughout the model:

### Flux and Geometry
- **Point-source flux input**: Flux is provided as an input parameter, not calculated from transport
- **Uniform target density**: Target atom density is assumed uniform throughout target volume
- **Circular target geometry**: Spatial flux integration assumes circular, radially symmetric targets
- **Solid-angle interception**: Flux calculation uses solid-angle geometry for point sources

### Nuclear Data
- **Planning-grade cross-sections**: Cross-section values are conservative estimates, not evaluated library values
- **No energy-dependent cross-sections**: Single cross-section value per reaction (except optional threshold scaling)
- **No resonance structure**: Epithermal resonance integrals are effective values, not detailed resonance structure

### Numerical Methods
- **Deterministic calculations**: All physics is deterministic (Monte Carlo is parametric uncertainty only)
- **Euler-based methods**: Matrix exponential uses explicit Euler method with stability guard
- **Trapezoidal integration**: Time-dependent flux uses trapezoidal rule for numerical integration
- **Adaptive timesteps**: Numerical integration uses adaptive timesteps for stability

### Coupling and Feedback
- **No feedback loops**: No coupling between damage, flux, and cross-sections
- **Linear damage accumulation**: DPA accumulation is linear, no annealing effects
- **Bulk thermal model**: Temperature rise is bulk calculation, no spatial gradients

---

## 4. Planning-Grade vs Validated Components

### Planning-Grade Components (Conservative Estimates)

These components use conservative, planning-level values and should not be treated as validated nuclear data:

- **Cross-sections** (`nominal_sigma_barns`): Conservative lower-bound or mid-range estimates
- **Flux values**: User-provided or estimated values
- **Burn-up coefficients** (`sigma_product_burn_cm2`): Optional, data-dependent
- **Impurity estimates**: Qualitative and quantitative assessments based on planning-grade cross-sections
- **Thermal derating**: Simplified bulk temperature rise model
- **Damage rates**: Linear DPA accumulation estimates

### Validated / Analytically Correct Components

These components implement standard physics equations with verified dimensional consistency:

- **Decay equations**: `λ = ln(2) / T_half` (standard definition)
- **Bateman formulations**: General N-parent branching decay networks (v2.2.0)
- **Unit consistency**: All equations verified for dimensional correctness
- **Reaction-rate formulations**: `R = N × σ × φ × f_shield` (standard definition)
- **Conservation logic**: Atom conservation in decay chains, branching ratio validation
- **Saturation factors**: `f_sat = 1 - exp(-λt)` (analytically correct)
- **Self-shielding**: `f_shield = (1 - exp(-Σd)) / (Σd)` (standard formulation)

---

## 5. How to Run Validation Testcases

### Lu-177 Validation Test Case

**Purpose:** Validate n.c.a. Lu-177 production via Lu-176(n,γ)Lu-177 reaction under thermal neutron conditions.

**Location:** Test case parameters are defined in `ui.js` function `loadLu177TestCase()`.

**Parameters:**
- Half-life: 6.647 days
- Cross-section: 2090 barns (thermal)
- Enrichment: 0.75
- Flux: 1.0e13 n/s source strength
- Target: Lu2O3, 2.0 cm radius, 0.2 cm thickness
- Irradiation: 5.0 days

**Expected Outputs (Order-of-Magnitude):**
- Decay constant λ ≈ 1.21e-6 s⁻¹
- Saturation factor at 5 days ≈ 0.40–0.45
- Flux at target ≈ 1e9 – 1e10 n/cm²/s
- Activity at EOB ≈ tens to low hundreds of GBq
- Delivered activity ≈ ~90% of EOB (after chemistry and transport)

**Validation Criteria:**
- Results within ±10% of expected order-of-magnitude
- No thermal derating triggered
- No damage derating triggered
- Smooth exponential saturation behavior

**Note:** These results are for **feasibility comparison only**, not yield guarantees. Actual production yields depend on facility-specific conditions.

---

### Mo-99 → Tc-99m Generator Validation Test Case

**Purpose:** Validate parent-daughter Bateman decay chain behavior for generator systems.

**Location:** Test case parameters are defined in `ui.js` function `loadMo99ValidationCase()`.

**Parameters:**
- Parent half-life: 2.75 days (Mo-99)
- Daughter half-life: 0.25 days (Tc-99m)
- Branching ratio: 1.0
- Cross-section: 0.13 barns (thermal)
- Enrichment: 0.95
- Flux: 1e14 n/cm²/s
- Irradiation: 5 days

**Expected Behavior:**
- Parent activity builds up during irradiation
- Daughter activity follows Bateman parent→daughter relationship
- Post-EOB: Parent decays, daughter activity peaks then decays
- Secular equilibrium approached for daughter

**Validation Criteria:**
- Parent-daughter activity ratio follows Bateman equation
- Daughter activity peaks at expected time post-EOB
- No numerical instabilities in decay chain calculation

**Note:** This validates **decay chain physics**, not production yield guarantees.

---

## 6. Audit Rules

### Code Integrity
- **Code in `/audit` must not be edited**: This is a frozen snapshot
- **All findings should reference original source files**: Use paths like `js/model.js`, not `audit/physics/model.js`
- **Numerical discrepancies**: Cite specific equations, line numbers, and unit analysis
- **Feature gaps**: Report as "out-of-scope" or "known limitation," not errors

### Review Scope
- **Physics correctness**: Verify equations match standard formulations
- **Unit consistency**: Check dimensional analysis of all calculations
- **Numerical stability**: Verify stability guards and integration methods
- **Scope discipline**: Confirm no implicit claims of transport, CFD, or licensing

### Reporting Findings
- **Critical issues**: Physics errors, unit inconsistencies, broken logic
- **Moderate issues**: Numerical stability concerns, missing validation
- **Minor issues**: Documentation clarity, code organization
- **Out-of-scope**: Features explicitly excluded (transport, CFD, licensing)

---

## 7. Version & Provenance

**Version:** 2.2.1

**Release Notes:** Canonical isotope pathways introduced. Physics locked. Comparative-only analysis supported.

**Git Commit Hash:** 4799f41d1a8ff63255266cd85717a4857273ef67

**Commit Message:** v2.1.1: Numerical clarity & stability hardening (no physics change)

**Snapshot Date:** 2024-12-24

**Statement:** This snapshot reflects v2.2.1 exactly, including:
- Canonical isotope pathways registry (frozen, audit-locked)
- Physics lock enforcement (UI and data protection)
- Multi-step Bateman decay chain fixes (branching support)
- Product burn-up integration (data-dependent, self-shielded)
- Numerical hygiene patches (v2.1.1)
- All physics and numerical improvements

**Note:** The git commit shown is from v2.1.1. The v2.2.0 and v2.2.1 changes (Bateman branching fix, product burn-up integration, canonical pathways, physics lock) are included in this snapshot but may not yet be committed.

---

## 8. Directory Structure

```
/audit
  /physics          - Core physics equations (decay, Bateman, burn-up, flux)
  /routing          - Isotope route definitions and evaluation
  /scoring          - Route scoring and ranking algorithms
  /regulatory        - Limitations registry and regulatory metadata
  /ui               - User interface and visualization
  /data             - Atomic masses, constants, lookup tables
  /tests            - Validation test case documentation
  README_AUDIT.md   - This file
```

---

## 9. Key Files by Category

### Physics Core
- `physics/model.js` - Core physics equations (decay, reaction rates, Bateman, burn-up)
- `physics/advancedPhysics.js` - Advanced features (time-dependent flux, spatial flux, epithermal, Monte Carlo)
- `physics/solverInterfaces.js` - Export interfaces for external solvers (MCNP, CFD, SRIM)

### Route Evaluation
- `routing/isotopeRoutes.js` - Isotope production route registry
- `routing/routeEvaluator.js` - Route feasibility evaluation and classification
- `routing/routes.js` - Legacy route definitions (if present)

### Scoring and Ranking
- `scoring/routeScoring.js` - Route scoring algorithms and comparative metrics

### Regulatory and Limitations
- `regulatory/limitations.js` - Model limitations registry and scope boundaries

### User Interface
- `ui/index.html` - Main HTML structure
- `ui/ui.js` - UI event handling and test case loaders
- `ui/charts.js` - Plotly chart definitions
- `ui/style.css` - CSS styling

### Data
- `data/atomicMasses.js` - Atomic mass lookup table

---

## 10. Contact and Attribution

**Model Name:** Generic Radioisotope Production Digital Twin  
**Version:** 2.2.1  
**Release Notes:** Canonical isotope pathways introduced. Physics locked. Comparative-only analysis supported.  
**Purpose:** Planning-grade radioisotope production modeling for D–T neutron generator concepts  
**License:** See main repository LICENSE file  
**Disclaimer:** This is a planning tool only. No regulatory approval, licensing, or production guarantees are provided.

---

**End of Audit Snapshot Documentation**
