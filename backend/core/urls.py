from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name="home"),
    path('core', views.IndexView.as_view(), name="core"),
    path('core/submit/', views.scenario_view, name='core-submit'),
]