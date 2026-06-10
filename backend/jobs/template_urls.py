from django.urls import path
from .template_views import get_template_config, update_template_config

urlpatterns = [
    path("", get_template_config, name="template-config-get"),
    path("update/", update_template_config, name="template-config-update"),
]
