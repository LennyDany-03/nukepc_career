from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'department',
            'location',
            'employment_type',
            'description',
            'skills',
            'min_salary',
            'max_salary',
            'salary_frequency',
            'application_deadline',
            'application_template',
            'status',
            'customize_resume',
            'customize_cover_letter',
            'customize_portfolio',
            'customize_phone',
            'created_by',
            'created_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
