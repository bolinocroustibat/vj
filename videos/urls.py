from django.urls import re_path

from . import views

urlpatterns = [
	re_path(r"^(?P<theme_name>[-\w]+)$", views.index, name="index"),
]
