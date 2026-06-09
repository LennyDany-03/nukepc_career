from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from applications.models import Application
from .models import ScreeningResult
from .serializers import ScreeningResultSerializer
from .services import screen_application

@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Keep AllowAny for local testing/recruiter ease
def trigger_screening(request, app_id):
    try:
        application = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        
    try:
        screening = screen_application(application)
        serializer = ScreeningResultSerializer(screening)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Screening execution failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_screening_results(request, app_id):
    try:
        application = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=status.HTTP_444_NOT_FOUND)
        
    try:
        screening = ScreeningResult.objects.get(application=application)
    except ScreeningResult.DoesNotExist:
        # Auto-run screening on-demand if requested but not yet run
        try:
            screening = screen_application(application)
        except Exception as e:
            return Response({"error": f"Failed to auto-run screening: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    serializer = ScreeningResultSerializer(screening)
    return Response(serializer.data, status=status.HTTP_200_OK)

class ScreeningResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScreeningResult.objects.all().order_by('-score')
    serializer_class = ScreeningResultSerializer
    permission_classes = [permissions.AllowAny]
