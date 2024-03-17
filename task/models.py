from django.db import models
from project.models import Project

class Task(models.Model):
    title = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    pending = models.BooleanField(default=True)
    
    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )