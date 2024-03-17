from django.views.generic import TemplateView
from .models import Project
from django.http import JsonResponse
from django.shortcuts import render

class HomePage(TemplateView):
    http_method_names = ["get", "post"]
    template_name = "homepage.html"
    
    def get_context_data(self, **kwargs):
        context =  super().get_context_data(**kwargs)
        projects = Project.objects.all().order_by("-id") 
        context["projects"] = projects
        return context
    
    def post(self, request, *args, **kwargs):
        title = request.POST.get('title')
        project_image = request.FILES.get("image")
        
        print(title)
        if not title:
            return JsonResponse({'error': 'Name not provided'}, status=400)
        
        
        if project_image:
            if not self.verify_image(project_image):
                return JsonResponse({
                    'error': 'Invalid profile image. Only JPEG, PNG, and GIF files are allowed.'
                }, status=400)
        
        project = Project.objects.create(title=title)
        if project_image:
            project.image = project_image
        
        project.save()
        
        # Retrieve the project again to get its pk
        project = Project.objects.get(pk=project.pk)
        
        return render(
            request,
            "components/result.html",
            {
                "project": project,
                "show_link": True
            },
            content_type = "application/html"
        )
                
            

    @staticmethod
    def verify_image(image_file):
        allowed_types = ['image/jpeg', 'image/png', 'image/gif']

        # Check the content type of the image
        if image_file.content_type not in allowed_types:
            return False

        return True
    


