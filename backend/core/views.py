from django.shortcuts import render
from django.http import HttpResponse
from datetime import datetime
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

# Create your views here.

class HomeView(TemplateView):
    template_name = 'core/home.html'

class IndexView(TemplateView):
    template_name = 'core/index.html'
    extra_content = {'today':datetime.today()}