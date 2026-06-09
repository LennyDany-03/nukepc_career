from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Application, Interview
from .serializers import ApplicationSerializer, InterviewSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-created_at')
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().order_by('scheduled_at')
    serializer_class = InterviewSerializer
    permission_classes = [permissions.AllowAny]
