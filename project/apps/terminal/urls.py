from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('terminal/search', views.search, name='search'),
    path('terminal/doc', views.doc, name='search'),
]
