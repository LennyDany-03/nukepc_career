from rest_framework import serializers
from .models import Application, Interview

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_department = serializers.CharField(source='job.department', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='application.full_name', read_only=True)
    candidate_email = serializers.CharField(source='application.email', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    job_department = serializers.CharField(source='application.job.department', read_only=True)
    application_stage = serializers.CharField(source='application.stage', read_only=True)
    application_status = serializers.CharField(source='application.status', read_only=True)

    class Meta:
        model = Interview
        fields = '__all__'
