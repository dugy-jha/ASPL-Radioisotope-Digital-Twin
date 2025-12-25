# Radioisotope Digital Twin: Detailed Walkthrough

This document provides a high-fidelity walkthrough of the **Generic Radioisotope Production Digital Twin (v2.2.3)**. It covers three core operational modes using realistic engineering parameters and physics-based logic.

---

## Scenario 1: Therapeutic Radioisotope (Lu-177 n.c.a.)
**Goal:** Evaluate the feasibility of producing No-Carrier-Added (n.c.a.) Lutetium-177 using a moderated neutron source.

### Step 1 — Pathway Selection
- **Select:** `LU177_NCA — Lu-177 n.c.a.`
- **Physics Rationale:** This pathway utilizes the $^{176}\text{Lu}(n,\gamma)^{177}\text{Lu}$ reaction. 
- **Audit Note:** The registry locks the cross-section at ~2090 barns. Notice the **Pathway Warnings** indicating "Resonance Dominated" and "Product Burn-up Critical". This isotope has a huge resonance peak; yield will be highly sensitive to the epithermal spectrum.

### Step 2 — Source / Flux Definition
- **Source Type:** `Neutron Flux`
- **Flux ($\phi$):** `1e14` $\text{cm}^{-2}\text{s}^{-1}$
- **Duty Cycle:** `1.0` (Continuous)
- **Engineering Rationale:** $10^{14}$ is typical for a high-flux research reactor or a highly moderated advanced fusion source. 

### Step 3 — Geometry & Target
- **Target Radius:** `1.5` cm
- **Target Thickness:** `0.2` cm
- **Source Distance:** `5` cm (Close-in target)
- **Parent Density:** `9.42e22` $\text{atoms/cm}^3$ (Typical for Lu2O3 powder)
- **Engineering Rationale:** A small, thin target minimizes self-shielding while maximizing flux interception.

### Step 4 — Operations & Logistics
- **Application Context:** `Medical`
- **Irradiation Time:** `5` days
- **Processing Time:** `12` hours
- **Transport Time:** `24` hours
- **Physics Rationale:** Lu-177 has a ~6.6 day half-life. A 5-day irradiation reaches ~40% of saturation. Processing and transport delays are critical for medical isotopes.

### Results Interpretation
- **Activity at EOB:** Should show ~tens of GBq.
- **Feasibility:** If the delivered activity exceeds 1 GBq, the **Feasibility Badge** will show a green **PASS**. 
- **Burn-up Effect:** Because Lu-177 also has a high capture cross-section, the internal physics will apply **Product Burn-up**, slightly suppressing the final yield compared to a linear model.

---

## Scenario 2: Industrial Generator (Mo-99 Fast Route)
**Goal:** Evaluate Mo-99 production via the fast neutron $(n,2n)$ reaction using a D-T Generator.

### Step 1 — Pathway Selection
- **Select:** `MO99_FAST — Mo-99 (Fast Route)`
- **Physics Rationale:** Uses the $^{100}\text{Mo}(n,2n)^{99}\text{Mo}$ reaction, which requires 14.1 MeV neutrons from a D-T source.

### Step 2 — Source / Flux Definition
- **Source Type:** `Charged Particle Beam` (Simulating a beam-target D-T tube)
- **Beam Current:** `1e-3` A (1 mA)
- **Beam Energy:** `0.1` MeV (100 keV for D-T fusion)
- **Engineering Rationale:** High-power D-T generators operate in the 1-10 mA range.

### Step 3 — Geometry & Target
- **Target Radius:** `2.0` cm
- **Target Thickness:** `0.5` cm
- **Source Distance:** `3` cm
- **Engineering Rationale:** Since the $(n,2n)$ threshold is high (~8 MeV), the target must be placed as close as possible to the source before the 14 MeV neutrons lose energy.

### Step 4 — Operations & Logistics
- **Application Context:** `Industrial`
- **Irradiation Time:** `7` days
- **Processing Time:** `2` hours (Quick chemical strip)
- **Transport Time:** `48` hours

### Results Interpretation
- **Impurity Risk:** Look at the **Pathway Warnings**. It will likely show "Low Specific Activity". Because we are starting with stable Mo-100, the Mo-99 produced is chemically identical to the target, meaning we cannot easily achieve high specific activity.
- **Feasibility:** Will show **FEASIBLE WITH CONSTRAINTS** due to specific activity limits for medical use, though it passes for industrial screening.

---

## Scenario 3: Fusion Reactor Concepts (GDT Source)
**Goal:** Preliminary engineering study for a Gas Dynamic Trap (GDT) neutron source.

### Step 1 — Pathway Selection
- **Select:** `MO99_TC99M_GENERATOR` (Reactor Route)

### Step 2 — Source / Flux Definition
- **Source Type:** `GDT Trap (D-T Fusion)`
- **Fusion Power:** `10` MW
- **Wall Loading:** `2.0` $\text{MW/m}^2$
- **Availability:** `0.85` (Typical industrial uptime)
- **Engineering Rationale:** 10 MW fusion power is a common design target for compact GDT mirrors.

### Step 3 — Geometry & Target
- **Target Radius:** `10.0` cm (Large area blanket)
- **Target Thickness:** `1.0` cm
- **Source Distance:** `50` cm (First wall radius)

### Results Interpretation
- **Effective Yield:** The GDT module converts the 10 MW power ($~3.5 \times 10^{18} \text{ n/s}$) and derates it based on wall loading and uptime.
- **Feasibility:** This provides an "order-of-magnitude" estimate of whether a 10 MW fusion mirror can replace a traditional fission reactor for Mo-99 production.

---

## Scenario 4: Manufacturing & Economics
**Goal:** Determine the annual production cost per GBq for the GDT scenario.

1.  **Open:** `Manufacturing & Economics` collapsible section.
2.  **Facility Capital Cost:** `$100,000,000` (Typical for a compact fusion plant).
3.  **Annual Operating Cost:** `$15,000,000`.
4.  **Electricity Cost:** `$0.12` /kWh.
5.  **Review Visualizations:**
    - **Cost Breakdown:** Shows the dominance of Capital vs. Operating costs.
    - **Waste Stream:** Projects the total activity accumulation over 20 years.
    - **Engineering Status:** Verify if the **Thermal Utilization** or **Damage Utilization** exceeds 100% (indicating target failure).

---

## Summary of Safeguards
In all scenarios, keep an eye on the **Top Banner**. If you attempt to change a locked cross-section in the "Advanced Inputs" section, the system will prevent the change and remind you that the **Physics is Locked** for comparative analysis.

