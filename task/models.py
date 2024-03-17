from django.db import models
from project.models import Project

# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    description = models.CharField(max_length=240)
    completed = models.BooleanField()
    pending = models.BooleanField()
    
    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )