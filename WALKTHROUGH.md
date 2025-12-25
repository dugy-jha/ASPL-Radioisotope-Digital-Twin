# Application Walkthrough: High-Fidelity Feasibility Evaluation

This document provides a high-fidelity walkthrough of the **Generic Radioisotope Production Digital Twin (v2.2.3)**. It covers five core operational modes using realistic engineering parameters and physics-based logic.

---

## Scenario A: Therapeutic Radioisotope (Lu-177 n.c.a.)
**Goal:** Evaluate the feasibility of producing No-Carrier-Added (n.c.a.) Lutetium-177 for medical therapy using a moderated neutron source.

### Step 1 — Pathway Selection
- **Select:** `Lu-177 (n.c.a., Lu-176(n,γ))`
- **Physics Status:** Notice the **RESONANCE_DOMINATED** and **PRODUCT_BURNUP_CRITICAL** warnings. This indicates that yield will be highly sensitive to the epithermal spectrum and irradiation time. Lu-177 has a massive resonance peak (~2090 barns at thermal).

### Step 2 — Source / Flux Definition
- **Source Type:** `Neutron Flux (Direct)` or `GDT Neutron Source`
- **Effective Flux:** `1.0e14` $\text{cm}^{-2}\text{s}^{-1}$ (Typical for a high-flux research reactor or advanced fusion source).
- **Flux Profile:** `thermal+epithermal` (Critical for resonance capture).

### Step 3 — Geometry & Target
- **Target Radius:** `1.5` cm
- **Target Thickness:** `0.2` cm (Thin target to minimize self-shielding losses).
- **Source Distance:** `25.0` cm (Typical standoff for moderated assembly).

### Step 4 — Operations & Logistics
- **Irradiation Time:** `7.0` days (Standard medical isotope cycle).
- **Processing Time:** `12.0` hours (Post-EOB cooling and chemical separation).
- **Transport Time:** `24.0` hours (Shipping to clinical site).

### Results Interpretation
- **Activity at EOB:** Expect ~10-100 GBq.
- **Feasibility:** If delivered activity exceeds 1 GBq, the **Feasibility Badge** will show a green **PASS**.
- **Burn-up Effect:** The internal physics applies **Product Burn-up**, slightly suppressing yield due to the high capture cross-section of Lu-177 itself.

---

## Scenario B: Mo-99/Tc-99m Generator System
**Goal:** Model the production of Mo-99 and its subsequent decay into Tc-99m for medical imaging.

### Step 1 — Pathway Selection
- **Select:** `Mo-99 (n,γ) -> Tc-99m`
- **Physics Status:** Notice the **GENERATOR_DELAY_SENSITIVE** warning.

### Step 2 — Source / Flux Definition
- **Source Type:** `Neutron Flux (Direct)`
- **Effective Flux:** `1.0e14` $\text{cm}^{-2}\text{s}^{-1}$ (Standard high-flux level).

### Step 3 — Geometry & Target
- **Target Radius:** `1.0` cm
- **Target Thickness:** `0.5` cm
- **Target Density:** `10.2` g/cm³ (Mo metal).

### Step 4 — Operations & Logistics
- **Irradiation Time:** `5.0` days (Optimized for Mo-99's 66-hour half-life).
- **Processing Time:** `8.0` hours.
- **Transport Time:** `12.0` hours.

### Advanced Visualization
- Open **Comparative Analytics** -> **Decay Chain Visualization**.
- Observe the Mo-99 (parent) and Tc-99m (daughter) activity curves. Observe Tc-99m reaching secular equilibrium with its parent.

---

## Scenario C: ASPL Project NECTAR (High-Fidelity Clinical Study)
**Goal:** Illustrate the dual-use "Split-Shift" model for decentralized Lu-177 production at a hospital site.

### Step 0 — Automatic Configuration
- **Click:** `ASPL Project NECTAR` in the "Test Cases & Study Scenarios" section.
- **Context:** This scenario implements the parameters from the ASPL proposal (22 Dec. 2025).

### Step 1 — Pathway Selection
- **Automatically Selected:** `LU177_NCA — Lu-177 n.c.a.`
- **Rationale:** Focuses on eliminating the "Decay Tax" for high-demand therapeutic isotopes.

### Step 2 — Source / Flux Definition
- **Source Type:** `Charged Particle Beam`
- **Beam Current:** `0.02` A (20 mA)
- **Beam Energy:** `0.3` MeV (300 keV)
- **Duty Cycle:** `0.583` (14 hours/day production shift)
- **Physics Rationale:** The high-current 20mA generator provides the high neutron source density needed to achieve near-reactor grade fluxes in a compact bunker.

### Step 3 — Geometry & Target
- **Source Distance:** `2.0` cm
- **Physics Rationale:** A compact geometry maximizes the solid-angle interception, utilizing every neutron generated in the high-current target.

### Step 4 — Operations & Logistics
- **Processing Time:** `4` hours
- **Transport Time:** `1` hour
- **Operational Rationale:** By co-locating with a hospital, the "Decay Tax" is reduced from ~50% (imported) to <5% (on-site).

### Manufacturing & Economics Review
- **CAPEX:** ₹100 Cr ($100M ROM).
- **Outcome:** Review the **Annual Cost Breakdown**. Notice how the dual-revenue model (BNCT therapy + Isotope sales) significantly improves the payback period compared to single-purpose facilities.

---

## Scenario D: Fast Neutron Cu-67 Production (D–T Advantage)
**Goal:** Use 14 MeV neutrons from a D–T generator to produce Cu-67 via $(n,p)$.

### Step 1 — Pathway Selection
- **Select:** `Cu-67 (Fast, Zn-67(n,p))`
- **Physics Status:** Notice **FAST_ONLY** and **RECOIL_LOSSES**.

### Step 2 — Source / Flux Definition
- **Source Type:** `D-T Generator`
- **Beam Current:** `50` mA (High-power generator target).
- **Acceleration Voltage:** `200` kV.

### Step 3 — Geometry & Target
- **Source-Target Distance:** `5.0` cm (Close-in geometry).
- **Target Radius:** `2.0` cm.
- **Target Thickness:** `0.1` cm.

### Results Interpretation
- Notice the **Flux modeling warning** if distance < 3x radius. This warns that the point-source approximation is becoming less accurate at this extreme proximity.

---

## Scenario E: GDT Neutron Source & Manufacturing Analysis
**Goal:** Engineering study for a Gas Dynamic Trap (GDT) fusion source and its commercial viability.

### Step 1 — Source Configuration
- **Source Type:** `GDT Neutron Source`
- **Fusion Power:** `10.0` MW
- **Duty Cycle:** `0.8` (80% plasma-on time).
- **Availability:** `0.7` (70% calendar uptime).
- **Wall Loading:** `2.0` $\text{MW/m}^2$.

### Step 2 — Manufacturing Inputs
- Scroll to **Manufacturing Analysis**.
- **CAPEX:** `50.0` M$ (Estimated pilot plant cost).
- **OPEX (Annual):** `5.0` M$.
- **Electricity Cost:** `0.12` $/kWh.

### Step 3 — Review Visualizations
- **Cost Breakdown:** Observe the ratio of CAPEX to OPEX.
- **Waste Stream:** View cumulative activity of long-lived impurities over 20 years.
- **Operations Timeline:** View the sequence of irradiation, cooling, and processing.

---

## Summary of Physics Guardrails
- **Self-Shielding:** Yield is automatically derated if target thickness or density is too high.
- **Thermal Limits:** Check **Engineering Guardrails** if flux levels trigger cooling warnings.
- **Radiation Damage:** High-flux runs trigger DPA (Displacements Per Atom) warnings, indicating structural risk.
