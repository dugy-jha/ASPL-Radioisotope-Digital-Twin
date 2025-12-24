# Audit Snapshot: Generic Radioisotope Production Digital Twin

**Audit Date:** 2024  
**Version:** 1.1.0 (Post-Audit Closure)  
**Status:** Frozen Audit Snapshot

---

## Scope of the Digital Twin

This digital twin provides deterministic physics-based calculations for radioisotope production via neutron activation and charged-particle reactions. The system models:

- **Radioactive decay:** Single-step Bateman equations for parent→daughter decay chains
- **Neutron activation:** Thermal and fast neutron reactions (n,γ), (n,p), (n,2n), (n,d)
- **Charged-particle reactions:** Alpha particle activation (planning estimates)
- **Production physics:** Reaction rates, saturation factors, burn-up, self-shielding
- **Engineering constraints:** Thermal limits, radiation damage accumulation
- **Logistics:** Post-irradiation decay during processing and transport
- **Uncertainty propagation:** Root-sum-square (RSS) methods for uncorrelated parameters
- **Route evaluation:** Feasibility assessment and comparative scoring for multiple production routes
- **Regulatory alignment:** Acceptance checks aligned with AERB and IAEA guidance (planning-level)
- **D-T Generator Classification:** Baseline feasibility analysis for deuterium-tritium neutron generator routes

### System Boundaries

**Included:**
- Deterministic physics calculations with explicit formulas
- Single-step decay chains (parent→daughter)
- Point source geometry assumptions (point isotropic source + solid-angle interception)
- Uniform target density assumptions
- Constant flux/beam current assumptions
- Uncorrelated uncertainty propagation
- Actual atomic masses (NIST/IUPAC standard atomic weights)
- Quantitative impurity assessment (when cross-section data available)
- Optional energy-dependent cross-section scaling for threshold reactions

**Not Included:**
- Multi-step decay chains (beyond parent→daughter)
- Spatial flux gradients
- Time-varying flux/beam current
- Product burn-up during irradiation
- Annealing effects
- Correlated uncertainty analysis
- Facility-specific engineering details
- Regulatory licensing or approval processes
- Epithermal resonance integrals (single thermal cross-section used)
- Detailed thermal gradients (uniform temperature assumed)

---

## Assumptions

### Physics Assumptions

1. **Point source geometry:** Neutron/particle sources are treated as point sources emitting isotropically
2. **Solid-angle interception:** Flux calculated using `φ = (S × Ω) / A_target` where Ω is target solid angle
3. **Uniform target density:** Target material has uniform atomic density (no spatial variation)
4. **Constant flux/beam:** Neutron flux and beam current are constant during irradiation (no time dependence)
5. **Single-step decay:** Only parent→daughter decay chains modeled (no multi-step chains)
6. **Uniform temperature:** No spatial temperature gradients (conservative assumption)
7. **No annealing:** Radiation damage accumulates linearly (no recovery)
8. **Uncorrelated uncertainties:** Parameter uncertainties are uncorrelated (RSS propagation valid)
9. **Actual atomic masses:** Uses NIST/IUPAC standard atomic weights (not isotopic mass excess)
10. **Step-function threshold:** Cross-section = 0 below threshold, constant above (optional energy scaling available)
11. **No product burn-up:** Product isotope does not undergo further activation (valid for low-flux cases)

### Nuclear Data Assumptions

1. **Planning-grade cross-sections:** Cross-section values are conservative planning estimates
2. **No evaluated libraries:** Values are not from evaluated nuclear data libraries (ENDF/B-VIII, TENDL)
3. **No accuracy claims:** Cross-section values are suitable for planning only, not validated against experimental data
4. **Standard atomic weights:** Uses standard atomic weights (weighted averages of natural isotopes), not isotopic masses
5. **Impurity cross-sections:** Uses planning-grade estimates or defaults to 10% of product cross-section if unavailable

### Engineering Assumptions

1. **Thermal-hydraulic:** Simple heat transfer model (ΔT = P/(ṁ × C_p))
2. **Damage accumulation:** Linear DPA accumulation (no annealing)
3. **Self-shielding:** Simplified self-shielding factor calculation
4. **No spatial gradients:** Uniform temperature and damage distribution assumed

### Regulatory Assumptions

1. **Planning-level analysis:** All regulatory alignments are for planning purposes only
2. **No licensing:** System does not constitute regulatory approval or facility licensing
3. **Acceptance criteria:** Thresholds are planning guidelines, not regulatory requirements
4. **AERB/IAEA alignment:** Citations indicate alignment with guidance documents, not approval

---

## Planning-Grade vs Validated Components

### Planning-Grade (Not Validated)

**Nuclear Data:**
- Cross-section values in `isotopeRoutes.js` are conservative planning estimates
- Threshold energies are planning estimates where not verified
- Impurity cross-sections use planning estimates or heuristic defaults
- Atomic masses are standard atomic weights (not isotopic mass excess)
- Energy-dependent cross-section scaling uses empirical exponents (n = 1.5 for n,p, n = 2.0 for n,2n)

**Route Evaluations:**
- Feasibility classifications are analytical assessments
- Impurity risk assessments use qualitative heuristics (quantitative when data available)
- Route scoring is a comparative overlay (not validated against production data)
- D-T generator classifications are logical categorizations (no facility design)

**Regulatory Alignment:**
- AERB and IAEA citations indicate alignment with guidance documents
- Acceptance criteria are planning thresholds, not regulatory requirements
- No claims of regulatory approval or licensing

### Validated Components

**Physics Formulas:**
- Decay constant: λ = ln(2) / T₁/₂ (standard radioactive decay)
- Saturation factor: f_sat = 1 - exp(-λt) (standard activation equation)
- Reaction rate: R = N × σ × φ × f_shield (standard activation rate)
- Bateman equations: Single-step parent→daughter (standard decay chain)
- Self-shielding: f_shield = (1 - exp(-Σd)) / (Σd) (standard approximation)
- Solid angle: Ω = 2π(1 - d / sqrt(d² + r²)) (geometric calculation)

**Unit Consistency:**
- All formulas maintain explicit unit consistency
- Unit conversions are explicit and documented
- Calculations are deterministic (no randomness)

**Test Cases:**
- Lu-177 validation case verified against order-of-magnitude expectations
- Mo-99 → Tc-99m validation case verified against expected decay behavior
- Unit consistency verified through test case execution
- Atomic mass corrections verified (eliminates 1.5-2× systematic errors)

---

## Running Validation Test Cases

### Lu-177 Validation Test Case

**Purpose:** Validates no-carrier-added Lu-177 production via Lu-176(n,γ)Lu-177 reaction

**How to Run:**
1. Open `index.html` in a web browser
2. Click the "Load Lu-177 Test Case" button in the Input Parameters section
3. Check browser console (F12 → Console) for validation output
4. Review calculated values in the Results section

**Expected Behavior:**
- Decay constant λ ≈ 1.21e-6 s⁻¹
- Saturation factor at 5 days ≈ 0.40–0.45
- Activity at EOB ≈ tens to low hundreds of GBq
- Delivered activity ≈ ~90% of EOB activity
- No thermal derating triggered
- No damage derating triggered
- Console output shows "Lu-177 Validation: PASS" if all checks pass
- **Atomic mass:** Uses actual Lu atomic mass (174.97 amu) instead of placeholder 100 amu

**Test Parameters:**
- Half-life: 6.647 days
- Cross-section: 2090 barns (thermal)
- Enrichment: 0.75
- Source strength: 1.0e13 neutrons/s
- Target: Lu2O3 (9.42 g/cm³, 397.93 g/mol)
- Irradiation time: 5.0 days
- Non-limiting engineering parameters (high coolant flow, low damage rate)

**Validation Notes:**
- Test case now uses actual atomic masses (Lu: 174.97 amu)
- Production yield calculations corrected for atomic mass (eliminates ~1.75× error)
- Specific activity calculations corrected for atomic mass

### Mo-99 → Tc-99m Generator Validation Test Case

**Purpose:** Validates Mo-99 production and Tc-99m generator yield via Mo-98(n,γ)Mo-99 reaction

**How to Run:**
1. Open `index.html` in a web browser
2. Click the "Load Mo-99 → Tc-99m Generator Test Case" button in the Input Parameters section
3. Review the Parent–Daughter Activity vs Time chart
4. Check browser console for validation output

**Expected Behavior:**
- Parent (Mo-99) activity builds up during irradiation
- Daughter (Tc-99m) activity follows Bateman equation during irradiation
- Post-EOB: Parent decays, daughter activity peaks then decays
- Daughter activity evolution matches expected Bateman behavior
- Console output confirms test case loaded
- **Atomic mass:** Uses actual Mo atomic mass (95.95 amu) instead of placeholder 100 amu

**Test Parameters:**
- Parent half-life: 2.75 days (Mo-99)
- Daughter half-life: 0.25 days (Tc-99m, 6 hours)
- Branching ratio: 1.0
- Cross-section: 0.13 barns (thermal)
- Enrichment: 0.95
- Neutron flux: 1×10¹⁴ cm⁻² s⁻¹
- Irradiation time: 5.0 days

**Validation Notes:**
- Test case now uses actual atomic masses (Mo: 95.95 amu)
- Production yield calculations corrected for atomic mass (eliminates ~1.05× error)

---

## File Organization

### `/audit/physics/`
- `model.js` - Core physics calculations (decay, activation, Bateman, thermal, damage, uncertainty)
- `atomicMasses.js` - Atomic mass registry (NIST/IUPAC standard atomic weights)
- `limitations.js` - Model limitations registry (explicit documentation of missing physics)

### `/audit/routing/`
- `routes.js` - Legacy isotope route registry (IsotopeRouteRegistry)
- `isotopeRoutes.js` - Structured isotope route registry (ISOTOPE_ROUTES) with D-T generator classification
- `routeEvaluator.js` - Route evaluation logic (feasibility, impurity traps, quantitative assessment)

### `/audit/scoring/`
- `routeScoring.js` - Route scoring overlay (deterministic scoring, 0-5 scale)

### `/audit/regulatory/`
- `ui.js` - Contains regulatory acceptance check logic (evaluateAcceptance function)
  - AERB alignment codes (RF-R/SC-1 through RF-R/SC-5)
  - IAEA alignment references
  - Acceptance criteria thresholds

### `/audit/ui/`
- `ui.js` - User interface logic (input handling, chart updates, route explorer, limitations display)
- `charts.js` - Plotly chart definitions (no physics calculations)

### Root Audit Files
- `index.html` - Main HTML structure
- `css/style.css` - Styling definitions
- `README_AUDIT.md` - This document
- `AUDIT_CLOSURE.md` - Audit closure implementation summary
- `INDEPENDENT_REVIEW.md` - Independent nuclear engineering review (2024)

---

## Audit Closure Status

**Version 1.1.0** includes the following audit closure improvements:

### Critical Issues (CLOSED):
1. ✅ **Placeholder atomic masses replaced** - Uses actual NIST/IUPAC atomic masses
2. ✅ **Flux calculation inconsistency fixed** - Documented point-source geometry model

### Moderate Issues (PARTIALLY ADDRESSED):
3. ✅ **Energy-dependent cross-sections** - Optional feature (conservative default maintained)
4. ✅ **Quantitative impurity assessment** - Implemented (qualitative fallback when data unavailable)

### Documentation (COMPLETE):
5. ✅ **Limitations registry** - 10 limitations explicitly documented
6. ✅ **D-T generator classification** - All routes classified for feasibility analysis

**Reference:** See `AUDIT_CLOSURE.md` for detailed implementation summary.

---

## Notes for Auditors

1. **No code modifications:** This is a frozen snapshot. Do not modify code logic.

2. **Physics formulas are authoritative:** Formulas in `model.js` are documented as authoritative and should not be altered.

3. **Planning values clearly marked:** All planning-grade nuclear data is marked with `data_quality: "planning-conservative"` and explanatory notes.

4. **Regulatory disclaimers:** Multiple disclaimers throughout the codebase state that this is planning-level analysis, not regulatory approval.

5. **Test case validation:** Test cases verify order-of-magnitude correctness, not exact experimental validation.

6. **Deterministic calculations:** All calculations are deterministic (no randomness). Scoring is transparent with explicit thresholds.

7. **Unit consistency:** All formulas maintain explicit unit documentation. Unit conversions are explicit.

8. **Separation of concerns:** Physics (`model.js`) is separated from UI (`ui.js`) and charts (`charts.js`).

9. **Atomic masses:** Uses standard atomic weights (not isotopic mass excess). For enriched targets, use specific isotope mass if available.

10. **Flux geometry:** Uses point isotropic source + solid-angle interception model. Formula: `φ = (S × Ω) / A_target`.

---

## Limitations and Disclaimers

- **Not a licensed facility:** This digital twin is not a licensed facility
- **Planning tool only:** Intended for facility design and planning studies
- **No regulatory approval:** Does not constitute regulatory approval or facility licensing
- **No experimental validation:** Nuclear data values are planning estimates, not validated against experiments
- **No commercial guarantees:** Does not guarantee production yields or commercial viability
- **Simplified physics:** Uses simplified models (point source, uniform density, constant flux)
- **Single-step decay only:** Multi-step decay chains beyond parent→daughter are not modeled
- **No product burn-up:** Product isotope activation during irradiation is not modeled
- **No spatial gradients:** Flux, temperature, and damage gradients are not modeled
- **Planning-grade data:** All cross-sections and atomic masses are planning estimates

---

## Contact and Support

For questions about this audit snapshot, refer to:
- `AUDIT_CLOSURE.md` - Implementation summary
- `INDEPENDENT_REVIEW.md` - Independent review findings
- Main project documentation

**Important:** This audit snapshot is frozen. Do not modify code logic. For active development, use the main codebase outside the `/audit` directory.

---

## Version History

- **v1.1.0 (2024):** Post-audit closure snapshot
  - Atomic masses corrected (NIST/IUPAC values)
  - Flux calculation documented and consistent
  - Optional energy-dependent cross-sections
  - Quantitative impurity assessment
  - Limitations registry added
  - D-T generator classification added

- **v1.0.0 (2024):** Initial audit snapshot
  - Baseline physics implementation
  - Route evaluation system
  - Regulatory alignment framework
