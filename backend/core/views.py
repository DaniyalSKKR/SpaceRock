from django.shortcuts import render
from django.http import HttpResponse
from datetime import datetime
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Scenario, Meteor, Target

class HomeView(TemplateView):
    template_name = 'core/home.html'

class IndexView(TemplateView):
    template_name = 'core/index.html'
    extra_content = {'today':datetime.today()}

def scenario_view(request):
    if request.method == "POST":
        met_name = request.POST.get('met-name') or 'Impactor'
        met_density = request.POST.get('met-density')
        met_velocity = request.POST.get('velocity')
        met_angle = request.POST.get('impact-angle')
        met_diameter = request.POST.get('met-diameter')

        scenario = Scenario.objects.create()

        meteor = Meteor.objects.create(
            scenario = scenario,
            name     = met_name,
            diameter = met_diameter,
            velocity = met_velocity,
            density  = met_density,
            angle    = met_angle,
        )

        target = Target.objects.create(
            scenario=scenario,
            name="Earth",
            gravity=9.81,
            density=5500,
            k1 = request.POST.get('k1'),
            mu = request.POST.get('mu'),
            nu = request.POST.get('nu'),
            material="rock",
            material_strength=700000
        )

        return render(request, "core/index.html")
    
    return render(request, "core/index.html")

        # Add material later

def calcCollisionDiameter():
    #O’Brien, D. P., Marchi, S., & May, A. (2011). Impactor flux and cratering on Ceres and Vesta: implications for the early solar system, Astronomy & Astrophysics, 533, A13.

    # Geometry & kinematics

    # D — Final crater diameter
    # d — Impactor (projectile) diameter
    # vᵢ — Impact velocity

    # Gravity & material properties

    # g — Gravitational acceleration of the target body
    # (Earth, Moon, Mars, asteroid, etc.)
    # ρₜ — Target density
    # (density of the surface being hit)
    # ρᵢ — Impactor density
    # (density of the asteroid/meteor)
    # Y — Target material strength (y_str)
    # (tensile or compressive strength of the surface material)

    # Scaling constants (empirical)
    # These depend on whether the target is rock, sand, ice, regolith, etc.

    # K₁ — Dimensionless scaling constant
    # μ — Gravity-scaling exponent
    # ν — Density-scaling exponent (nu)

    # Typical values for rocky (non-porous) targets:

    # μ ≈ 0.55
    # ν ≈ 0.40
    # K₁ ≈ 0.93
    # (Values differ for sand, soil, ice, porous rock, etc.)

    d = None
    v_i = None
    g = 9.81
    p_t = None
    p_i = None
    y_str = None
    k_1 = None
    mu = None
    nu = None

    # Pre-factor
    pre_fac = d*k_1

    # Gravity regime term
    grav_reg = ((g*d)/(2*(v_i**2)))

    # Strength regime term
    str_reg = (y_str/(p_t*(v_i**2)))**((2+mu)/2) * (p_t/p_i)**((nu*(2+mu))/mu)

    # Exponent
    exp = ((-1)*mu)/(2+mu)

    if None in [d, v_i, p_t, p_i, y_str, k_1, mu, nu]:
        raise ValueError("All input parameters must be set before computing crater diameter.")

    # Crater Diameter
    c_diam = pre_fac*((grav_reg+str_reg)**exp)

    pass

def calcTsunamiRisk():
    pass

def calcSeismicMagnitude():
    pass

