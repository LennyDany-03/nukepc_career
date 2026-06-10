from rest_framework import serializers
from .models import JobTemplateConfig


class JobTemplateConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTemplateConfig
        fields = [
            "id",
            "department",
            "employment_type",
            "roles",
            "required_skills",
            "good_to_have_skills",
            "portfolio_label",
            "assignment_label",
            "screening_question_1",
            "screening_question_2",
            "screening_question_3",
            "extra_questions",
            "duration_options",
            "year_of_study_options",
            "probation_options",
            "notice_period_options",
            "shift_timing_options",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]
