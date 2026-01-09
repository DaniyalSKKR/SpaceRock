from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view()),
    path('core', views.IndexView.as_view()),
]