from django.urls import path
from . import views

app_name = "project"

urlpatterns = [
    path("", views.HomePage.as_view(), name="index" ),
    path("<int:pk>/", views.EditDeleteProject.as_view(), name="edit_delete"),
    path("<int:pk>/task", views.CreateTask.as_view(), name="add_task"),
    path("*", views.Show404Page.as_view(), name="404")
]
