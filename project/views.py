from django.views.generic import TemplateView


class HomePage(TemplateView):
    http_method_names = ["get"]
    template_name = "homepage.html"