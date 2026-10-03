# AASHRAY — Mitti Se Mausam Tak
### Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance
**Problem Statement:** SIH26051 • **Organization:** DRDO

---

## 🏛️ Project Overview
**AASHRAY** is a responsive web application designed for architects and shelter engineers to design climate-responsive shelters, simulate their 24-hour transient thermal dynamics, diagnose envelope heat-loss pathways, and obtain physics-backed design improvements using local earth materials.

### Core Workflow:
$$\text{DESIGN A SHELTER} \longrightarrow \text{SIMULATE THERMAL PERFORMANCE} \longrightarrow \text{UNDERSTAND THE RESULT} \longrightarrow \text{IMPROVE THE DESIGN}$$

---

## 🌿 Branding & Visual Identity
- **Name:** AASHRAY (*Shelter*)
- **Subtitle:** Mitti Se Mausam Tak (*From Local Soil to Climate Resilience*)
- **Tagline:** *"Design a shelter for its climate."*
- **Color Tokens:**
  - Deep Forest Green (`#064C42`) & Dark Teal (`#0B6257`)
  - Leaf Green (`#4CAF50`)
  - Earth Brown (`#9A4E16`)
  - Warm Cream (`#F8F7EF`) & Soft Mint (`#E6F2E7`)
  - Soft Blue (`#DDEEFF`) & Solar Yellow (`#FFF2A8`)

---

## 🚀 Quick Start Guide

### 1. Backend (Python + FastAPI)
```bash
# Install dependencies
pip install fastapi uvicorn pydantic pytest

# Run automated physics tests
python -m pytest backend/tests

# Start the simulation API server
python run_backend.py
# -> Running on http://localhost:8000 (Docs: http://localhost:8000/docs)
```

### 2. Frontend (React + TypeScript + Tailwind CSS + Three.js)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# -> Running on http://localhost:5173
```

---

## 🔬 Physics & Engineering Model

Governing 3D Transient Heat Diffusion:
$$\rho \cdot C_p \cdot \frac{\partial T}{\partial t} = \nabla \cdot (k \nabla T) + Q$$

Envelope Conduction & Sol-Air Boundary Balance:
$$Q_{\text{envelope}} = \sum U_i \cdot A_i \cdot (T_{\text{sol-air}, i} - T_{\text{indoor}})$$

Where:
- $\rho$: Density ($\text{kg/m}^3$)
- $C_p$: Specific Heat Capacity ($\text{J/kg}\cdot\text{K}$)
- $k$: Thermal Conductivity ($\text{W/m}\cdot\text{K}$)
- $U$: Thermal Transmittance ($\text{W/m}^2\text{K}$)
- $A$: Surface Area ($\text{m}^2$)
- $T_{\text{sol-air}}$: Sol-Air Temperature including solar radiation absorption ($\alpha \cdot I_{\text{global}} / h_{\text{out}}$)

---

## 📦 Application Pages & Features
1. **Home:** Architectural landing hero with interactive heat/wind cross-section diagram and 4-step workflow.
2. **Onboarding Wizard:** 5-step quick creator for first-time architects (Location $\rightarrow$ Typology $\rightarrow$ Dimensions $\rightarrow$ Materials $\rightarrow$ Compass Orientation).
3. **Dashboard:** Clean 2-card interface (*Design Your Shelter* & *Check Thermal Performance*) with active project status.
4. **Design Shelter Studio:** 2-column parametric studio with interactive Three.js 3D model, solar angles, wind vectors, heat arrows, and collapsible Advanced Engineering settings.
5. **Thermal Simulation:** Pre-flight checklist, custom initial temperature, and 6-stage animated physics solver.
6. **Simulation Results:** Mean & 2 AM night temperatures, peak heat loss kW, solar heat gain kWh, 24-hr Recharts temperature curve (with Sunset, 2 AM, Sunrise reference points), and component-wise heat-loss horizontal bar chart.
7. **Design Comparison:** Current vs. Recommended Design with calculated physical deltas and architectural explanations.
8. **Design Report:** Print-ready and exportable Architectural Thermal Performance Dossier with assumptions and limitations.
9. **About:** Philosophy, DRDO SIH26051 problem statement, physics methodology, and ANSYS integration architecture.

---

## 🔒 Data Transparency Notice
Simulation results are calculated by the **AASHRAY Reduced-Order Transient Thermal Engine** ($1\text{D}$ lumped parameter model) and labeled transparently in compliance with DRDO design evaluation guidelines. An ANSYS APDL/Fluent connector interface is integrated for cluster-based high-resolution meshing.
