# Generic Radioisotope Production Digital Twin

**Version:** 2.2.1  
**Release Notes:** Canonical isotope pathways introduced. Physics locked. Comparative-only analysis supported.

A planning-grade, physics-based calculation tool for radioisotope production using neutron activation and charged-particle reactions. This digital twin provides deterministic, order-of-magnitude estimates for feasibility screening and comparative route analysis.

---

## ⚠️ Important Disclaimers

**This is a PLANNING-GRADE tool only.**

- Results are **order-of-magnitude estimates**
- Does **not** provide production guarantees
- Does **not** constitute regulatory licensing approval
- Intended for **feasibility screening and comparative analysis**
- Structural uncertainties (flux geometry, spectra, burn-up physics) may exceed parameter uncertainty bands

**Physics pathways are locked** - Only source, moderator, and target geometry parameters may be changed.

---

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser
- Internet connection for CDN resources (Plotly.js, MathJax)

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dugy-jha/ASPL-Radioisotope-Digital-Twin.git
   cd ASPL-Radioisotope-Digital-Twin
   ```

2. **Start a local web server:**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js (if you have http-server installed)
   npx http-server -p 8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### GitHub Pages Deployment

The application is designed to work with GitHub Pages. Simply push to the repository and enable GitHub Pages in repository settings.

---

## 📋 Features

### Core Capabilities

- **Radioisotope Production Calculations**
  - Neutron activation reactions (n,γ)
  - Charged-particle reactions (n,p), (n,2n)
  - Multi-step Bateman decay chains (including branching networks)
  - Product and parent isotope burn-up effects

- **Physics Models**
  - Decay constant calculations
  - Saturation factor modeling
  - Reaction rate calculations with self-shielding
  - Time-dependent flux profiles (constant, duty-cycle, ramp, step)
  - Spatial flux distribution (circular targets, solid-angle geometry)
  - Epithermal resonance integrals

- **Engineering Constraints**
  - Thermal derating (coolant flow, heat capacity)
  - Radiation damage accumulation (DPA limits)
  - Post-irradiation decay during processing and transport
  - Chemistry yield losses

- **Route Evaluation**
  - Feasibility classification (Feasible, Feasible with constraints, Infeasible)
  - Activity viability thresholds (medical, industrial, research)
  - Impurity risk assessment
  - Regulatory alignment checks (AERB, IAEA)

- **Comparative Analytics**
  - Activity vs. irradiation time plots
  - Specific activity comparisons
  - Route ranking and scoring
  - Uncertainty propagation (parametric Monte Carlo)

### Isotope Pathways

The tool includes a canonical registry of isotope production pathways:

- **Generator Systems**: Mo-99 → Tc-99m, W-188 → Re-188
- **Therapeutic n,γ Isotopes**: Lu-177 (n.c.a.), Ho-166
- **Fast Neutron Routes**: Cu-67, Sc-47 (D-T advantage)
- **Industrial Isotopes**: Mo-99 (fast route)
- **Actinide/Strategic Routes**: Th-232 → U-233, U-238 → Pu-239

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES2020)
- **Visualization**: Plotly.js 2.26.0
- **Math Rendering**: MathJax 3.0
- **No Build Process**: Runs directly in browser (GitHub Pages compatible)

### Project Structure

```
ASPL-Radioisotope-Digital-Twin/
├── index.html              # Main application entry point
├── css/
│   ├── style.css           # Main stylesheet
│   └── uswds-inspired.css  # Additional styling
├── js/
│   ├── model.js            # Core physics calculations (LOCKED)
│   ├── advancedPhysics.js  # Advanced features (LOCKED)
│   ├── routeEvaluator.js   # Route feasibility evaluation
│   ├── routeScoring.js     # Route ranking and scoring
│   ├── charts.js           # Plotly visualization wrapper
│   ├── ui.js               # UI event handling and DOM manipulation
│   ├── isotopeRoutes.js    # Isotope route definitions
│   ├── limitations.js      # Model limitations registry
│   ├── atomicMasses.js    # Atomic mass lookup table
│   ├── coreSanity.js       # Core physics sanity tests
│   └── mo99Sanity.js       # Mo-99 pathway validation
├── routing/
│   └── isotopePathways.js  # Canonical isotope pathways registry (FROZEN)
└── audit/                  # Frozen audit snapshot
    ├── README_AUDIT.md
    ├── physics/
    ├── routing/
    ├── scoring/
    ├── regulatory/
    ├── ui/
    ├── data/
    └── tests/
```

### Module Separation

The codebase follows strict separation of concerns:

- **Physics Layer** (`model.js`, `advancedPhysics.js`): Pure calculations, no DOM access
- **Evaluation Layer** (`routeEvaluator.js`, `routeScoring.js`): Route analysis and ranking
- **UI Layer** (`ui.js`, `charts.js`): Event handling and visualization only
- **Data Layer** (`isotopeRoutes.js`, `isotopePathways.js`): Route and pathway definitions

**Physics files are LOCKED** - Do not modify without full revalidation.

---

## 📖 Usage Guide

### Basic Workflow

1. **Select Application Context**
   - Medical (viable ≥ 1 GBq)
   - Industrial (viable ≥ 0.1 GBq)
   - Research (viable ≥ 0.01 GBq)

2. **Choose Source Type**
   - Neutron Flux: Enter flux value (cm⁻² s⁻¹)
   - Charged Particle Beam: Enter current, charge, energy

3. **Set Target Geometry**
   - Target radius (cm)
   - Target thickness (cm)
   - Source-to-target distance (cm)

4. **Set Irradiation Duration**
   - Time in days

5. **View Results**
   - Activity at end-of-bombardment (EOB)
   - Delivered activity (after processing and transport)
   - Feasibility classification
   - Acceptance criteria status

### Isotope Route Explorer

The Route Explorer allows you to:
- Browse isotope production routes by category
- View route-specific physics parameters (locked)
- See feasibility evaluations for each route
- Compare routes side-by-side

**Note:** Physics parameters (cross-sections, decay chains, chemistry yields) are locked and cannot be modified. Only source, moderator, and geometry parameters are adjustable.

### Test Cases

Pre-configured test cases are available:
- **Lu-177 Test Case**: No-carrier-added Lu-177 production via Lu-176(n,γ)
- **Mo-99 → Tc-99m Generator**: Mo-99 production and Tc-99m generator yield

These can be loaded from the "Advanced Parameters" collapsible section.

---

## 🔬 Physics Model

### Core Equations

**Decay Constant:**
```
λ = ln(2) / T₁/₂
```

**Saturation Factor:**
```
f_sat = 1 - e^(-λt_irr)
```

**Reaction Rate:**
```
R = N_parent × σ × φ × f_shield
```

**Atoms at EOB:**
```
N_EOB = (R × f_sat) / λ
```

**Activity:**
```
A = λ × N
```

**Self-Shielding:**
```
f_shield = (1 - e^(-Σd)) / (Σd)
```

**Bateman Equation (Parent→Daughter):**
```
N_d(t) = N_p × BR × (λ_p/(λ_d - λ_p)) × (e^(-λ_p t) - e^(-λ_d t))
```

### Assumptions

- Point source geometry
- Uniform target density
- Constant flux/beam current (or time-dependent profiles)
- Exponential decay for chemistry losses
- Uncorrelated uncertainties (RSS propagation)
- Circular target geometry (for spatial flux)

### Limitations

See the "Model Scope & Limitations" section in the application for detailed limitations. Key points:

- **Planning-grade only**: Order-of-magnitude estimates
- **No transport solvers**: MCNP/Serpent not included (export interfaces provided)
- **No CFD**: Thermal boundary conditions can be exported
- **No licensing approval**: Planning tool only
- **No production guarantees**: Results are estimates

---

## 🧪 Validation

The model has been validated against:

- **Lu-177 Production**: No-carrier-added Lu-177 via Lu-176(n,γ)Lu-177
- **Mo-99 → Tc-99m Generator**: Mo-98(n,γ)Mo-99 with Tc-99m daughter decay

Validation confirms:
- Unit consistency
- Correct saturation behavior
- Proper decay chain handling
- Order-of-magnitude agreement with expected values

**Note:** Validation is for feasibility comparison only, not yield guarantees.

---

## 🔒 Physics Lock

**Physics pathways are frozen** to ensure comparative analysis integrity:

- Cross-sections cannot be modified
- Decay chain parameters are locked
- Chemistry yields are enforced (default 85% if not specified)
- Product burn-up cross-sections are data-dependent

Only the following can be adjusted:
- Source parameters (flux, beam current)
- Moderator efficiency
- Target geometry (radius, thickness, distance)
- Irradiation duration
- Engineering constraints (coolant flow, damage limits)

---

## 📊 Regulatory Alignment

The tool aligns with:

- **AERB (India)**: Radioisotope Production Purity, Thermal Safety Limits, Radiation Damage Limits, Activity Delivery Requirements, Uncertainty Quantification
- **IAEA**: Safety standards, technical reports, and safety guides

**Important:** Alignment does not constitute regulatory approval. Users must obtain appropriate regulatory approvals independently.

---

## 🛠️ Development

### Code Standards

- **Deterministic**: Identical inputs produce identical outputs
- **Unit-consistent**: All calculations maintain explicit units
- **Auditable**: All formulas are readable and traceable
- **Regulator-safe**: Clear scope boundaries and disclaimers

### Testing

Core physics sanity tests are available:
- `coreSanityTest()`: Basic decay and saturation calculation
- `modelSelfTest()`: Model.js self-validation
- `mo99Sanity()`: Mo-99 pathway validation

Run tests in browser console:
```javascript
import('./js/coreSanity.js').then(m => console.log(m.coreSanityTest()));
import('./js/model.js').then(m => console.log(m.modelSelfTest()));
import('./js/mo99Sanity.js').then(m => console.log(m.mo99Sanity()));
```

### Contributing

**Physics files are LOCKED** - Do not modify without full revalidation:
- `js/model.js`
- `js/advancedPhysics.js`
- `js/coreSanity.js`
- `js/mo99Sanity.js`
- `routing/isotopePathways.js` (FROZEN with audit lock)

UI improvements, documentation, and bug fixes are welcome. Please ensure:
- No changes to physics calculations
- All tests pass
- Deterministic behavior preserved
- Unit consistency maintained

---

## 📝 Version History

### v2.2.1 (Current)
- Canonical isotope pathways introduced
- Physics locked for comparative analysis
- Chemistry yield enforcement (no implicit 1.0)
- Self-shielded product burn-up
- UI refactoring for clarity

### v2.2.0
- Multi-step Bateman decay fix (branching support)
- Product burn-up integration (data-dependent)
- Flux geometry warnings
- Resonance-dominated isotope warnings

### v2.1.1
- Numerical clarity & stability hardening
- Epithermal resonance integral unit clarification
- Matrix exponential stability guard
- Trapezoidal integration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Important Disclaimers:**
- This software is a planning-grade tool for feasibility screening only
- Results are order-of-magnitude estimates
- Does not provide production guarantees or regulatory licensing approval
- Users must obtain appropriate regulatory approvals independently
- See LICENSE file for full disclaimers and limitations

---

## 📧 Contact & Support

For issues, questions, or contributions, please use the GitHub Issues system.

**Important Reminders:**
- This is a planning-grade tool
- Results are order-of-magnitude estimates
- No production guarantees or licensing approval
- Physics pathways are locked for comparative analysis

---

## 🙏 Acknowledgments

Built with:
- [Plotly.js](https://plotly.com/javascript/) - Scientific visualization
- [MathJax](https://www.mathjax.org/) - Mathematical equation rendering

Physics models based on established nuclear engineering principles and published formulas.

