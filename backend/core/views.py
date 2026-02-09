from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView




from .models import Scenario, Meteor, Target

class SimulationView(TemplateView):
    template_name = 'core/simulation.html'

class DashboardView(TemplateView):
    template_name = "core/dashboard.html"

    def post(self, request):
        scenario = Scenario.objects.create(
            transient_diameter=request.POST.get("transient-diameter"),
            affected_radius=request.POST.get("affected-radius"),
            impact_coordinates=request.POST.get("impact-coords"),
            tsunami_risk=request.POST.get("tsunami-risk"),
        )

        Meteor.objects.create(
            scenario=scenario,
            name=request.POST.get("met-name"),
            diameter=request.POST.get("met-diameter"),
            velocity=request.POST.get("velocity"),
            density=request.POST.get("met-density"),
            angle=request.POST.get("impact-angle"),
        )

        Target.objects.create(
            scenario=scenario,
            name=request.POST.get("celestial-body"),
            gravity=request.POST.get("gravity"),
            density=request.POST.get("target-density"),
            material=request.POST.get("target-material"),
            material_strength=request.POST.get("material-str"),
            k1=request.POST.get("k1"),
            mu=request.POST.get("mu"),
            nu=request.POST.get("nu"),
        )

        return JsonResponse({
            "status": "ok",
            "scenario_id": scenario.id
        })



@method_decorator(csrf_exempt, name='dispatch')

def calcCollisionDiameter():
    #O’Brien, D. P., Marchi, S., & May, A. (2011). Impactor flux and cratering on Ceres and Vesta: implications for the early solar system, Astronomy & Astrophysics, 533, A13.

    # Geometry & kinematics

    # D — Transient crater diameter
    # d — Impactor (projectile) diameter
    # vᵢ — Impact velocity

    # Gravity & material properties

    # g — Gravitational acceleration of the target body
    # (Earth, Moon, Mars, asteroid, etc.)
    # ρₜ — Target density (p_t)
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

    # Gravity regime term [missing a piece]
    grav_reg = ((g * d) / (2 * (v_i ** 2))) * ((p_t / p_i) ** (2 * nu / mu))

    # Strength regime term
    str_reg = ((y_str/(p_t*(v_i**2)))**((2+mu)/2)) * ((p_t/p_i)**((nu*(2+mu))/mu))

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

