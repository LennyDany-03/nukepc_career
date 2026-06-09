from rest_framework import serializers
from .models import ScreeningResult

class ScreeningResultSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='application.full_name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    job_department = serializers.CharField(source='application.job.department', read_only=True)
    applied_at = serializers.DateTimeField(source='application.created_at', read_only=True)

    class Meta:
        model = ScreeningResult
        fields = '__all__'
