from django.urls import path
from . import views

urlpatterns = [
    path('', views.DashboardView.as_view(), name="dashboard"),
    path('simulation', views.SimulationView.as_view(), name="simulation"),
]