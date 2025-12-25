# System Requirements & Concept of Operations (CONOPS)
## Generic Radioisotope Production Digital Twin (v2.2.1)

### 1. Stakeholder Requirements (SR)
- **SR-01 (Physics Defensibility):** The model MUST utilize standard nuclear engineering formulations (Bateman, Saturation, Self-shielding) that are auditable and transparent.
- **SR-02 (Comparative Analysis):** The tool MUST facilitate the comparative ranking of production routes using a frozen physics registry to prevent parameter bias.
- **SR-03 (Operational Realism):** Output activity MUST account for post-irradiation processing delays and default chemistry yield losses (Planning-Grade).
- **SR-04 (Safety/Regulatory Guardrails):** The system MUST issue warnings for regimes where the planning-grade approximations (Point-source, Thermal-only) may significantly over- or under-estimate yields.

### 2. Concept of Operations (CONOPS)
- **User Profile:** Radioisotope engineers and facility planners conducting early-stage feasibility screening.
- **Mission Scenario:** 
    1. Select a locked isotope pathway (e.g., Lu-177 n.c.a.).
    2. Configure the neutron source (D-T Generator or GDT Trap).
    3. Define target geometry and placement.
    4. Set operations (irradiation, processing, transport).
    5. Review the feasibility "Badge" and delivered activity estimate.
    6. (Optional) Analyze manufacturing cost/waste streams for the selected configuration.

### 3. System Requirements (SyRD)
- **SY-01 (Bateman Networks):** Support general N-parent branching decay chains.
- **SY-02 (Burn-Up):** Apply self-shielded product burn-up during irradiation.
- **SY-03 (Source Integration):** Unify engineering parameters from multiple source types (D-T, GDT) into an effective neutron yield.
- **SY-04 (Chemistry Yield):** Enforce a conservative default yield (85%) for chemically separable routes unless explicitly overridden.
- **SY-05 (Output Hygiene):** Annotate all numeric outputs as "order-of-magnitude estimates" to prevent over-trust.

### 4. Interface Control Document (ICD) - Highlights
- **ICD-PATHWAY:** `ISOTOPE_PATHWAYS` serves as the authoritative, frozen registry for production reaction physics.
- **ICD-MODEL-STATE:** UI components MUST pass a unified `modelState` object to calculation kernels.
- **ICD-SOURCE:** Source modules (e.g., `gdtSource.js`) MUST return a standardized interface: `{ instantaneousYield, timeAveragedYield, effectiveYield }`.
- **ICD-OUTPUT:** Result display components MUST consume a common response object containing `activityEOB`, `activityDelivered`, and `feasibility`.

### 5. Implementation Roadmap
- [x] v2.2.0: Multi-parent Bateman & Product Burn-up.
- [x] v2.2.1: Canonical Pathways, Physics Lock, and GDT/Manufacturing Modules.
- [ ] v2.2.2: Formalize Source ICD and input validation (Next Step).

