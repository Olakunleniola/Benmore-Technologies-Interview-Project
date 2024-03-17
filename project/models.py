from django.db import models
from sorl.thumbnail import ImageField

class Project (models.Model):
    text = models.CharField(max_length=240)
    date = models.DateTimeField(auto_now_add=True)
    image = ImageField()