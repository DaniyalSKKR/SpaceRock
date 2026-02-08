# Meteor Madness — Interactive Impact Simulation

Meteor Madness is an interactive, browser-based asteroid impact simulator built with **Django**, **JavaScript**, **Bootstrap**, **Three.js**, and **Leaflet**.  
It allows users to explore hypothetical impact scenarios, visualize trajectories and impact locations, and estimate physical effects such as kinetic energy, crater size, and blast radius.

> ⚠️ This project is **educational and exploratory**. Physics models are simplified approximations, not authoritative hazard predictions.

---
<img width="1107" height="956" alt="image" src="https://github.com/user-attachments/assets/25d12844-b9a4-4a31-a77c-463f56f8cfc9" />

---
## Features

- 🌍 **Interactive impact simulation**
  - Adjustable meteor diameter, density, velocity, and impact angle
  - Optional mitigation via delta-v (kinetic impactor / gravity tractor)

- ⚛️ **Physics-based estimates**
  - Kinetic energy (TNT equivalent)
  - Angle-dependent energy coupling
  - Transient crater diameter (π-scaling approximation)
  - Blast / affected radius (cube-root energy scaling)

- 🛰️ **Visualizations**
  - 3D trajectory preview (Three.js) 
  - Impact location mapping (Leaflet / OpenStreetMap) (ongoing)

- 💾 **Scenario saving**
  - Save simulation inputs via Django backend
  - Designed for future data integration (NASA NEO, USGS) (ongoing)

- 🎨 **Clean UI**
  - Responsive Bootstrap layout
  - Expandable density ↔ mass / volume controls
  - Accessible, readable dashboard design

---

## Tech Stack

**Frontend**
- HTML5 / CSS3
- Bootstrap 5
- Vanilla JavaScript
- Three.js (3D visualization)
- Leaflet.js (mapping)

**Backend**
- Django (Python)

---

## Physics Overview (Simplified)

The simulation uses approximate, well-known scaling relations:

- **Volume (sphere)**  
  `V = (4/3) π r³`

- **Mass**  
  `m = ρ V`

- **Kinetic Energy**  
  `KE = ½ m v²`

- **Energy Conversion**  
  `1 Mt TNT = 4.184 × 10¹⁵ J`

- **Vertical coupling**  
  Energy and crater formation depend on  
  `v_eff = v · sin(θ)`

- **Crater Diameter**  
  Based on simplified Schmidt–Housen / Holsapple π-scaling laws  
  (gravity + strength regimes combined)

> Atmospheric effects, fragmentation, ablation, seismic coupling, and detailed ejecta modeling are **not yet** included.
