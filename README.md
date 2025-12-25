# Generic Radioisotope Production Digital Twin

**Version:** 2.2.3  
**Release Note:** Robust UI Initialization, Unified Source ICD, and GDT Trap Integration.

A high-fidelity, planning-grade digital twin for radioisotope production using neutron activation and charged-particle reactions. This tool provides deterministic physics-first calculations for feasibility screening, route comparison, and manufacturing analysis for next-generation neutron sources (D-T Generators, GDT Traps).

---

## ⚠️ Important Disclaimers

**This is a PLANNING-GRADE tool ONLY.**

- **Numerical Outputs:** Results are order-of-magnitude estimates intended for screening.
- **No Guarantees:** Does not provide production guarantees or commercial commitments.
- **Regulatory Status:** Does NOT constitute licensing approval. 
- **Structural Uncertainty:** Errors in flux geometry, spectra, and simplified burn-up physics may exceed parameter uncertainty bands.
- **Audit Requirement:** Outputs must be audited by qualified nuclear engineers before use in facility design.

---

## 🚀 Key Capabilities

### 1. Nuclear Production Physics
- **Reaction Rate Kernel:** Standard $R = N \sigma \phi f_{shield}$ formulation with self-shielding.
- **Multi-Step Decay:** General N-parent branching Bateman decay networks (Matrix Exponential approach).
- **Burn-Up Physics:** Self-shielded product and parent burn-up (optional data-dependent field).
- **Resonance Integrals:** Epithermal resonance modeling using effective integral approximations.

**[Read the Full Operational Walkthrough here](WALKTHROUGH.md)**

### 2. Neutron Source Modeling (ICD-SOURCE)
- **Standard Flux:** Direct input of neutron flux at the target plane.
- **D-T Generators:** Point-source solid-angle geometry for fusion neutron tubes.
- **GDT Trap (v2.2.1+):** Engineering-level model for Gas Dynamic Trap fusion sources, converting MW fusion power, wall loading, and duty cycle into effective target yield.
- **Charged Particle Beams:** Beam current, energy, and particle charge conversion to effective activation rates.

### 3. Systems Engineering & Operations
- **Feasibility Classification:** Automates "Feasible", "Constrained", or "Not Recommended" based on activity thresholds and impurity risks.
- **Chemistry & Logistics:** Enforced default 85% yield for chemically separable routes; accounts for processing and transport decay.
- **Manufacturing Analysis:** Integrated module for Cost (CAPEX/OPEX), Waste Stream (activity accumulation), and Electricity Consumption.

---

## 🛠️ Technology Stack

- **Engine:** Vanilla JavaScript (ES2020) - Zero dependencies for core physics.
- **Visualization:** [Plotly.js 2.26.0](https://plotly.com/javascript/)
- **Mathematics:** [MathJax 3.0](https://www.mathjax.org/) (LaTeX rendering).
- **Styling:** USWDS-inspired (U.S. Web Design System) accessible layout.
- **Compatibility:** GitHub Pages, Chrome, Safari, Edge, Firefox.

---

## 📁 Project Structure

```text
ASPL-Radioisotope-Digital-Twin/
├── index.html              # Main App & USWDS Scaffold
├── REQUIREMENTS.md         # SyRD, CONOPS, and ICD Definitions
├── LICENSE                 # Apache 2.0 + Commons Clause
├── js/
│   ├── model.js            # Core Physics Kernel (LOCKED)
│   ├── routeEvaluator.js   # Unified Evaluation ICD
│   ├── routeScoring.js     # Comparative Metrics
│   ├── ui.js               # Event Wiring & DOM Orchestration
│   ├── isotopeRoutes.js    # Data Definitions (Legacy Fallback)
│   ├── sources/            # GDT and Source Modules
│   └── manufacturing/      # Economics & Waste Analysis
├── routing/
│   └── isotopePathways.js  # CANONICAL REGISTRY (FROZEN)
└── audit/                  # Read-only physics snapshot for regulatory review
```

---

## 🔬 Interface Control (ICDs)

This project follows a strict systems-engineering approach to data flow:

- **ICD-PATHWAY:** `ISOTOPE_PATHWAYS` is the authoritative registry. Cross-sections, thresholds, and branching ratios are frozen to prevent bias.
- **ICD-MODEL-STATE:** The UI passes a unified `modelState` object to the `RouteEvaluator`.
- **ICD-SOURCE:** Source modules must return `{ instantaneousYield, timeAveragedYield, effectiveYield }`.
- **ICD-OUTPUT:** The `RouteEvaluator` returns a comprehensive result object including EOB activity, delivered activity, and impurity risk.

---

## 🧪 Validation & Testing

Core physics are validated against:
1. **Lu-177 (n.c.a.)**: Validates high-cross-section thermal capture and self-shielding.
2. **Mo-99 (Generator)**: Validates parent-daughter Bateman chains and secular equilibrium.

Run Sanity Tests in Browser Console:
```javascript
// Run minimal physics kernel test
import('./js/coreSanity.js').then(m => console.log(m.coreSanityTest()));
```

---

## 🤝 Contributing & License

### License
This project is licensed under **Apache 2.0 + Commons Clause**. 
- You are free to use, modify, and distribute for engineering/research purposes.
- You **may NOT sell** the software or its primary functionality as a service.
- See the [LICENSE](LICENSE) file for full additional terms and nuclear disclaimers.

### Contributing
We use a **Developer Certificate of Origin (DCO)**. All commits must include a `Signed-off-by` line.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full policy.

---

## 🙏 Acknowledgments
Physics models are based on established nuclear engineering principles (Lamarsh, Duderstadt & Hamilton). Data sourced from planning-grade estimates (ENDF/B-VIII.0, TENDL-2019).
