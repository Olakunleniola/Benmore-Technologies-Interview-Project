from django.views.generic import TemplateView
from django.views import View
from .models import Project
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Count, Case, When, F, Q, ExpressionWrapper, FloatField
from task.models import Task
from django.http import QueryDict, HttpResponse
from django.http.multipartparser import MultiPartParser


# Helper Function
def verify_image(image_file):
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    # Check the content type of the image
    if image_file.content_type not in allowed_types:
        return False
    return True
# helper function to render context data
def render_context(request,query_set):
    context = {"projects": query_set, "no_of_result": query_set.count()}  
    return render(
        request,
        "components/result_component.html",
        context,
        content_type = "application/html"
    )
# helper function to annotate a single queryset
def annotate_single_queryset(queryset):
    queryset.total_tasks = queryset.task_set.count()
    queryset.completed_tasks = queryset.task_set.filter(completed=True).count()
    queryset.incomplete_tasks = queryset.task_set.filter(completed=False).count()
    if queryset.total_tasks > 0:
        queryset.completion_percentage = (queryset.completed_tasks / queryset.total_tasks) * 100
    else:
        queryset.completion_percentage = 0
    return queryset

# Handle POST and GET request for index routes  '/' and request query parameters
class HomePage(TemplateView):
    
    http_method_names = ["get", "post"]
    template_name = "homepage.html"
    
    # provide context data for the homepage.html  (/projects)
    def get_context_data(self, **kwargs):
        context =  super().get_context_data(**kwargs)
        projects = self.get_annotated_projects(Project.objects.all())
        context["projects"] = projects
        context['no_of_result'] = projects.count()
        return context
        
    # handle routes for query parameters for /projects?query="query and /projects?percentage="above_50"
    def get(self, request, *args, **kwargs):
        # Check if 'name' parameter is present in the request query
        query = request.GET.get('query')
        status = request.GET.get('percentage')
        
        if status:
            try:
                projects = self.get_annotated_projects(Project.objects.all())
                if status == 'all':
                    return render_context(request, projects)
                
                elif status == 'above_50':
                    projects_status_above_50_percent = projects.filter(completion_percentage__gte=50, completion_percentage__lt=100)
                    return render_context(request, projects_status_above_50_percent)
                
                elif status == 'below_50':
                    projects_status_below_50_percent = projects.filter(Q(completion_percentage__lt=50) | Q(total_tasks=0))
                    return render_context(request, projects_status_below_50_percent)
                    
                elif status == 'completed':
                    projects_completed = projects.filter(completion_percentage__gte=100)
                    return render_context(request, projects_completed)
                
                return JsonResponse({"error": "ascsfsfsd"}, status=400)
                    
            except:
                JsonResponse({"error":"something broke"}, status=400)
        
        elif query:
            # Get project by name
            try:
                query = query.lower()
                projects = Project.objects.filter(title__icontains=query)
                if not projects.exists():
                    return JsonResponse({'error': 'No projects found for the given query'}, status=404)
                projects = self.get_annotated_projects(projects)
                
                return render_context(request, projects)
            
            except Project.DoesNotExist:
                return JsonResponse({'error': 'Project not found'}, status=404)
        
        return super().get(request, *args, **kwargs)
    
    # Handle POST request for index route /projects to create new Project
    def post(self, request, *args, **kwargs):
        title = request.POST.get('title')
        project_image = request.FILES.get("image")
        
        if not title:
            return JsonResponse({'error': 'Title not provided'}, status=400)
        
        
        if project_image:
            if not verify_image(project_image):
                return JsonResponse({
                    'error': 'Invalid profile image. Only JPEG, PNG, and GIF files are allowed.'
                }, status=400)
        
        try:
            project = Project.objects.create(title=title)
            if project_image:
                project.image = project_image
            
            project.save()
            
            # Retrieve the project again to get its pk
            project = Project.objects.get(pk=project.pk)
            project = annotate_single_queryset(project)
            
            return render(
                request,
                "components/projects_component.html",
                {
                    "project": project,
                },
                content_type = "application/html"
            )
        except Exception as e:
            print(e)
            JsonResponse({"error": "An error occured"}, status=400) 
    
    # helper Method to get annotated values for each project
    def get_annotated_projects(self, queryset):
        return queryset.annotate(
            total_tasks=Count('task'),
            completed_tasks=Count(Case(When(task__completed=True, then=1))),
            incomplete_tasks=Count(Case(When(task__completed=False, then=1))),
            completion_percentage=ExpressionWrapper(
                F('completed_tasks') * 100.0 / F('total_tasks'),
                output_field=FloatField()
            )
        ).order_by("-id")
    
#  Handle DELETE and PUT request call to endpoint /projects/project_id>
class EditDeleteProject (View):
    
    #  Handle PUT request to edit project title and replace image
    def put(self, request, pk, *args, **kwargs):
        
        data = MultiPartParser(request.META, request, request.upload_handlers).parse() # it will return a tuple object 
        new_title = data[0]['title'] if 'title' in data[0] else None
        new_project_image = data[1]['image'] if 'image' in data[1] else None
        
        if new_project_image:
            if not verify_image(new_project_image):
                return JsonResponse({
                    'error': 'Invalid profile image. Only JPEG, PNG, and GIF files are allowed.'
                }, status=400)
        
        
        try: 
            project = Project.objects.get(pk=pk)
            
            if new_project_image:
                project.image = new_project_image
            
            if new_title:
                project.title = new_title
            
            project.save()
            
            project = annotate_single_queryset(project)
            
            
            return render(
                request,
                "components/project_component.html",
                {
                    "project": project,
                },
                content_type = "application/html"
            )
        
        except Project.DoesNotExist:
            return JsonResponse({'error': 'project not found'}, status=404)
    
    #  handle DELETE request
    def delete(self, request, pk, *args, **kwargs):
        project = get_object_or_404(Project, pk=pk)
        project.delete()
        return JsonResponse({"msg": "Project successfully deleted"})
    
#  Hande POST request to create new task for a given project
class CreateTask(View):
    
    #handle POST request for endpoint /project_id/task
    def post (self, request, pk, *args, **kwargs):
        
        task_title = request.POST.get('title')
        description = request.POST.get('description')
        completed = request.POST.get('completed_task')
        completed_bool = True if completed == 'true' else False
        
        if not task_title:
            return JsonResponse({'error': 'Title not provided'}, status=400)
        
        try: 
            project = Project.objects.get(pk=pk)
            
            Task.objects.create(
                 title=task_title,
                description=description,
                completed=completed_bool,
                project_id=project
            )   
            # annotate values of the project
            project = annotate_single_queryset(project)
            return render(
                request,
                "components/project_component.html",
                {
                    "project": project,
                },
                content_type = "application/html"
            )
        
        except Project.DoesNotExist:
            return JsonResponse({'error': 'project not found'}, status=404)