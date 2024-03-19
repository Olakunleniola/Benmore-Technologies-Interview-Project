from django.db import models
from sorl.thumbnail import ImageField
from cloudinary.models import CloudinaryField
from ProjectPlanner.settings import DEBUG

class Project (models.Model):
    title = models.CharField(max_length=240)
    date = models.DateTimeField(auto_now_add=True)
    if DEBUG:
        image = ImageField()
    else:
        image = CloudinaryField('image')
    
    def __str__(self):
        return self.title[0:20]