from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import trigger_screening, get_screening_results, ScreeningResultViewSet

router = DefaultRouter()
router.register(r'', ScreeningResultViewSet, basename='ats-results')

urlpatterns = [
    path('screen/<int:app_id>/', trigger_screening, name='trigger_screening'),
    path('results/<int:app_id>/', get_screening_results, name='get_screening_results'),
    path('', include(router.urls)),
]
