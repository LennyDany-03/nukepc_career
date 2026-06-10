from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet

router = DefaultRouter()
router.register(r'', JobViewSet, basename='job')

urlpatterns = [
    path('create/', JobViewSet.as_view({'post': 'create'}), name='job-create'),
    path('', include(router.urls)),
]
