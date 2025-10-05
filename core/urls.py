from django.urls import path
from . import views

urlpatterns = [
    path('core', views.IndexView.as_view()),
]