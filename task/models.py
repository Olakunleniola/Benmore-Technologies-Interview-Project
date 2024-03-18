from django.db import models
from project.models import Project

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=350)
    completed = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )
    
    def __str__(self):
        return self.title[0:30]